// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface OracleLike {
  function getPrice() external returns (uint256, bool);
}

contract OracleSecurityModule is Initializable {
  uint16 constant ONE_HOUR = uint16(3600);

  struct PriceFeed {
    uint128 price;
    uint128 isValid;
  }

  uint256 public stopped;
  mapping(address => uint256) public authorizedAccounts;
  address public oracle;
  uint16 public priceDelay;
  uint64 public lastPriceUpdate;

  PriceFeed public currentPrice;
  PriceFeed public nextPrice;

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event UpdateOracle(address indexed oracle);
  event UpdatePriceDelay(uint16 delay);
  event UpdatePriceFeed(
    uint64 indexed timestamp,
    uint128 currentPrice,
    uint128 nextPrice,
    bool currentPriceIsValid,
    bool nextPriceIsValid
  );

  modifier isAuthorized() {
    require(authorizedAccounts[msg.sender] == 1, "OSM/not-authorized");
    _;
  }

  modifier stoppable() {
    require(stopped == 0, "OSM/is-stopped");
    _;
  }

  // --- Init ---
  function initialize(address oracle_) public initializer {
    authorizedAccounts[msg.sender] = 1;
    oracle = oracle_;
    priceDelay = ONE_HOUR;
    emit GrantAuthorization(msg.sender);
  }

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
    emit GrantAuthorization(user);
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
    emit RevokeAuthorization(user);
  }

  function stop() external isAuthorized {
    stopped = 1;
  }

  function start() external isAuthorized {
    stopped = 0;
  }

  function clearPriceFeeds() external isAuthorized {
    currentPrice = nextPrice = PriceFeed(0, 0);
    stopped = 1;
  }

  function updateOracle(address nextOracle) external isAuthorized {
    oracle = nextOracle;
    emit UpdateOracle(oracle);
  }

  function updatePriceDelay(uint16 nextPriceDelay) external isAuthorized {
    require(nextPriceDelay > 0, "OSM/price-delay-is-zero");
    priceDelay = nextPriceDelay;
    emit UpdatePriceDelay(priceDelay);
  }

  function roundTimestamp(uint256 timestamp) internal view returns (uint64) {
    require(priceDelay != 0, "OSM/price-delay-is-zero");
    return uint64(timestamp - (timestamp % priceDelay));
  }

  function hasPassedPriceDelay() public view returns (bool ok) {
    return block.timestamp >= lastPriceUpdate + priceDelay;
  }

  function updatePriceFeed() external stoppable {
    require(hasPassedPriceDelay(), "OSM/not-passed-delay");
    (uint256 price, bool isValid) = OracleLike(oracle).getPrice();
    if (isValid) {
      currentPrice = nextPrice;
      nextPrice = PriceFeed(uint128(price), 1);
      lastPriceUpdate = roundTimestamp(block.timestamp);
      emit UpdatePriceFeed(
        lastPriceUpdate,
        currentPrice.price,
        nextPrice.price,
        currentPrice.isValid == 1,
        nextPrice.isValid == 1
      );
    }
  }

  function getPrice() external view returns (uint256, bool) {
    return (uint256(currentPrice.price), currentPrice.isValid == 1);
  }

  function getNextPrice() external view returns (uint256, bool) {
    return (uint256(nextPrice.price), nextPrice.isValid == 1);
  }

  function getPriceSafe() external view returns (uint256) {
    require(currentPrice.isValid == 1, "OSM/no-current-priceue");
    return uint256(currentPrice.price);
  }
}
