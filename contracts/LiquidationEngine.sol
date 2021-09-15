// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface CoreEngineLike {
  function collateralTypes(bytes32)
    external
    view
    returns (
      uint256 normalizedDebt, // [wad]
      uint256 accumulatedRate, // [ray]
      uint256 safetyPrice, // [ray]
      uint256 debtCeiling, // [rad]
      uint256 debtFloor // [rad]
    );

  function positions(bytes32, address)
    external
    view
    returns (
      uint256 lockedCollateral, // [wad]
      uint256 normalizedDebt // [wad]
    );

  function confiscateCollateralAndDebt(
    bytes32 collateralType,
    address user,
    address collateralCounterparty,
    address debtCounterparty,
    int256 collateralDelta, // [wad]
    int256 normalizedDebtDelta // [wad]
  ) external;

  function transferCollateralAndDebt(
    bytes32 collateralType,
    address src,
    address dst,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external;

  function grantAuthorization(address) external;

  function revokeAuthorization(address) external;
}

contract LiquidationEngine {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized isLive {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized isLive {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "LiquidationEngine/not-authorized"
    );
    _;
  }

  modifier isLive() {
    require(live == 1, "LiquidationEngine/not-live");
    _;
  }

  // --- Data ---
  struct CollateralType {
    uint256 baseLiquidationPenalty; // Base Liquidation Penalty [ray]
  }

  CoreEngineLike public coreEngine; // CDP Engine
  mapping(bytes32 => CollateralType) collateralTypes;
  uint256 public fullLiquidationPeriod; // [blocks]
  uint256 public liquidationLimits; // [ray]
  uint256 public live; // Active Flag

  // --- Init ---
  constructor(address coreEngine_) {
    authorizedAccounts[msg.sender] = 1;
    live = 1;
    coreEngine = CoreEngineLike(coreEngine_);
  }

  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    if (x > y) {
      z = y;
    } else {
      z = x;
    }
  }

  function liquidatePosition(
    bytes32 collateralType,
    address user,
    uint256 normalizedDebtRepayment
  ) public isLive {
    (
      ,
      uint256 accumulatedRate,
      uint256 safetyPrice,
      ,
      uint256 debtFloor
    ) = coreEngine.collateralTypes(collateralType);
    (uint256 lockedCollateral, uint256 normalizedDebt) = coreEngine.positions(
      collateralType,
      user
    );

    require(
      safetyPrice > 0 &&
        lockedCollateral * safetyPrice < normalizedDebt * accumulatedRate,
      "LiquidationEngine/not-unsafe"
    );

    uint256 baseLiquidationPenalty = collateralTypes[collateralType]
      .baseLiquidationPenalty;
    uint256 normalizedDebtDelta = min(normalizedDebtRepayment, normalizedDebt);
    uint256 lockedCollateralDelta = min(
      lockedCollateral,
      (lockedCollateral * normalizedDebtDelta) / normalizedDebt
    );

    require(
      normalizedDebtDelta > 0 && lockedCollateralDelta > 0,
      "LiquidationEngine/null-auction"
    );
    require(
      normalizedDebtDelta <= 2**255 && lockedCollateralDelta <= 2**255,
      "LiquidationEngine/overflow"
    );

    // Move liquidator collateral here
    coreEngine.transferCollateralAndDebt(
      collateralType,
      msg.sender,
      address(this),
      int256(lockedCollateralDelta),
      0
    );

    // Move collateral & debt of unsafe position here
    coreEngine.confiscateCollateralAndDebt(
      collateralType,
      user,
      address(this),
      address(this),
      -int256(lockedCollateralDelta),
      -int256(normalizedDebtDelta)
    );

    // Pay liquidator with debt
    coreEngine.transferCollateralAndDebt(
      collateralType,
      msg.sender,
      address(this),
      0,
      -int256(normalizedDebtDelta)
    );
    // vow.fess(mul(dart, rate));
  }
}
