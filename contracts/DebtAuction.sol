// SPDX-License-IplaceBidifier: MIT
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

interface TokenLike {
  function mint(address, uint256) external;
}

interface AccountingEngineLike {
  function totalDebtOnAuction() external returns (uint256);

  function settleUnbackedDebtFromAuction(uint256) external;
}

contract DebtAuction {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "SurplusAuction/not-authorized"
    );
    _;
  }

  // --- Data ---
  struct Auction {
    uint256 index; // Index in active array
    uint256 debtLotSize; // unbacked stablecoin to recover from the auction       [rad]
    uint256 governanceTokenBid; // governanceTokens in return for debtLotSize  [wad]
    address highestBidder; // high bidder
    uint48 bidExpiry; // bid expiry time         [unix epoch time]
    uint48 auctionExpiry; // auction expiry time     [unix epoch time]
  }

  mapping(uint256 => Auction) public auctions;

  LedgerLike public ledger; // CDP Engine
  TokenLike public governanceToken;

  uint256 constant ONE = 1.00E18;
  uint256 public minBidIncrement = 1.05E18; // 5% minimum bid increase
  uint256 public restartMultiplier = 1.50E18; // 50% governanceTokenBid increase for restartAuction
  uint48 public maxBidDuration = 3 hours; // 3 hours bid lifetime         [seconds]
  uint48 public maxAuctionDuration = 2 days; // 2 days total auction length  [seconds]
  uint256 public auctionCount = 0;
  uint256 public live; // Active Flag
  uint256[] public activeAuctions; // Array of active auction ids
  address public accountingEngine; // not used until shutdown

  // --- Events ---
  event StartAuction(
    uint256 auctionId,
    uint256 governanceTokenBid,
    uint256 debtLotSize,
    address indexed bidder
  );

  // --- Init ---
  constructor(address ledger_, address governanceToken_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    governanceToken = TokenLike(governanceToken_);
    live = 1;
  }

  // --- Math ---
  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    if (x > y) {
      z = y;
    } else {
      z = x;
    }
  }

  // --- Admin ---
  function updateMinBidIncrement(uint256 data) external isAuthorized {
    require(data > ONE, "DebtAuction/min-bid-increment-lte-ONE");
    minBidIncrement = data;
  }

  function updateRestartMultiplier(uint256 data) external isAuthorized {
    require(data > ONE, "DebtAuction/restart-multiplier-lte-ONE");
    restartMultiplier = data;
  }

  function updateMaxBidDuration(uint48 data) external isAuthorized {
    maxBidDuration = data;
  }

  function updateMaxAuctionDuration(uint256 data) external isAuthorized {
    maxAuctionDuration = uint48(data);
  }

  // --- Auction ---
  function removeAuction(uint256 auctionId) internal {
    uint256 lastAuctionIdInList = activeAuctions[activeAuctions.length - 1];
    if (auctionId != lastAuctionIdInList) {
      // Swap auction to remove to last on the list
      uint256 _index = auctions[auctionId].index;
      activeAuctions[_index] = lastAuctionIdInList;
      auctions[lastAuctionIdInList].index = _index;
    }
    activeAuctions.pop();
    delete auctions[auctionId];
  }

  function startAuction(
    address stablecoinReceiver,
    uint256 initialGovernanceTokenBid,
    uint256 debtLotSize
  ) external isAuthorized returns (uint256 auctionId) {
    require(live == 1, "DebtAuction/not-live");
    auctionId = ++auctionCount;

    activeAuctions.push(auctionId);

    auctions[auctionId].index = activeAuctions.length - 1;
    auctions[auctionId].debtLotSize = debtLotSize;
    auctions[auctionId].governanceTokenBid = initialGovernanceTokenBid;
    auctions[auctionId].highestBidder = stablecoinReceiver;
    auctions[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;

    emit StartAuction(
      auctionId,
      initialGovernanceTokenBid,
      debtLotSize,
      stablecoinReceiver
    );
  }

  function restartAuction(uint256 auctionId) external {
    require(
      auctions[auctionId].auctionExpiry < block.timestamp,
      "DebtAuction/not-finished"
    );
    require(
      auctions[auctionId].bidExpiry == 0,
      "DebtAuction/bid-already-placed"
    );
    auctions[auctionId].governanceTokenBid =
      (restartMultiplier * auctions[auctionId].governanceTokenBid) /
      ONE;
    auctions[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;
  }

  function placeBid(
    uint256 auctionId,
    uint256 governanceTokenBid,
    uint256 debtLotSize
  ) external {
    require(live == 1, "DebtAuction/not-live");
    require(
      auctions[auctionId].highestBidder != address(0),
      "DebtAuction/highestBidder-not-set"
    );
    require(
      auctions[auctionId].bidExpiry > block.timestamp ||
        auctions[auctionId].bidExpiry == 0,
      "DebtAuction/already-finished-bidExpiry"
    );
    require(
      auctions[auctionId].auctionExpiry > block.timestamp,
      "DebtAuction/already-finished-end"
    );

    require(
      debtLotSize == auctions[auctionId].debtLotSize,
      "DebtAuction/not-matching-bid"
    );
    require(
      governanceTokenBid < auctions[auctionId].governanceTokenBid,
      "DebtAuction/governanceTokenBid-not-lower"
    );
    require(
      minBidIncrement * governanceTokenBid <=
        auctions[auctionId].governanceTokenBid * ONE,
      "DebtAuction/insufficient-decrease"
    );

    if (msg.sender != auctions[auctionId].highestBidder) {
      ledger.transferDebt(
        msg.sender,
        auctions[auctionId].highestBidder,
        debtLotSize
      );

      // on first placeBid, clear as much totalDebtOnAuction as possible
      if (auctions[auctionId].bidExpiry == 0) {
        uint256 totalDebtOnAuction = AccountingEngineLike(
          auctions[auctionId].highestBidder
        ).totalDebtOnAuction();
        AccountingEngineLike(auctions[auctionId].highestBidder)
          .settleUnbackedDebtFromAuction(min(debtLotSize, totalDebtOnAuction));
      }

      auctions[auctionId].highestBidder = msg.sender;
    }

    auctions[auctionId].governanceTokenBid = governanceTokenBid;
    auctions[auctionId].bidExpiry = uint48(block.timestamp) + maxBidDuration;
  }

  function settleAuction(uint256 auctionId) external {
    require(live == 1, "DebtAuction/not-live");
    require(
      auctions[auctionId].bidExpiry != 0 &&
        (auctions[auctionId].bidExpiry < block.timestamp ||
          auctions[auctionId].auctionExpiry < block.timestamp),
      "DebtAuction/not-finished"
    );
    governanceToken.mint(
      auctions[auctionId].highestBidder,
      auctions[auctionId].governanceTokenBid
    );
    removeAuction(auctionId);
  }

  // The number of active auctions
  function countActiveAuctions() external view returns (uint256) {
    return activeAuctions.length;
  }

  // Return the entire array of active auctions
  function listActiveAuctions() external view returns (uint256[] memory) {
    return activeAuctions;
  }

  // --- Shutdown ---
  function shutdown() external isAuthorized {
    live = 0;
    accountingEngine = msg.sender;
  }

  function emergencyBidWithdrawal(uint256 auctionId) external {
    require(live == 0, "DebtAuction/still-live");
    require(
      auctions[auctionId].highestBidder != address(0),
      "DebtAuction/highestBidder-not-set"
    );
    ledger.createUnbackedDebt(
      accountingEngine,
      auctions[auctionId].highestBidder,
      auctions[auctionId].debtLotSize
    );
    removeAuction(auctionId);
  }
}
