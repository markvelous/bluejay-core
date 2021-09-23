// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LedgerLike {
  function transferDebt(
    address,
    address,
    uint256
  ) external;
}

interface TokenLike {
  function transferFrom(
    address,
    address,
    uint256
  ) external;

  function burn(uint256) external;
}

/*
   This thing lets you sell some debt in return for governanceTokens.
 - `debtToSell` debt in return for bid
 - `bid` governanceTokens paid
 - `maxBidDuration` single bid lifetime
 - `minBidIncrement` minimum bid increase
 - `end` max auction duration
*/

contract SurplusAuction {
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
  struct Bid {
    uint256 index; // Index in active auctions
    uint256 bidAmount; // governanceTokens paid               [wad]
    uint256 debtToSell; // debt in return for bid   [rad]
    address highestBidder; // high bidder
    uint48 bidExpiry; // bid expiry time         [unix epoch time]
    uint48 auctionExpiry; // auction expiry time     [unix epoch time]
  }

  mapping(uint256 => Bid) public bids;

  LedgerLike public ledger; // CDP Engine
  TokenLike public governanceToken;

  uint256 constant ONE = 1.00E18;
  uint256 public minBidIncrement = 1.05E18; // 5% minimum bid increase
  uint48 public maxBidDuration = 3 hours; // 3 hours bid duration         [seconds]
  uint48 public maxAuctionDuration = 2 days; // 2 days total auction length  [seconds]
  uint256 public auctionCount = 0;
  uint256[] public activeAuctions; // Array of active auction ids
  uint256 public live; // Active Flag

  // --- Events ---
  event StartAuction(uint256 auctionId, uint256 debtToSell, uint256 bidAmount);

  // --- Init ---
  constructor(address ledger_, address governanceToken_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    governanceToken = TokenLike(governanceToken_);
    live = 1;
  }

  // --- Admin ---
  function updateMinBidIncrement(uint256 data) external isAuthorized {
    minBidIncrement = data;
  }

  function updateMaxBidDuration(uint256 data) external isAuthorized {
    maxBidDuration = uint48(data);
  }

  function updateMaxAuctionDuration(uint256 data) external isAuthorized {
    maxAuctionDuration = uint48(data);
  }

  // --- Auction ---
  function removeAuction(uint256 auctionId) internal {
    uint256 lastAuctionIdInList = activeAuctions[activeAuctions.length - 1];
    if (auctionId != lastAuctionIdInList) {
      // Swap auction to remove to last on the list
      uint256 _index = bids[auctionId].index;
      activeAuctions[_index] = lastAuctionIdInList;
      bids[lastAuctionIdInList].index = _index;
    }
    activeAuctions.pop();
    delete bids[auctionId];
  }

  function startAuction(uint256 debtToSell, uint256 bidAmount)
    external
    isAuthorized
    returns (uint256 auctionId)
  {
    require(live == 1, "SurplusAuction/not-live");
    auctionId = ++auctionCount;

    activeAuctions.push(auctionId);

    bids[auctionId].index = activeAuctions.length - 1;
    bids[auctionId].bidAmount = bidAmount;
    bids[auctionId].debtToSell = debtToSell;
    bids[auctionId].highestBidder = msg.sender; // configurable??
    bids[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;

    ledger.transferDebt(msg.sender, address(this), debtToSell);

    emit StartAuction(auctionId, debtToSell, bidAmount);
  }

  function restartAuction(uint256 auctionId) external {
    require(
      bids[auctionId].auctionExpiry < block.timestamp,
      "SurplusAuction/not-finished"
    );
    require(
      bids[auctionId].bidExpiry == 0,
      "SurplusAuction/bid-already-placed"
    );
    bids[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;
  }

  function placeBid(
    uint256 auctionId,
    uint256 debtToSell,
    uint256 bidAmount
  ) external {
    require(live == 1, "SurplusAuction/not-live");
    require(
      bids[auctionId].highestBidder != address(0),
      "SurplusAuction/highestBidder-not-set"
    );
    require(
      bids[auctionId].bidExpiry > block.timestamp ||
        bids[auctionId].bidExpiry == 0,
      "SurplusAuction/already-finished-bidExpiry"
    );
    require(
      bids[auctionId].auctionExpiry > block.timestamp,
      "SurplusAuction/already-finished-end"
    );

    require(
      debtToSell == bids[auctionId].debtToSell,
      "SurplusAuction/debtToSell-not-matching"
    );
    require(
      bidAmount > bids[auctionId].bidAmount,
      "SurplusAuction/bid-not-higher"
    );
    require(
      bidAmount * ONE >= minBidIncrement * bids[auctionId].bidAmount,
      "SurplusAuction/insufficient-increase"
    );

    if (msg.sender != bids[auctionId].highestBidder) {
      governanceToken.transferFrom(
        msg.sender,
        bids[auctionId].highestBidder,
        bids[auctionId].bidAmount
      );
      bids[auctionId].highestBidder = msg.sender;
    }
    governanceToken.transferFrom(
      msg.sender,
      address(this),
      bidAmount - bids[auctionId].bidAmount
    );

    bids[auctionId].bidAmount = bidAmount;
    bids[auctionId].bidExpiry = uint48(block.timestamp) + maxBidDuration;
  }

  function settleAuction(uint256 auctionId) external {
    require(live == 1, "SurplusAuction/not-live");
    require(
      bids[auctionId].bidExpiry != 0 &&
        (bids[auctionId].bidExpiry < block.timestamp ||
          bids[auctionId].auctionExpiry < block.timestamp),
      "SurplusAuction/not-finished"
    );
    ledger.transferDebt(
      address(this),
      bids[auctionId].highestBidder,
      bids[auctionId].debtToSell
    );
    governanceToken.burn(bids[auctionId].bidAmount);
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

  function shutdown(uint256 rad) external isAuthorized {
    live = 0;
    ledger.transferDebt(address(this), msg.sender, rad);
  }

  function emergencyBidWithdrawal(uint256 auctionId) external {
    require(live == 0, "SurplusAuction/still-live");
    require(
      bids[auctionId].highestBidder != address(0),
      "SurplusAuction/highestBidder-not-set"
    );
    governanceToken.transferFrom(
      address(this),
      bids[auctionId].highestBidder,
      bids[auctionId].bidAmount
    );
    removeAuction(auctionId);
  }
}
