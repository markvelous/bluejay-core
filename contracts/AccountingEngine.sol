// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface DebtAuctionLike {
  function startAuction(
    address stablecoinReceiver,
    uint256 initialGovernanceTokenBid,
    uint256 debtLotSize
  ) external returns (uint256 auctionId);

  function shutdown() external;

  function live() external returns (uint256);
}

interface SurplusAuctionLike {
  function startAuction(uint256 debtToSell, uint256 bidAmount)
    external
    returns (uint256 auctionId);

  function shutdown(uint256) external;

  function live() external returns (uint256);
}

interface LedgerLike {
  function debt(address) external view returns (uint256);

  function unbackedDebt(address) external view returns (uint256);

  function settleUnbackedDebt(uint256) external;

  function grantAllowance(address) external;

  function revokeAllowance(address) external;
}

contract AccountingEngine {
  // --- Data ---
  struct QueuedDebt {
    uint256 index; // Index in active auctions
    uint256 debt; // Amount of debt
    uint256 timestamp; // Time the debt was added
  }

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
  LedgerLike public ledger; // CDP Engine
  SurplusAuctionLike public surplusAuction; // Surplus Auction
  DebtAuctionLike public debtAuction; // Debt Auction

  uint256 public debtCount = 0;
  uint256[] public pendingDebts; // Array of debt waiting for delay
  mapping(uint256 => QueuedDebt) public debtQueue; // debt queue
  uint256 public totalQueuedDebt; // Debt waiting for delay            [rad]
  uint256 public totalDebtOnAuction; // On-auction debt        [rad]

  uint256 public popDebtDelay; // Debt auction delay             [seconds]
  uint256 public intialDebtAuctionBid; // Debt auction initial lot size  [wad]
  uint256 public debtAuctionLotSize; // Debt auction fixed bid size    [rad]

  uint256 public surplusAuctionLotSize; // Flap fixed lot size    [rad]
  uint256 public surplusBuffer; // Surplus buffer         [rad]

  uint256 public live; // Active Flag

  // --- Init ---
  constructor(
    address ledger_,
    address surplusAuction_,
    address debtAuction_
  ) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    surplusAuction = SurplusAuctionLike(surplusAuction_);
    debtAuction = DebtAuctionLike(debtAuction_);
    ledger.grantAllowance(surplusAuction_);
    live = 1;
  }

  // --- Math ---
  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    return x <= y ? x : y;
  }

  // --- Administration ---
  function updateIntialDebtAuctionBid(uint256 data) external isAuthorized {
    intialDebtAuctionBid = data;
  }

  function updateDebtAuctionLotSize(uint256 data) external isAuthorized {
    debtAuctionLotSize = data;
  }

  function updateSurplusBuffer(uint256 data) external isAuthorized {
    surplusBuffer = data;
  }

  function updatePopDebtDelay(uint256 data) external isAuthorized {
    popDebtDelay = data;
  }

  function updateSurplusAuctionLotSize(uint256 data) external isAuthorized {
    surplusAuctionLotSize = data;
  }

  function updateSurplusAuction(address data) external isAuthorized {
    ledger.revokeAllowance(address(surplusAuction));
    surplusAuction = SurplusAuctionLike(data);
    ledger.grantAllowance(data);
  }

  function updateDebtAuction(address data) external isAuthorized {
    debtAuction = DebtAuctionLike(data);
  }

  function removeDebtFromQueue(uint256 queueId) internal {
    uint256 lastDebtInList = pendingDebts[pendingDebts.length - 1];
    if (queueId != lastDebtInList) {
      // Swap auction to remove to last on the list
      uint256 _index = debtQueue[queueId].index;
      pendingDebts[_index] = lastDebtInList;
      debtQueue[lastDebtInList].index = _index;
    }
    pendingDebts.pop();
    delete debtQueue[queueId];
  }

  // Push to debt-queue
  function pushDebtToQueue(uint256 tab)
    external
    isAuthorized
    returns (uint256 queueId)
  {
    queueId = ++debtCount;

    pendingDebts.push(queueId);

    debtQueue[queueId].index = pendingDebts.length - 1;
    debtQueue[queueId].debt = tab;
    debtQueue[queueId].timestamp = block.timestamp;

    totalQueuedDebt = totalQueuedDebt + tab;
  }

  // Pop from debt-queue
  function popDebtFromQueue(uint256 queueId) external {
    require(
      debtQueue[queueId].timestamp + popDebtDelay <= block.timestamp,
      "AccountingEngine/popDebtDelay-not-finished"
    );
    totalQueuedDebt = totalQueuedDebt - debtQueue[queueId].debt;
    removeDebtFromQueue(queueId);
  }

  // Debt settlement
  function settleUnbackedDebt(uint256 rad) external {
    require(
      rad <= ledger.debt(address(this)),
      "AccountingEngine/insufficient-surplus"
    );
    require(
      rad <=
        ledger.unbackedDebt(address(this)) -
          totalQueuedDebt -
          totalDebtOnAuction,
      "AccountingEngine/insufficient-debt"
    );
    ledger.settleUnbackedDebt(rad);
  }

  function settleUnbackedDebtFromAuction(uint256 rad) external {
    require(
      rad <= totalDebtOnAuction,
      "AccountingEngine/not-enough-totalDebtOnAuction"
    );
    require(
      rad <= ledger.debt(address(this)),
      "AccountingEngine/insufficient-surplus"
    );
    totalDebtOnAuction = totalDebtOnAuction - rad;
    ledger.settleUnbackedDebt(rad);
  }

  // Debt auction
  function auctionDebt() external returns (uint256 id) {
    require(
      debtAuctionLotSize <=
        ledger.unbackedDebt(address(this)) -
          totalQueuedDebt -
          totalDebtOnAuction,
      "AccountingEngine/insufficient-debt"
    );
    require(
      ledger.debt(address(this)) == 0,
      "AccountingEngine/surplus-not-zero"
    );
    totalDebtOnAuction = totalDebtOnAuction + debtAuctionLotSize;
    id = debtAuction.startAuction(
      address(this),
      intialDebtAuctionBid,
      debtAuctionLotSize
    );
  }

  // Surplus auction
  function auctionSurplus() external returns (uint256 id) {
    require(
      ledger.debt(address(this)) >=
        ledger.unbackedDebt(address(this)) +
          surplusAuctionLotSize +
          surplusBuffer,
      "AccountingEngine/insufficient-surplus"
    );
    require(
      ledger.unbackedDebt(address(this)) -
        totalQueuedDebt -
        totalDebtOnAuction ==
        0,
      "AccountingEngine/debt-not-zero"
    );
    id = surplusAuction.startAuction(surplusAuctionLotSize, 0);
  }

  // The number of debts in the queue
  function countPendingDebts() external view returns (uint256) {
    return pendingDebts.length;
  }

  // Return the entire array of active auctions
  function listPendingDebts() external view returns (uint256[] memory) {
    return pendingDebts;
  }

  function shutdown() external isAuthorized {
    require(live == 1, "AccountingEngine/not-live");
    live = 0;
    totalQueuedDebt = 0;
    totalDebtOnAuction = 0;
    surplusAuction.shutdown(ledger.debt(address(surplusAuction)));
    debtAuction.shutdown();
    ledger.settleUnbackedDebt(
      min(ledger.debt(address(this)), ledger.unbackedDebt(address(this)))
    );
  }
}
