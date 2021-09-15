// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface DebtAuctionHouseLike {
  function startAuction(
    address gal,
    uint256 lot,
    uint256 bid
  ) external returns (uint256);

  function shutdown() external;

  function live() external returns (uint256);
}

interface SurplusAuctionHouseLike {
  function startAuction(uint256 lot, uint256 bid) external returns (uint256);

  function shutdown(uint256) external;

  function live() external returns (uint256);
}

interface CoreEngineLike {
  function debt(address) external view returns (uint256);

  function unbackedStablecoin(address) external view returns (uint256);

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
  SurplusAuctionHouseLike public surplusAuctionHouse; // Surplus Auction House
  DebtAuctionHouseLike public debtAuctionHouse; // Debt Auction House

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
    address surplusAuctionHouse_,
    address debtAuctionHouse_
  ) {
    authorizedAccounts[msg.sender] = 1;
    coreEngine = CoreEngineLike(coreEngine_);
    surplusAuctionHouse = SurplusAuctionHouseLike(surplusAuctionHouse_);
    debtAuctionHouse = DebtAuctionHouseLike(debtAuctionHouse_);
    coreEngine.grantAllowance(surplusAuctionHouse_);
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

  function updateSurplusAuctionHouse(address data) external isAuthorized {
    coreEngine.revokeAllowance(address(surplusAuctionHouse));
    surplusAuctionHouse = SurplusAuctionHouseLike(data);
    coreEngine.grantAllowance(data);
  }

  function updateDebtAuctionHouse(address data) external isAuthorized {
    debtAuctionHouse = DebtAuctionHouseLike(data);
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
        coreEngine.unbackedStablecoin(address(this)) -
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
        coreEngine.unbackedStablecoin(address(this)) -
          totalQueuedDebt -
          totalOnAuctionDebt,
      "AccountingEngine/insufficient-debt"
    );
    require(
      coreEngine.debt(address(this)) == 0,
      "AccountingEngine/surplus-not-zero"
    );
    totalOnAuctionDebt = totalOnAuctionDebt + debtBidSize;
    id = debtAuctionHouse.startAuction(address(this), debtLotSize, debtBidSize);
  }

  // Surplus auction
  function auctionSurplus() external returns (uint256 id) {
    require(
      coreEngine.debt(address(this)) >=
        coreEngine.unbackedStablecoin(address(this)) +
          surplusLotSize +
          surplusBuffer,
      "AccountingEngine/insufficient-surplus"
    );
    require(
      coreEngine.unbackedStablecoin(address(this)) -
        totalQueuedDebt -
        totalOnAuctionDebt ==
        0,
      "AccountingEngine/debt-not-zero"
    );
    id = surplusAuctionHouse.startAuction(surplusLotSize, 0);
  }

  function shutdown() external isAuthorized {
    require(live == 1, "AccountingEngine/not-live");
    live = 0;
    totalQueuedDebt = 0;
    totalOnAuctionDebt = 0;
    surplusAuctionHouse.shutdown(coreEngine.debt(address(surplusAuctionHouse)));
    debtAuctionHouse.shutdown();
    coreEngine.settleDebt(
      min(
        coreEngine.debt(address(this)),
        coreEngine.unbackedStablecoin(address(this))
      )
    );
  }
}
