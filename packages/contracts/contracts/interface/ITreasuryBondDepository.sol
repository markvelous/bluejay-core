// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ITreasuryBondDepository {
  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) external returns (uint256 bondId);

  function redeem(uint256 bondId, address recipient)
    external
    returns (uint256 payout);

  function currentDebt() external view returns (uint256 debt);

  function debtDecay() external view returns (uint256 decay);

  function debtRatio() external view returns (uint256 ratio);

  function bondPrice() external view returns (uint256 price);

  function setBondGovernor(address bondGovernor) external;

  function setFeeCollector(address dao) external;

  function setIsRedeemPaused(bool pause) external;

  function setIsPurchasePaused(bool pause) external;

  event UpdatedBondGovernor(address bondGovernor);
  event UpdatedFeeCollector(address dao);

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
