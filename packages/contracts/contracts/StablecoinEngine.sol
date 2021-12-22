// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interface/IStablecoinEngine.sol";
import "./interface/IMintableBurnableERC20.sol";
import "./interface/ITreasury.sol";

import "./external/IUniswapV2Factory.sol";
import "./external/IUniswapV2Pair.sol";
import "./external/UniswapV2Library.sol";

contract StablecoinEngine is
  Initializable,
  AccessControlUpgradeable,
  UUPSUpgradeable,
  IStablecoinEngine
{
  using SafeERC20 for IERC20;
  using SafeERC20 for IMintableBurnableERC20;
  uint256 constant WAD = 10**18;

  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  ITreasury public treasury;
  IUniswapV2Factory public poolFactory;

  mapping(address => mapping(address => address)) public override pools; // pools[reserve][stablecoin] = liquidityPoolAddress
  mapping(address => StablecoinPoolInfo) public override poolsInfo; // poolsInfo[liquidityPoolAddress] = StablecoinPoolInfo

  modifier ifPoolExists(address pool) {
    require(poolsInfo[pool].reserve != address(0), "Pool has not been added");
    _;
  }

  function initialize(address _treasury, address factory) public initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    treasury = ITreasury(_treasury);
    poolFactory = IUniswapV2Factory(factory);
  }

  function _storePoolInfo(
    address reserve,
    address stablecoin,
    address pool
  ) internal {
    pools[reserve][stablecoin] = pool;
    poolsInfo[pool] = StablecoinPoolInfo({
      reserve: reserve,
      stablecoin: stablecoin,
      pool: pool
    });

    emit PoolAdded(reserve, stablecoin, pool);
  }

  // Function assumes that safety checks have been performed, use calculateAmounts to prevent liquidity sniping
  function _addLiquidity(
    address pool,
    uint256 reserveAmount,
    uint256 stablecoinAmount
  ) internal ifPoolExists(pool) returns (uint256 liquidity) {
    StablecoinPoolInfo memory info = poolsInfo[pool];
    IMintableBurnableERC20(info.stablecoin).mint(pool, stablecoinAmount);
    treasury.withdraw(info.reserve, pool, reserveAmount);
    liquidity = IUniswapV2Pair(pool).mint(address(this));
    IUniswapV2Pair(pool).transfer(address(treasury), liquidity);
    emit LiquidityAdded(pool, liquidity, reserveAmount, stablecoinAmount);
  }

  function _removeLiquidity(address pool, uint256 liquidity)
    internal
    ifPoolExists(pool)
    returns (uint256 reserveAmount, uint256 stablecoinAmount)
  {
    StablecoinPoolInfo memory info = poolsInfo[pool];
    IUniswapV2Pair(pool).transfer(address(pool), liquidity);
    IUniswapV2Pair(pool).burn(address(this));
    stablecoinAmount = IMintableBurnableERC20(info.stablecoin).balanceOf(
      address(this)
    );
    IMintableBurnableERC20(info.stablecoin).burn(stablecoinAmount);
    reserveAmount = IERC20(info.reserve).balanceOf(address(this));
    IERC20(info.reserve).safeTransfer(address(treasury), reserveAmount);
    emit LiquidityRemoved(pool, liquidity, reserveAmount, stablecoinAmount);
  }

  // Manager functions
  function initializeStablecoin(
    address reserve,
    address stablecoin,
    uint256 initialReserveAmount,
    uint256 initialStablecoinAmount
  ) public override onlyRole(MANAGER_ROLE) returns (address poolAddress) {
    require(
      pools[reserve][stablecoin] == address(0),
      "Pool already initialized"
    );
    require(
      poolFactory.getPair(reserve, stablecoin) == address(0),
      "Pool already created"
    );
    poolAddress = poolFactory.createPair(reserve, stablecoin);
    _storePoolInfo(reserve, stablecoin, poolAddress);
    _addLiquidity(poolAddress, initialReserveAmount, initialStablecoinAmount);
  }

  function initializeExistingPool(address reserve, address stablecoin)
    public
    override
    onlyRole(MANAGER_ROLE)
  {
    // Used in cases where pool has been created by someone else
    address pool = poolFactory.getPair(reserve, stablecoin);
    require(pool != address(0), "Pool not created");
    _storePoolInfo(reserve, stablecoin, pool);
  }

  function addLiquidity(
    address pool,
    uint256 reserveAmountDesired,
    uint256 stablecoinAmountDesired,
    uint256 reserveAmountMin,
    uint256 stablecoinAmountMin
  )
    public
    override
    onlyRole(MANAGER_ROLE)
    ifPoolExists(pool)
    returns (uint256)
  {
    (uint256 reserveAmount, uint256 stablecoinAmount) = calculateAmounts(
      pool,
      reserveAmountDesired,
      stablecoinAmountDesired,
      reserveAmountMin,
      stablecoinAmountMin
    );
    return _addLiquidity(pool, reserveAmount, stablecoinAmount);
  }

  // TODO
  // Security note: is this vulnerable to flash attacks? need to specify min
  // See https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol#L103
  function removeLiquidity(address pool, uint256 liquidity)
    public
    override
    onlyRole(MANAGER_ROLE)
    ifPoolExists(pool)
    returns (uint256 reserveAmount, uint256 stablecoinAmount)
  {
    return _removeLiquidity(pool, liquidity);
  }

  // Operator functions
  function swap(
    address poolAddr,
    uint256 amountIn,
    uint256 minAmountOut,
    bool stablecoinForReserve
  )
    public
    override
    onlyRole(OPERATOR_ROLE)
    ifPoolExists(poolAddr)
    returns (uint256 amountOut)
  {
    StablecoinPoolInfo memory info = poolsInfo[poolAddr];
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
    (address token0, ) = UniswapV2Library.sortTokens(
      info.stablecoin,
      info.reserve
    );
    bool zeroForOne = stablecoinForReserve == (token0 == info.stablecoin);
    amountOut = UniswapV2Library.getAmountOut(
      amountIn,
      zeroForOne ? reserve0 : reserve1,
      zeroForOne ? reserve1 : reserve0
    );
    require(amountOut >= minAmountOut, "Insufficient output");

    if (stablecoinForReserve) {
      IMintableBurnableERC20(info.stablecoin).mint(poolAddr, amountIn);
    } else {
      treasury.withdraw(info.reserve, poolAddr, amountIn);
    }
    pool.swap(
      zeroForOne ? 0 : amountOut,
      zeroForOne ? amountOut : 0,
      stablecoinForReserve ? address(treasury) : address(this),
      new bytes(0)
    );

    if (!stablecoinForReserve) {
      IMintableBurnableERC20(info.stablecoin).burn(amountOut);
    }
  }

  function mint(
    address stablecoin,
    address to,
    uint256 amount
  ) public override onlyRole(MINTER_ROLE) {
    IMintableBurnableERC20(stablecoin).mint(to, amount);
  }

  // TODO: sweep stray tokens to Treasury

  // View functions
  function calculateAmounts(
    address poolAddr,
    uint256 reserveAmountDesired,
    uint256 stablecoinAmountDesired,
    uint256 reserveAmountMin,
    uint256 stablecoinAmountMin
  )
    public
    view
    override
    returns (uint256 reserveAmount, uint256 stablecoinAmount)
  {
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();

    if (reserve0 == 0 && reserve1 == 0) {
      (reserveAmount, stablecoinAmount) = (
        reserveAmountDesired,
        stablecoinAmountDesired
      );
    } else {
      StablecoinPoolInfo memory info = poolsInfo[poolAddr];
      (address token0, ) = UniswapV2Library.sortTokens(
        info.stablecoin,
        info.reserve
      );
      uint256 stablecoinAmountOptimal = token0 == info.stablecoin
        ? (reserveAmountDesired * reserve0) / reserve1
        : (reserveAmountDesired * reserve1) / reserve0;

      if (stablecoinAmountOptimal <= stablecoinAmountDesired) {
        require(
          stablecoinAmountOptimal >= stablecoinAmountMin,
          "Insufficient stablecoin"
        );
        (reserveAmount, stablecoinAmount) = (
          reserveAmountDesired,
          stablecoinAmountOptimal
        );
      } else {
        uint256 reserveAmountOptimal = token0 == info.stablecoin
          ? (stablecoinAmountDesired * reserve1) / reserve0
          : (stablecoinAmountDesired * reserve0) / reserve1;
        require(
          reserveAmountOptimal <= reserveAmountDesired,
          "Excessive reserve"
        );
        require(
          reserveAmountOptimal >= reserveAmountMin,
          "Insufficient reserve"
        );
        (reserveAmount, stablecoinAmount) = (
          reserveAmountOptimal,
          stablecoinAmountDesired
        );
      }
    }
  }

  function getReserves(address poolAddr)
    public
    view
    override
    returns (uint256 stablecoinReserve, uint256 reserveReserve)
  {
    IUniswapV2Pair pool = IUniswapV2Pair(poolAddr);
    StablecoinPoolInfo memory info = poolsInfo[poolAddr];
    (uint256 reserve0, uint256 reserve1, ) = pool.getReserves();
    (address token0, ) = UniswapV2Library.sortTokens(
      info.stablecoin,
      info.reserve
    );
    if (poolsInfo[poolAddr].stablecoin == token0) {
      (stablecoinReserve, reserveReserve) = (reserve0, reserve1);
    } else {
      (stablecoinReserve, reserveReserve) = (reserve1, reserve0);
    }
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(MANAGER_ROLE)
  {}
}
