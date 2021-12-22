// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./interface/IPriceFeedOracle.sol";

contract PriceFeedOracle is IPriceFeedOracle{
  uint8 constant decimals = 18;
  uint256 constant ONE = 10**decimals;
  Feed[] public path;

  constructor(address[] memory aggregators, bool[] memory inverts) {
    require(aggregators.length == inverts.length, "Mismatched arrays");
    for (uint256 i = 0; i < aggregators.length; i++) {
      path.push(
        Feed({
          aggregator: AggregatorV3Interface(aggregators[i]),
          decimals: AggregatorV3Interface(aggregators[i]).decimals(),
          invert: inverts[i]
        })
      );
    }
  }

  // TODO Consider if there is a need for stale data protection
  // Note: Quotes as number of stablecoin per reserve
  function getPrice() override public view returns (uint256 price) {
    price = ONE;
    for (uint256 i = 0; i < path.length; i++) {
      Feed memory feed = path[i];
      (, int256 feedPrice, , , ) = feed.aggregator.latestRoundData();
      uint256 scaledPrice = uint256(
        scalePrice(feedPrice, feed.decimals, decimals)
      );
      price = feed.invert
        ? (ONE * price) / scaledPrice
        : (scaledPrice * price) / ONE;
    }
  }

  function scalePrice(
    int256 _price,
    uint8 _priceDecimals,
    uint8 _decimals
  ) internal pure returns (int256) {
    if (_priceDecimals < _decimals) {
      return _price * int256(10**uint256(_decimals - _priceDecimals));
    } else if (_priceDecimals > _decimals) {
      return _price / int256(10**uint256(_priceDecimals - _decimals));
    }
    return _price;
  }
}
