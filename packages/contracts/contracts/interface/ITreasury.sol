// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ITreasury {
  function mint(address to, uint256 amount) external;

  function withdraw(
    address token,
    address to,
    uint256 amount
  ) external;
}
