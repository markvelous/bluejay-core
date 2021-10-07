pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISavingsAccount {
  function savingsRate() external view returns (uint256);
}

interface IFeesEngine {
  function collateralTypes(bytes32 collateralType)
    external
    view
    returns (uint256 stabilityFee, uint256 lastUpdated);

  function globalStabilityFee() external view returns (uint256);
}

contract Helper {
  uint256 constant RAY = 10**27;

  function rpow(
    uint256 x,
    uint256 n,
    uint256 b
  ) public pure returns (uint256 z) {
    assembly {
      switch x
      case 0 {
        switch n
        case 0 {
          z := b
        }
        default {
          z := 0
        }
      }
      default {
        switch mod(n, 2)
        case 0 {
          z := b
        }
        default {
          z := x
        }
        let half := div(b, 2) // for rounding.
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
          x := div(xxRound, b)
          if mod(n, 2) {
            let zx := mul(z, x)
            if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) {
              revert(0, 0)
            }
            let zxRound := add(zx, half)
            if lt(zxRound, zx) {
              revert(0, 0)
            }
            z := div(zxRound, b)
          }
        }
      }
    }
  }

  function getStabilityFee(
    address feesEngineAddr,
    bytes32 collateralType,
    uint256 period
  ) public view returns (uint256) {
    IFeesEngine feesEngine = IFeesEngine(feesEngineAddr);
    (uint256 collateralStabilityFee, ) = feesEngine.collateralTypes(
      collateralType
    );
    uint256 perSecondRate = collateralStabilityFee +
      feesEngine.globalStabilityFee();
    return rpow(perSecondRate, period, RAY);
  }

  function getSavingsRate(address savingsAccountAddr, uint256 period)
    public
    view
    returns (uint256)
  {
    ISavingsAccount savingsAccount = ISavingsAccount(savingsAccountAddr);
    return rpow(savingsAccount.savingsRate(), period, RAY);
  }
}
