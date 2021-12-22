// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface IStakedToken is IERC20 {
  function stake(uint256 amount, address recipient) external returns (bool);

  function unstake(uint256 amount, address recipient) external returns (bool);

  function updateAccumulatedRate() external returns (uint256);

  function rebase() external returns (uint256 mintedTokens);

  function currentAccumulatedRate() external view returns (uint256);

  function denormalize(uint256 amount) external view returns (uint256);

  function normalize(uint256 amount) external view returns (uint256);

  function compoundedInterest(uint256 timePeriod)
    external
    view
    returns (uint256);

  function setInterestRate(uint256 _interestRate) external;

  function setMinimumNormalizedBalance(uint256 _minimumNormalizedBalance)
    external;
}
