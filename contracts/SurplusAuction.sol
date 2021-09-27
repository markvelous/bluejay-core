// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

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

contract SurplusAuction is Initializable {
  uint256 constant ONE = 1.00E18;

  // --- Data ---
  struct Auction {
    uint256 index; // Index in active auctions
    uint256 bidAmount; // governanceTokens paid               [wad]
    uint256 debtToSell; // debt in return for bid   [rad]
    address highestBidder; // high bidder
    uint48 bidExpiry; // bid expiry time         [unix epoch time]
    uint48 auctionExpiry; // auction expiry time     [unix epoch time]
  }

  mapping(address => uint256) public authorizedAccounts;
  mapping(uint256 => Auction) public auctions;

  LedgerLike public ledger; // CDP Engine
  TokenLike public governanceToken;

  uint256 public minBidIncrement; // minimum bid increase [wad]
  uint48 public maxBidDuration; // bid duration         [seconds]
  uint48 public maxAuctionDuration; // total auction length  [seconds]
  uint256 public auctionCount;
  uint256[] public activeAuctions; // Array of active auction ids
  uint256 public live; // Active Flag

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event UpdateParameter(bytes32 indexed parameter, uint256 data);
  event StartAuction(
    uint256 indexed auctionId,
    address indexed initialBidder,
    uint256 auctionExpiry,
    uint256 debtLotSize,
    uint256 initialGovernanceTokenBid
  );
  event RestartAuction(uint256 indexed auctionId, uint256 auctionExpiry);
  event PlaceBid(
    uint256 indexed auctionId,
    address indexed bidder,
    uint256 governanceTokenBid,
    uint256 debtLotSize,
    uint256 auctionExpiry
  );
  event SettleAuction(
    uint256 indexed auctionId,
    address indexed winningBidder,
    uint256 governanceTokenBurned
  );
  event EmergencyCloseAuction(
    uint256 indexed auctionId,
    address indexed refundAddress,
    uint256 governanceTokenRefunded
  );

  // --- Init ---
  function initialize(address ledger_, address governanceToken_)
    public
    initializer
  {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    governanceToken = TokenLike(governanceToken_);
    live = 1;
    emit GrantAuthorization(msg.sender);

    minBidIncrement = 1.05E18; // 5% minimum bid increase
    maxBidDuration = 3 hours; // 3 hours bid duration         [seconds]
    maxAuctionDuration = 2 days; // 2 days total auction length  [seconds]
  }

  // --- Auth ---
  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
    emit GrantAuthorization(user);
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
    emit RevokeAuthorization(user);
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "SurplusAuction/not-authorized"
    );
    _;
  }

  // --- Admin ---
  function updateMinBidIncrement(uint256 data) external isAuthorized {
    minBidIncrement = data;
    emit UpdateParameter("minBidIncrement", data);
  }

  function updateMaxBidDuration(uint256 data) external isAuthorized {
    maxBidDuration = uint48(data);
    emit UpdateParameter("maxBidDuration", data);
  }

  function updateMaxAuctionDuration(uint256 data) external isAuthorized {
    maxAuctionDuration = uint48(data);
    emit UpdateParameter("maxAuctionDuration", data);
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

  function startAuction(uint256 debtToSell, uint256 bidAmount)
    external
    isAuthorized
    returns (uint256 auctionId)
  {
    require(live == 1, "SurplusAuction/not-live");
    auctionId = ++auctionCount;

    activeAuctions.push(auctionId);

    auctions[auctionId].index = activeAuctions.length - 1;
    auctions[auctionId].bidAmount = bidAmount;
    auctions[auctionId].debtToSell = debtToSell;
    auctions[auctionId].highestBidder = msg.sender; // configurable??
    auctions[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;

    ledger.transferDebt(msg.sender, address(this), debtToSell);

    emit StartAuction(
      auctionId,
      msg.sender,
      auctions[auctionId].auctionExpiry,
      debtToSell,
      bidAmount
    );
  }

  function restartAuction(uint256 auctionId) external {
    require(
      auctions[auctionId].auctionExpiry < block.timestamp,
      "SurplusAuction/not-finished"
    );
    require(
      auctions[auctionId].bidExpiry == 0,
      "SurplusAuction/bid-already-placed"
    );
    auctions[auctionId].auctionExpiry =
      uint48(block.timestamp) +
      maxAuctionDuration;
    emit RestartAuction(auctionId, auctions[auctionId].auctionExpiry);
  }

  function placeBid(
    uint256 auctionId,
    uint256 debtToSell,
    uint256 bidAmount
  ) external {
    require(live == 1, "SurplusAuction/not-live");
    require(
      auctions[auctionId].highestBidder != address(0),
      "SurplusAuction/highestBidder-not-set"
    );
    require(
      auctions[auctionId].bidExpiry > block.timestamp ||
        auctions[auctionId].bidExpiry == 0,
      "SurplusAuction/already-finished-bidExpiry"
    );
    require(
      auctions[auctionId].auctionExpiry > block.timestamp,
      "SurplusAuction/already-finished-end"
    );

    require(
      debtToSell == auctions[auctionId].debtToSell,
      "SurplusAuction/debtToSell-not-matching"
    );
    require(
      bidAmount > auctions[auctionId].bidAmount,
      "SurplusAuction/bid-not-higher"
    );
    require(
      bidAmount * ONE >= minBidIncrement * auctions[auctionId].bidAmount,
      "SurplusAuction/insufficient-increase"
    );

    if (msg.sender != auctions[auctionId].highestBidder) {
      governanceToken.transferFrom(
        msg.sender,
        auctions[auctionId].highestBidder,
        auctions[auctionId].bidAmount
      );
      auctions[auctionId].highestBidder = msg.sender;
    }
    governanceToken.transferFrom(
      msg.sender,
      address(this),
      bidAmount - auctions[auctionId].bidAmount
    );

    auctions[auctionId].bidAmount = bidAmount;
    auctions[auctionId].bidExpiry = uint48(block.timestamp) + maxBidDuration;

    emit PlaceBid(
      auctionId,
      msg.sender,
      bidAmount,
      debtToSell,
      auctions[auctionId].bidExpiry
    );
  }

  function settleAuction(uint256 auctionId) external {
    require(live == 1, "SurplusAuction/not-live");
    require(
      auctions[auctionId].bidExpiry != 0 &&
        (auctions[auctionId].bidExpiry < block.timestamp ||
          auctions[auctionId].auctionExpiry < block.timestamp),
      "SurplusAuction/not-finished"
    );
    ledger.transferDebt(
      address(this),
      auctions[auctionId].highestBidder,
      auctions[auctionId].debtToSell
    );
    governanceToken.burn(auctions[auctionId].bidAmount);
    removeAuction(auctionId);
    emit SettleAuction(
      auctionId,
      auctions[auctionId].highestBidder,
      auctions[auctionId].bidAmount
    );
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

  function emergencyCloseAuction(uint256 auctionId) external {
    require(live == 0, "SurplusAuction/still-live");
    require(
      auctions[auctionId].highestBidder != address(0),
      "SurplusAuction/highestBidder-not-set"
    );
    governanceToken.transferFrom(
      address(this),
      auctions[auctionId].highestBidder,
      auctions[auctionId].bidAmount
    );
    removeAuction(auctionId);
    emit EmergencyCloseAuction(
      auctionId,
      auctions[auctionId].highestBidder,
      auctions[auctionId].bidAmount
    );
  }
}
