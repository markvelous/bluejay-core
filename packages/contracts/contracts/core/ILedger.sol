// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ILedger {
  struct CollateralType {
    uint256 normalizedDebt; // Total Normalised Debt     [wad]
    uint256 accumulatedRate; // Accumulated Rates         [ray]
    uint256 safetyPrice; // Price with Safety Margin  [ray]
    uint256 debtCeiling; // Debt Ceiling              [rad]
    uint256 debtFloor; // Position Debt Floor            [rad]
  }
  struct Position {
    uint256 lockedCollateral; // Locked Collateral  [wad]
    uint256 normalizedDebt; // Normalised Debt    [wad]
  }

  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event AllowModification(address indexed target, address indexed user);
  event DenyModification(address indexed target, address indexed user);
  event InitializeCollateralType(bytes32 indexed collateralType);
  event UpdateParameter(bytes32 indexed parameter, uint256 data);
  event UpdateParameter(
    bytes32 indexed parameter,
    bytes32 indexed collateralType,
    uint256 data
  );
  event ModifyCollateral(bytes32 collateralType, address user, int256 amount);
  event TransferCollateral(
    bytes32 collateralType,
    address from,
    address to,
    uint256 amount
  );
  event TransferDebt(address from, address to, uint256 amount);
  event ModifyPositionCollateralization(
    bytes32 indexed collateralType,
    address indexed position,
    address collateralSource,
    address debtDestination,
    int256 collateralDelta,
    int256 normalizedDebtDelta,
    uint256 lockedCollateral,
    uint256 normalizedDebt
  );
  event TransferCollateralAndDebt(
    bytes32 indexed collateralType,
    address indexed src,
    address indexed dst,
    int256 collateralDelta,
    int256 normalizedDebtDelta,
    uint256 srcLockedCollateral,
    uint256 srcNormalizedDebt,
    uint256 dstLockedCollateral,
    uint256 dstNormalizedDebt
  );
  event ConfiscateCollateralAndDebt(
    bytes32 indexed collateralType,
    address indexed position,
    address collateralCounterparty,
    address debtCounterparty,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  );
  event SettleUnbackedDebt(address indexed account, uint256 amount);
  event CreateUnbackedDebt(
    address debtDestination,
    address unbackedDebtDestination,
    uint256 amount,
    uint256 debtDestinationBalance,
    uint256 unbackedDebtDestinationBalance
  );
  event UpdateAccumulatedRate(
    bytes32 indexed collateralType,
    address surplusDestination,
    int256 accumulatedRatedelta,
    int256 surplusDelta
  );

  function authorizedAccounts(address account) external view returns (uint256);

  function collateralTypes(address collateralType)
    external
    view
    returns (CollateralType memory);

  function allowed(address from, address to) external view returns (uint256);

  function positions(bytes32 collateralType, address position)
    external
    view
    returns (Position memory);

  function collateral(bytes32 collateralType, address position)
    external
    view
    returns (uint256);

  function debt(address position) external view returns (uint256);

  function unbackedDebt(address position) external view returns (uint256);

  function totalDebt() external view returns (uint256);

  function totalUnbackedDebt() external view returns (uint256);

  function totalDebtCeiling() external view returns (uint256);

  function live() external view returns (uint256);

  function initialize() external;

  function grantAuthorization(address user) external;

  function revokeAuthorization(address user) external;

  function allowModification(address user) external;

  function denyModification(address user) external;

  // --- Administration ---
  function initializeCollateralType(bytes32 collateralType) external;

  function updateTotalDebtCeiling(uint256 data) external;

  function updateSafetyPrice(bytes32 collateralType, uint256 data) external;

  function updateDebtCeiling(bytes32 collateralType, uint256 data) external;

  function updateDebtFloor(bytes32 collateralType, uint256 data) external;

  function shutdown() external;

  function modifyCollateral(
    bytes32 collateralType,
    address user,
    int256 wad
  ) external;

  function transferCollateral(
    bytes32 collateralType,
    address from,
    address to,
    uint256 wad
  ) external;

  function transferDebt(
    address from,
    address to,
    uint256 rad
  ) external;

  function modifyPositionCollateralization(
    bytes32 collateralType,
    address position,
    address collateralSource,
    address debtDestination,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external;

  function transferCollateralAndDebt(
    bytes32 collateralType,
    address src,
    address dst,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external;

  function confiscateCollateralAndDebt(
    bytes32 collateralType,
    address user,
    address collateralCounterparty,
    address debtCounterparty,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external;

  function settleUnbackedDebt(uint256 rad) external;

  function createUnbackedDebt(
    address unbackedDebtAccount,
    address debtAccount,
    uint256 rad
  ) external;

  function updateAccumulatedRate(
    bytes32 collateralType,
    address debtDestination,
    int256 accumulatedRateDelta
  ) external;
}
