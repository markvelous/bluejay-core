// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./external/IUniswapV2Pair.sol";
import "./external/UniswapV2Library.sol";
import "./BaseBondDepository.sol";

interface ITwapOracle {
  function tryUpdate() external;

  function consult(address token, uint256 amountIn)
    external
    view
    returns (uint256 amountOut);
}

interface IMintableBurnableERC20 is IERC20 {
  function mint(address _to, uint256 _amount) external;

  function burn(uint256 amount) external;
}

interface IPriceFeedOracle {
  function getPrice() external view returns (uint256);
}

interface IStablecoinEngine {
  function mint(
    address stablecoin,
    address to,
    uint256 amount
  ) external;
}

interface ITreasury {
  function mint(address to, uint256 amount) external;

  function withdraw(
    address _token,
    address _to,
    uint256 _amount
  ) external;
}

contract StabilizingBondDepository is
  Initializable,
  OwnableUpgradeable,
  UUPSUpgradeable,
  BaseBondDepository
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

  // Security note: vesting period should be much higher than the oracle period
  // This allow oracle to be updated before more bonds are purchased leading to overcorection
  function initialize(
    address _blu,
    address _reserve,
    address _stablecoin,
    address _treasury,
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
    bluTwapOracle = ITwapOracle(_bluTwapOracle);
    stablecoinTwapOracle = ITwapOracle(_stablecoinTwapOracle);
    stablecoinOracle = IPriceFeedOracle(_stablecoinOracle);
    pool = IUniswapV2Pair(_pool);

    vestingPeriod = _vestingPeriod;

    (address token0, ) = UniswapV2Library.sortTokens(_stablecoin, _reserve);
    reserveIsToken0 = _reserve == token0;
  }

  function getReward(uint256 degree) public view returns (uint256) {
    if (degree <= tolerance) return WAD;

    uint256 factor = (WAD + degree);
    uint256 rewardFactor = rpow(factor, controlVariable, WAD);

    if (rewardFactor > maxRewardFactor) {
      return maxRewardFactor;
    }
    return rewardFactor;
  }

  function getCurrentReward() public view returns (uint256) {
    (uint256 degree, , ) = getDeviation();
    return getReward(degree);
  }

  function getDeviation()
    public
    view
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
      degree = ((stablecoinOut - stablecoinIn) * WAD) / stablecoinIn;
      isExpansionary = false;
    } else {
      degree = ((stablecoinIn - stablecoinOut) * WAD) / stablecoinIn;
      isExpansionary = true;
    }
  }

  function getSpotDeviation()
    public
    view
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
      degree = ((stablecoinOut - stablecoinIn) * WAD) / stablecoinIn;
      isExpansionary = false;
    } else {
      degree = ((stablecoinIn - stablecoinOut) * WAD) / stablecoinIn;
      isExpansionary = true;
    }
  }

  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) public returns (uint256 bondId) {
    // Update oracle
    stablecoinTwapOracle.tryUpdate();
    bluTwapOracle.tryUpdate();

    // Check that stabilizing bond is available
    (uint256 degree, bool isExpansionary, ) = getDeviation();
    require(degree > tolerance, "Price deviation within tolerance");

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
      stablecoin.mint(address(pool), stablecoinToMint);
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
      require(degreeFinal < degree, "Greater deviation after swap");
    }

    // Calculate discount using bluTwapOracle and percentage deviation
    uint256 rewardFactor = getReward(degree);
    uint256 marketSwapAmount = bluTwapOracle.consult(address(reserve), amount);
    uint256 amountWithReward = (rewardFactor * marketSwapAmount) / WAD;

    // Finally issue bonds
    treasury.mint(address(this), amountWithReward);
    bondId = _mint(recipient, amountWithReward);
  }

  function redeem(uint256 bondId, address recipient) public {
    require(bondOwners[bondId] == msg.sender, "Not owner of bond");
    Bond memory bond = bonds[bondId];
    if (bond.lastRedeemed + bond.vestingPeriod <= block.timestamp) {
      _burn(bondId);
      BLU.safeTransfer(recipient, bond.principal);
    } else {
      uint256 payout = (bond.principal *
        (block.timestamp - bond.lastRedeemed)) / bond.vestingPeriod;
      bonds[bondId] = Bond({
        id: bond.id,
        principal: bond.principal - payout,
        vestingPeriod: bond.vestingPeriod -
          (block.timestamp - bond.lastRedeemed),
        lastRedeemed: block.timestamp
      });
      BLU.safeTransfer(recipient, payout);
    }
  }

  // Admin function
  function setTolerance(uint256 _tolerance) public onlyOwner {
    require(_tolerance <= WAD, "Tolerance greater than 1");
    tolerance = _tolerance;
  }

  function setMaxRewardFactor(uint256 _maxRewardFactor) public onlyOwner {
    require(_maxRewardFactor >= WAD, "Reward factor less than 1");
    maxRewardFactor = _maxRewardFactor;
  }

  function setControlVariable(uint256 _controlVariable) public onlyOwner {
    require(_controlVariable >= 1, "Control variable less than 1");
    require(_controlVariable < 1000, "Control variable too high");
    controlVariable = _controlVariable;
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyOwner
  {}

  // Math
  function rpow(
    uint256 x,
    uint256 n,
    uint256 base
  ) internal pure returns (uint256 z) {
    assembly {
      switch x
      case 0 {
        switch n
        case 0 {
          z := base
        }
        default {
          z := 0
        }
      }
      default {
        switch mod(n, 2)
        case 0 {
          z := base
        }
        default {
          z := x
        }
        let half := div(base, 2) // for rounding.
        for {
          n := div(n, 2)
        } n {
          n := div(n, 2)
        } {
          let xx := mul(x, x)
          if iszero(eq(div(xx, x), x)) {
            revert(0, 0)
          }
          let xxRound := add(xx, half)
          if lt(xxRound, xx) {
            revert(0, 0)
          }
          x := div(xxRound, base)
          if mod(n, 2) {
            let zx := mul(z, x)
            if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) {
              revert(0, 0)
            }
            let zxRound := add(zx, half)
            if lt(zxRound, zx) {
              revert(0, 0)
            }
            z := div(zxRound, base)
          }
        }
      }
    }
  }
}
