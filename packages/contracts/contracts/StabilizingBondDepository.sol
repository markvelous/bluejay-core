// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./library/ExponentMath.sol";
import "./BaseBondDepository.sol";

import "./interface/IStabilizingBondDepository.sol";
import "./interface/IMintableBurnableERC20.sol";
import "./interface/IPriceFeedOracle.sol";
import "./interface/IStablecoinEngine.sol";
import "./interface/ITwapOracle.sol";
import "./interface/ITreasury.sol";

import "./external/IUniswapV2Pair.sol";
import "./external/UniswapV2Library.sol";

contract StabilizingBondDepository is
  Initializable,
  OwnableUpgradeable,
  UUPSUpgradeable,
  BaseBondDepository,
  IStabilizingBondDepository
{
  using SafeERC20 for IERC20;
  using SafeERC20 for IMintableBurnableERC20;

  uint256 constant WAD = 10**18;
  uint256 constant RAY = 10**27;
  uint256 constant RAD = 10**45;

  IERC20 public BLU;
  IERC20 public reserve;
  IMintableBurnableERC20 public stablecoin;
  ITreasury public treasury;
  IStablecoinEngine public stablecoinEngine;

  // Oracles
  ITwapOracle public bluTwapOracle; // BLU/Reserve
  ITwapOracle public stablecoinTwapOracle; // Stablecoin/Reserve
  IPriceFeedOracle public stablecoinOracle; // Stablecoin/Reserve (quoted as stablecoins per reserve token)

  // Pool
  IUniswapV2Pair public pool;
  bool public reserveIsToken0; // cache for swap directions

  // Bond quote
  uint256 public tolerance; // [wad]
  uint256 public maxRewardFactor; // [wad]
  uint256 public controlVariable; // [wei]

  bool public isPurchasePaused;
  bool public isRedeemPaused;

  // Security note: vesting period should be much higher than the oracle period
  // This allow oracle to be updated before more bonds are purchased leading to overcorection
  function initialize(
    address _blu,
    address _reserve,
    address _stablecoin,
    address _treasury,
    address _stablecoinEngine,
    address _bluTwapOracle,
    address _stablecoinTwapOracle,
    address _stablecoinOracle,
    address _pool,
    uint256 _vestingPeriod
  ) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();

    BLU = IERC20(_blu);
    reserve = IERC20(_reserve);
    stablecoin = IMintableBurnableERC20(_stablecoin);

    treasury = ITreasury(_treasury);
    stablecoinEngine = IStablecoinEngine(_stablecoinEngine);
    bluTwapOracle = ITwapOracle(_bluTwapOracle);
    stablecoinTwapOracle = ITwapOracle(_stablecoinTwapOracle);
    stablecoinOracle = IPriceFeedOracle(_stablecoinOracle);
    pool = IUniswapV2Pair(_pool);

    vestingPeriod = _vestingPeriod;

    (address token0, ) = UniswapV2Library.sortTokens(_stablecoin, _reserve);
    reserveIsToken0 = _reserve == token0;
  }

  // Public functions
  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) public override returns (uint256 bondId) {
    require(!isPurchasePaused);

    // Update oracle
    stablecoinTwapOracle.tryUpdate();
    bluTwapOracle.tryUpdate();

    // Check that stabilizing bond is available
    (uint256 degree, bool isExpansionary, ) = getTwapDeviation();
    require(degree > tolerance);

    // Collect payments
    reserve.safeTransferFrom(msg.sender, address(this), amount);

    // Perform corrective actions
    if (isExpansionary) {
      // If expansionary:
      // - send reserve to treasury
      // - mint stablecoin at reference rate (stablecoinTwapOracle) to pool
      // - swap stablecoin for reserve
      reserve.safeTransfer(address(treasury), amount);
      uint256 stablecoinToMint = (amount * stablecoinOracle.getPrice()) / WAD;
      stablecoinEngine.mint(
        address(stablecoin),
        address(pool),
        stablecoinToMint
      );
      (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();

      uint256 amountOut = UniswapV2Library.getAmountOut(
        stablecoinToMint,
        reserveIsToken0 ? reserve1 : reserve0, // reserveIn
        reserveIsToken0 ? reserve0 : reserve1 // reserveOut
      );

      pool.swap(
        reserveIsToken0 ? amountOut : 0, // amount0Out
        reserveIsToken0 ? 0 : amountOut, // amount1Out
        address(treasury),
        new bytes(0)
      );
    } else {
      // If contractionary:
      // - send reserve to pool
      // - swap reserve for stablecoin
      // - burn stablecoin
      reserve.safeTransfer(address(pool), amount);
      (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
      uint256 amountOut = UniswapV2Library.getAmountOut(
        amount,
        reserveIsToken0 ? reserve0 : reserve1, // reserveIn
        reserveIsToken0 ? reserve1 : reserve0 // reserveOut
      );
      pool.swap(
        reserveIsToken0 ? 0 : amountOut, // amount0Out
        reserveIsToken0 ? amountOut : 0, // amount1Out
        address(this),
        new bytes(0)
      );
      stablecoin.burn(amountOut);
    }

    {
      // Check for overcorrection
      (uint256 degreeFinal, bool isExpansionaryFinal, ) = getSpotDeviation();
      require(isExpansionary == isExpansionaryFinal, "Overcorrection");
      require(degreeFinal < degree);
    }

    // Check if user is overpaying
    uint256 price = bondPrice();
    require(price < maxPrice, "Slippage");

    uint256 payout = (amount * WAD) / price;

    // Finally issue bonds
    treasury.mint(address(this), payout);
    bondId = _mint(recipient, payout);

    emit BondPurchased(bondId, recipient, amount, payout, price);
  }

  function redeem(uint256 bondId, address recipient)
    public
    override
    returns (uint256 payout)
  {
    require(!isRedeemPaused);
    require(bondOwners[bondId] == msg.sender);
    Bond memory bond = bonds[bondId];
    bool fullyRedeemed;
    uint256 principal;
    if (bond.lastRedeemed + bond.vestingPeriod <= block.timestamp) {
      _burn(bondId);
      fullyRedeemed = true;
      payout = bond.principal;
      BLU.safeTransfer(recipient, payout);
    } else {
      payout =
        (bond.principal * (block.timestamp - bond.lastRedeemed)) /
        bond.vestingPeriod;
      principal = bond.principal - payout;
      bonds[bondId] = Bond({
        id: bond.id,
        principal: principal,
        vestingPeriod: bond.vestingPeriod -
          (block.timestamp - bond.lastRedeemed),
        lastRedeemed: block.timestamp
      });
      BLU.safeTransfer(recipient, payout);
    }
    emit BondRedeemed(bondId, recipient, fullyRedeemed, payout, principal);
  }

  // Admin functions
  function setTolerance(uint256 _tolerance) public override onlyOwner {
    tolerance = _tolerance;
  }

  function setMaxRewardFactor(uint256 _maxRewardFactor)
    public
    override
    onlyOwner
  {
    maxRewardFactor = _maxRewardFactor;
  }

  function setControlVariable(uint256 _controlVariable)
    public
    override
    onlyOwner
  {
    controlVariable = _controlVariable;
  }

  function setBluTwapOracle(address _bluTwapOracle) public override onlyOwner {
    bluTwapOracle = ITwapOracle(_bluTwapOracle);
  }

  function setStablecoinTwapOracle(address _stablecoinTwapOracle)
    public
    override
    onlyOwner
  {
    stablecoinTwapOracle = ITwapOracle(_stablecoinTwapOracle);
  }

  function setIsRedeemPaused(bool pause) public override onlyOwner {
    isRedeemPaused = pause;
  }

  function setIsPurchasePaused(bool pause) public override onlyOwner {
    isPurchasePaused = pause;
  }

  function setStablecoinOracle(address _stablecoinOracle)
    public
    override
    onlyOwner
  {
    stablecoinOracle = IPriceFeedOracle(_stablecoinOracle);
  }

  // View functions
  function getReward(uint256 degree) public view override returns (uint256) {
    if (degree <= tolerance) return WAD;

    uint256 factor = (WAD + degree);
    uint256 rewardFactor = ExponentMath.rpow(factor, controlVariable, WAD);

    if (rewardFactor > maxRewardFactor) {
      return maxRewardFactor;
    }
    return rewardFactor;
  }

  function getCurrentReward() public view override returns (uint256) {
    (uint256 degree, , ) = getTwapDeviation();
    return getReward(degree);
  }

  function getTwapDeviation()
    public
    view
    override
    returns (
      uint256 degree,
      bool isExpansionary,
      uint256 stablecoinOut
    )
  {
    uint256 stablecoinIn = WAD;
    uint256 reserveOut = (stablecoinIn * WAD) / stablecoinOracle.getPrice();
    stablecoinOut = stablecoinTwapOracle.consult(address(reserve), reserveOut);
    if (stablecoinOut >= stablecoinIn) {
      degree = stablecoinOut - stablecoinIn;
      isExpansionary = false;
    } else {
      degree = stablecoinIn - stablecoinOut;
      isExpansionary = true;
    }
  }

  function getSpotDeviation()
    public
    view
    override
    returns (
      uint256 degree,
      bool isExpansionary,
      uint256 stablecoinOut
    )
  {
    uint256 stablecoinIn = WAD;
    uint256 reserveOut = (stablecoinIn * WAD) / stablecoinOracle.getPrice();
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
    stablecoinOut = UniswapV2Library.getAmountOut(
      reserveOut,
      reserveIsToken0 ? reserve0 : reserve1, // reserveIn
      reserveIsToken0 ? reserve1 : reserve0 // reserveOut
    );
    if (stablecoinOut >= stablecoinIn) {
      degree = stablecoinOut - stablecoinIn;
      isExpansionary = false;
    } else {
      degree = stablecoinIn - stablecoinOut;
      isExpansionary = true;
    }
  }

  function bondPrice() public view override returns (uint256 price) {
    (uint256 degree, , ) = getTwapDeviation();
    uint256 rewardFactor = getReward(degree);
    uint256 marketSwapAmount = bluTwapOracle.consult(address(BLU), WAD);
    price = (marketSwapAmount * WAD) / rewardFactor;
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyOwner
  {}
}
