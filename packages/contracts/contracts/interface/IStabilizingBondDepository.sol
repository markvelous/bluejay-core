// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IStabilizingBondDepository {
  function getReward(uint256 degree) external view returns (uint256 reward);

  function getCurrentReward() external view returns (uint256);

  function getTwapDeviation()
    external
    view
    returns (
      uint256 degree,
      bool isExpansionary,
      uint256 stablecoinOut
    );

  function getSpotDeviation()
    external
    view
    returns (
      uint256 degree,
      bool isExpansionary,
      uint256 stablecoinOut
    );

  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) external returns (uint256 bondId);

  function redeem(uint256 bondId, address recipient) external;

  function setTolerance(uint256 _tolerance) external;

  function setMaxRewardFactor(uint256 _maxRewardFactor) external;

  function setControlVariable(uint256 _controlVariable) external;
}
