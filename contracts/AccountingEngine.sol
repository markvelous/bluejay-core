// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface DebtAuctionLike {
  function startAuction(
    address gal,
    uint256 lot,
    uint256 bid
  ) external returns (uint256);

  function shutdown() external;

  function live() external returns (uint256);
}

interface SurplusAuctionLike {
  function startAuction(uint256 debtToSell, uint256 bidAmount)
    external
    returns (uint256);

  function shutdown(uint256) external;

  function live() external returns (uint256);
}

interface CoreEngineLike {
  function debt(address) external view returns (uint256);

  function unbackedDebt(address) external view returns (uint256);

  function settleDebt(uint256) external;

  function grantAllowance(address) external;

  function revokeAllowance(address) external;
}

contract AccountingEngine {
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
  CoreEngineLike public coreEngine; // CDP Engine
  SurplusAuctionLike public surplusAuction; // Surplus Auction
  DebtAuctionLike public debtAuction; // Debt Auction

  mapping(uint256 => uint256) public debtQueue; // debt queue
  uint256 public totalQueuedDebt; // Queued debt            [rad]
  uint256 public totalOnAuctionDebt; // On-auction debt        [rad]

  uint256 public popDebtDelay; // Debt auction delay             [seconds]
  uint256 public debtLotSize; // Debt auction initial lot size  [wad]
  uint256 public debtBidSize; // Debt auction fixed bid size    [rad]

  uint256 public surplusLotSize; // Flap fixed lot size    [rad]
  uint256 public surplusBuffer; // Surplus buffer         [rad]

  uint256 public live; // Active Flag

  // --- Init ---
  constructor(
    address coreEngine_,
    address surplusAuction_,
    address debtAuction_
  ) {
    authorizedAccounts[msg.sender] = 1;
    coreEngine = CoreEngineLike(coreEngine_);
    surplusAuction = SurplusAuctionLike(surplusAuction_);
    debtAuction = DebtAuctionLike(debtAuction_);
    coreEngine.grantAllowance(surplusAuction_);
    live = 1;
  }

  // --- Math ---
  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    return x <= y ? x : y;
  }

  // --- Administration ---
  function updateDebtLotSize(uint256 data) external isAuthorized {
    debtLotSize = data;
  }

  function updateDebtBidSize(uint256 data) external isAuthorized {
    debtBidSize = data;
  }

  function updateSurplusBuffer(uint256 data) external isAuthorized {
    surplusBuffer = data;
  }

  function updatePopDebtDelay(uint256 data) external isAuthorized {
    popDebtDelay = data;
  }

  function updateSurplusLotSize(uint256 data) external isAuthorized {
    surplusLotSize = data;
  }

  function updateSurplusAuction(address data) external isAuthorized {
    coreEngine.revokeAllowance(address(surplusAuction));
    surplusAuction = SurplusAuctionLike(data);
    coreEngine.grantAllowance(data);
  }

  function updateDebtAuction(address data) external isAuthorized {
    debtAuction = DebtAuctionLike(data);
  }

  // Push to debt-queue
  function pushDebtToQueue(uint256 tab) external isAuthorized {
    debtQueue[block.timestamp] = debtQueue[block.timestamp] + tab;
    totalQueuedDebt = totalQueuedDebt + tab;
  }

  // Pop from debt-queue
  function popDebtFromQueue(uint256 era) external {
    require(
      era + popDebtDelay <= block.timestamp,
      "AccountingEngine/popDebtDelay-not-finished"
    );
    totalQueuedDebt = totalQueuedDebt - debtQueue[era];
    debtQueue[era] = 0;
  }

  // Debt settlement
  function settleDebt(uint256 rad) external {
    require(
      rad <= coreEngine.debt(address(this)),
      "AccountingEngine/insufficient-surplus"
    );
    require(
      rad <=
        coreEngine.unbackedDebt(address(this)) -
          totalQueuedDebt -
          totalOnAuctionDebt,
      "AccountingEngine/insufficient-debt"
    );
    coreEngine.settleDebt(rad);
  }

  function netDebtWithSurplus(uint256 rad) external {
    require(rad <= totalOnAuctionDebt, "AccountingEngine/not-enough-ash");
    require(
      rad <= coreEngine.debt(address(this)),
      "AccountingEngine/insufficient-surplus"
    );
    totalOnAuctionDebt = totalOnAuctionDebt - rad;
    coreEngine.settleDebt(rad);
  }

  // Debt auction
  function auctionDebt() external returns (uint256 id) {
    require(
      debtBidSize <=
        coreEngine.unbackedDebt(address(this)) -
          totalQueuedDebt -
          totalOnAuctionDebt,
      "AccountingEngine/insufficient-debt"
    );
    require(
      coreEngine.debt(address(this)) == 0,
      "AccountingEngine/surplus-not-zero"
    );
    totalOnAuctionDebt = totalOnAuctionDebt + debtBidSize;
    id = debtAuction.startAuction(address(this), debtLotSize, debtBidSize);
  }

  // Surplus auction
  function auctionSurplus() external returns (uint256 id) {
    require(
      coreEngine.debt(address(this)) >=
        coreEngine.unbackedDebt(address(this)) +
          surplusLotSize +
          surplusBuffer,
      "AccountingEngine/insufficient-surplus"
    );
    require(
      coreEngine.unbackedDebt(address(this)) -
        totalQueuedDebt -
        totalOnAuctionDebt ==
        0,
      "AccountingEngine/debt-not-zero"
    );
    id = surplusAuction.startAuction(surplusLotSize, 0);
  }

  function shutdown() external isAuthorized {
    require(live == 1, "AccountingEngine/not-live");
    live = 0;
    totalQueuedDebt = 0;
    totalOnAuctionDebt = 0;
    surplusAuction.shutdown(coreEngine.debt(address(surplusAuction)));
    debtAuction.shutdown();
    coreEngine.settleDebt(
      min(
        coreEngine.debt(address(this)),
        coreEngine.unbackedDebt(address(this))
      )
    );
  }
}
