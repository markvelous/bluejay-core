// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface DiscountCalculator {
  // 1st arg: initial price               [ray]
  // 2nd arg: seconds since auction start [seconds]
  // returns: current auction price       [ray]
  function discountPrice(uint256, uint256) external view returns (uint256);
}

contract StairstepExponentialDecrease is DiscountCalculator {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(authorizedAccounts[msg.sender] == 1, "Core/not-authorized");
    _;
  }

  // --- Data ---
  uint256 public step; // Length of time between price drops [seconds]
  uint256 public factorPerStep; // Per-step multiplicative factor     [ray]

  // --- Init ---
  // @notice: `factorPerStep` and `step` values must be correctly set for
  //     this contract to return a valid price
  constructor() {
    authorizedAccounts[msg.sender] = 1;
  }

  // --- Administration ---
  function updateFactorPerStep(uint256 data) external isAuthorized {
    require(data <= RAY, "StairstepExponentialDecrease/factorPerStep-gt-RAY");
    factorPerStep = data;
  }

  function updateStep(uint256 data) external isAuthorized {
    step = data;
  }

  // --- Math ---
  uint256 constant RAY = 10**27;

  function rmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x * y;
    require(y == 0 || z / y == x);
    z = z / RAY;
  }

  // optimized version from dss PR #78
  function rpow(
    uint256 x,
    uint256 n,
    uint256 b
  ) internal pure returns (uint256 z) {
    assembly {
      switch n
      case 0 {
        z := b
      }
      default {
        switch x
        case 0 {
          z := 0
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
            if shr(128, x) {
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
  }

  // initialPrice: initial price
  // timeElapsed: seconds since the auction has started
  // step: seconds between a price drop
  // factorPerStep: factorPerStep encodes the percentage to decrease per step.
  //   For efficiency, the values is set as (1 - (% value / 100)) * RAY
  //   So, for a 1% decrease per step, factorPerStep would be (1 - 0.01) * RAY
  //
  // returns: initialPrice * (factorPerStep ^ timeElapsed)
  //
  //
  function discountPrice(uint256 initialPrice, uint256 timeElapsed)
    external
    view
    override
    returns (uint256)
  {
    return rmul(initialPrice, rpow(factorPerStep, timeElapsed / step, RAY));
  }
}
