// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IStabilizingBondDepository {
  function getReward(uint256 degree) external view returns (uint256 reward);

  function getCurrentReward() external view returns (uint256);

  function bondPrice() external view returns (uint256 price);

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

  function redeem(uint256 bondId, address recipient)
    external
    returns (uint256 payout);

  function setTolerance(uint256 _tolerance) external;

  function setMaxRewardFactor(uint256 _maxRewardFactor) external;

  function setControlVariable(uint256 _controlVariable) external;

  function setBluTwapOracle(address _bluTwapOracle) external;

  function setStablecoinTwapOracle(address _stablecoinTwapOracle) external;

  function setStablecoinOracle(address _stablecoinOracle) external;

  function setIsRedeemPaused(bool pause) external;

  function setIsPurchasePaused(bool pause) external;

  event BondPurchased(
    uint256 indexed bondId,
    address indexed recipient,
    uint256 amount,
    uint256 principal,
    uint256 price
  );

  event BondRedeemed(
    uint256 indexed bondId,
    address indexed recipient,
    bool indexed fullyRedeemed,
    uint256 payout,
    uint256 principal
  );
}
