// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LedgerLike {
  function transferDebt(
    address,
    address,
    uint256
  ) external;

  function createUnbackedDebt(
    address,
    address,
    uint256
  ) external;
}

contract SavingsAccount {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized isLive {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized isLive {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "SavingsAccount/not-authorized"
    );
    _;
  }

  modifier isLive() {
    require(live == 1, "SavingsAccount/not-live");
    _;
  }

  // --- Data ---
  mapping(address => uint256) public savings; // Normalised Savings [wad]

  uint256 public totalSavings; // Total Normalised Savings  [wad]
  uint256 public savingsRate; // The Savings Rate          [ray]
  uint256 public accumulatedRates; // The Rate Accumulator          [ray]

  LedgerLike public ledger; // CDP Engine
  address public accountingEngine; // Debt Engine
  uint256 public lastUpdated; // Time of last drip     [unix epoch time]

  uint256 public live; // Active Flag

  // --- Init ---
  constructor(address ledger_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    savingsRate = ONE;
    accumulatedRates = ONE;
    lastUpdated = block.timestamp;
    live = 1;
  }

  // --- Math ---
  uint256 constant ONE = 10**27;

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

  function rmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = (x * y) / ONE;
  }

  // --- Administration ---

  function updateSavingsRate(uint256 data) external isAuthorized isLive {
    updateAccumulatedRate();
    require(
      block.timestamp == lastUpdated,
      "SavingsAccount/lastUpdated-not-updated"
    );
    savingsRate = data;
  }

  function updateAccountingEngine(address addr) external isAuthorized {
    accountingEngine = addr;
  }

  function shutdown() external isAuthorized {
    live = 0;
    savingsRate = ONE;
  }

  // --- Savings Rate Accumulation ---
  function updateAccumulatedRate()
    public
    returns (uint256 nextAccumulatedRate)
  {
    require(
      block.timestamp >= lastUpdated,
      "SavingsAccount/invalid-block.timestamp"
    );
    nextAccumulatedRate = rmul(
      rpow(savingsRate, block.timestamp - lastUpdated, ONE),
      accumulatedRates
    );
    uint256 accumulatedRates_ = nextAccumulatedRate - accumulatedRates;
    accumulatedRates = nextAccumulatedRate;
    lastUpdated = block.timestamp;
    ledger.createUnbackedDebt(
      address(accountingEngine),
      address(this),
      totalSavings * accumulatedRates_
    );
  }

  // --- Savings Management ---
  function join(uint256 wad) external {
    updateAccumulatedRate();
    require(
      block.timestamp == lastUpdated,
      "SavingsAccount/lastUpdated-not-updated"
    );
    savings[msg.sender] = savings[msg.sender] + wad;
    totalSavings = totalSavings + wad;
    ledger.transferDebt(msg.sender, address(this), accumulatedRates * wad);
  }

  function exit(uint256 wad) external {
    savings[msg.sender] = savings[msg.sender] - wad;
    totalSavings = totalSavings - wad;
    ledger.transferDebt(address(this), msg.sender, accumulatedRates * wad);
  }
}
