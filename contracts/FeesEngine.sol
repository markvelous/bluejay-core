// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LedgerLike {
  function collateralTypes(bytes32)
    external
    returns (
      uint256 normalizedDebt, // [wad]
      uint256 accumulatedRate // [ray]
    );

  function updateAccumulatedRate(
    bytes32 collateralType,
    address debtDestination,
    int256 accumulatedRateDelta
  ) external;
}

contract FeesEngine {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(authorizedAccounts[msg.sender] == 1, "FeesEngine/not-authorized");
    _;
  }

  // --- Data ---
  struct CollateralType {
    uint256 stabilityFee; // Collateral-specific, per-second stability fee contribution [ray]
    uint256 lastUpdated; // Time of last drip [unix epoch time]
  }

  mapping(bytes32 => CollateralType) public collateralTypes;
  LedgerLike public ledger; // CDP Engine
  address public accountingEngine; // Debt Engine
  uint256 public globalStabilityFee; // Global, per-second stability fee contribution [ray]

  // --- Init ---
  constructor(address ledger_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
  }

  // --- Math ---
  function rpow(
    uint256 x,
    uint256 n,
    uint256 b
  ) internal pure returns (uint256 z) {
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

  uint256 constant ONE = 10**27;

  function diff(uint256 x, uint256 y) internal pure returns (int256 z) {
    z = int256(x) - int256(y);
    require(int256(x) >= 0 && int256(y) >= 0);
  }

  function rmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x * y;
    require(y == 0 || z / y == x);
    z = z / ONE;
  }

  // --- Administration ---
  function init(bytes32 collateralType) external isAuthorized {
    CollateralType storage collateralTypeData = collateralTypes[collateralType];
    require(
      collateralTypeData.stabilityFee == 0,
      "FeesEngine/collateralType-already-init"
    );
    collateralTypeData.stabilityFee = ONE;
    collateralTypeData.lastUpdated = block.timestamp;
  }

  function updateStabilityFee(bytes32 collateralType, uint256 data)
    external
    isAuthorized
  {
    updateAccumulatedRate(collateralType);
    require(
      block.timestamp == collateralTypes[collateralType].lastUpdated,
      "FeesEngine/lastUpdated-not-updated"
    );
    collateralTypes[collateralType].stabilityFee = data;
  }

  function updateGlobalStabilityFee(uint256 data) external isAuthorized {
    globalStabilityFee = data;
  }

  function updateAccountingEngine(address data) external isAuthorized {
    accountingEngine = data;
  }

  // --- Stability Fee Collection ---
  function updateAccumulatedRate(bytes32 collateralType)
    public
    returns (uint256 nextAccumulatedRate)
  {
    require(
      block.timestamp >= collateralTypes[collateralType].lastUpdated,
      "FeesEngine/invalid-block.timestamp"
    );
    (, uint256 lastAccumulatedRate) = ledger.collateralTypes(collateralType);
    nextAccumulatedRate = rmul(
      rpow(
        globalStabilityFee + collateralTypes[collateralType].stabilityFee,
        block.timestamp - collateralTypes[collateralType].lastUpdated,
        ONE
      ),
      lastAccumulatedRate
    );
    ledger.updateAccumulatedRate(
      collateralType,
      accountingEngine,
      diff(nextAccumulatedRate, lastAccumulatedRate)
    );
    collateralTypes[collateralType].lastUpdated = block.timestamp;
  }
}
