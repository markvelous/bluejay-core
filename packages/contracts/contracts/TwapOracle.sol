// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./interface/ITwapOracle.sol";

import "./external/IUniswapV2Pair.sol";
import "./external/UniswapV2OracleLibrary.sol";

// Security note: consider having a maximum skew as additional defense against
// price manipulations

contract TwapOracle is ITwapOracle {
  uint256 public immutable period;
  IUniswapV2Pair immutable pair;
  address public immutable token0;
  address public immutable token1;

  uint256 public price0CumulativeLast;
  uint256 public price1CumulativeLast;
  uint32 public blockTimestampLast;

  uint224 public price0Average;
  uint224 public price1Average;

  constructor(address poolAddress, uint256 _period) {
    period = _period;
    IUniswapV2Pair _pair = IUniswapV2Pair(poolAddress);
    pair = _pair;
    token0 = _pair.token0();
    token1 = _pair.token1();
    price0CumulativeLast = _pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
    price1CumulativeLast = _pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
    uint112 reserve0;
    uint112 reserve1;
    (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
    require(reserve0 != 0 && reserve1 != 0, "No liquidity in pool"); // ensure that there's liquidity in the pair
  }

  // decode a UQ144x112 into a uint144 by truncating after the radix point
  function decode144(uint256 num) internal pure returns (uint144) {
    return uint144(num >> 112);
  }

  function update() public override {
    (
      uint256 price0Cumulative,
      uint256 price1Cumulative,
      uint32 blockTimestamp
    ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
    uint32 timeElapsed = blockTimestamp - blockTimestampLast;

    require(timeElapsed >= period, "Period not elapsed");

    price0Average = uint224(
      (price0Cumulative - price0CumulativeLast) / timeElapsed
    );
    price1Average = uint224(
      (price1Cumulative - price1CumulativeLast) / timeElapsed
    );

    price0CumulativeLast = price0Cumulative;
    price1CumulativeLast = price1Cumulative;
    blockTimestampLast = blockTimestamp;
  }

  // Security note: this function will return  0 when the update has not been
  // called or pool has not received a swap before
  function consult(address token, uint256 amountIn)
    public
    view
    override
    returns (uint256 amountOut)
  {
    if (token == token0) {
      amountOut = decode144(price0Average * amountIn);
    } else {
      require(token == token1, "Invalid swap");
      amountOut = decode144(price1Average * amountIn);
    }
    require(amountOut > 0, "Invalid price");
  }

  function tryUpdate() public override {
    if (
      UniswapV2OracleLibrary.currentBlockTimestamp() - blockTimestampLast >=
      period
    ) {
      update();
    }
  }

  function updateAndConsult(address token, uint256 amountIn)
    public
    override
    returns (uint256 amountOut)
  {
    tryUpdate();
    return consult(token, amountIn);
  }
}
