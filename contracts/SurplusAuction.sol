// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface CoreEngineLike {
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
    require(authorizedAccounts[msg.sender] == 1, "SurplusAuction/not-authorized");
    _;
  }

  // --- Data ---
  struct Bid {
    uint256 bidAmount; // governanceTokens paid               [wad]
    uint256 debtToSell; // debt in return for bid   [rad]
    address highestBidder; // high bidder
    uint48 bidExpiry; // bid expiry time         [unix epoch time]
    uint48 auctionExpiry; // auction expiry time     [unix epoch time]
  }

  mapping(uint256 => Bid) public bids;

  CoreEngineLike public coreEngine; // CDP Engine
  TokenLike public governanceToken;

  uint256 constant ONE = 1.00E18;
  uint256 public minBidIncrement = 1.05E18; // 5% minimum bid increase
  uint48 public maxBidDuration = 3 hours; // 3 hours bid duration         [seconds]
  uint48 public maxAuctionDuration = 2 days; // 2 days total auction length  [seconds]
  uint256 public auctionCount = 0;
  uint256 public live; // Active Flag

  // --- Events ---
  event StartAuction(uint256 auctionId, uint256 debtToSell, uint256 bidAmount);

  // --- Init ---
  constructor(address coreEngine_, address governanceToken_) {
    authorizedAccounts[msg.sender] = 1;
    coreEngine = CoreEngineLike(coreEngine_);
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
  function startAuction(uint256 debtToSell, uint256 bidAmount)
    external
    isAuthorized
    returns (uint256 id)
  {
    require(live == 1, "SurplusAuction/not-live");
    id = ++auctionCount;

    bids[id].bidAmount = bidAmount;
    bids[id].debtToSell = debtToSell;
    bids[id].highestBidder = msg.sender; // configurable??
    bids[id].auctionExpiry = uint48(block.timestamp) + maxAuctionDuration;

    coreEngine.transferDebt(msg.sender, address(this), debtToSell);

    emit StartAuction(id, debtToSell, bidAmount);
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

  function settleAuction(uint256 id) external {
    require(live == 1, "SurplusAuction/not-live");
    require(
      bids[id].bidExpiry != 0 &&
        (bids[id].bidExpiry < block.timestamp ||
          bids[id].auctionExpiry < block.timestamp),
      "SurplusAuction/not-finished"
    );
    coreEngine.transferDebt(
      address(this),
      bids[id].highestBidder,
      bids[id].debtToSell
    );
    governanceToken.burn(bids[id].bidAmount);
    delete bids[id];
  }

  function shutdown(uint256 rad) external isAuthorized {
    live = 0;
    coreEngine.transferDebt(address(this), msg.sender, rad);
  }

  function emergencyBidWithdrawal(uint256 id) external {
    require(live == 0, "SurplusAuction/still-live");
    require(
      bids[id].highestBidder != address(0),
      "SurplusAuction/highestBidder-not-set"
    );
    governanceToken.transferFrom(
      address(this),
      bids[id].highestBidder,
      bids[id].bidAmount
    );
    delete bids[id];
  }
}
