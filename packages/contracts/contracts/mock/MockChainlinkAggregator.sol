// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../external/AggregatorV3Interface.sol";

contract MockChainlinkAggregator is AggregatorV3Interface {
  string public override description = "Mock Chainlink Aggregator";
  uint256 public override version = 1;
  uint8 public override decimals;
  uint256 public price;

  constructor(uint256 initialPrice, uint8 _decimals) {
    price = initialPrice;
    decimals = _decimals;
  }

  function setPrice(uint256 newPrice) public {
    price = newPrice;
  }

  function getRoundData(uint80 _roundId)
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (_roundId, int256(price), 0, 0, 0);
  }

  function latestRoundData()
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (0, int256(price), 0, 0, 0);
  }
}
