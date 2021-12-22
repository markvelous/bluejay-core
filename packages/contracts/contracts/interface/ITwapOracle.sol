// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ITwapOracle {
  function update() external;

  function tryUpdate() external;

  function consult(address token, uint256 amountIn)
    external
    view
    returns (uint256 amountOut);

  function updateAndConsult(address token, uint256 amountIn)
    external
    returns (uint256 amountOut);
}
