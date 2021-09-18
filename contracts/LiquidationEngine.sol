// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LiquidatorLike {
  function collateralType() external view returns (bytes32);

  function startAuction(
    uint256 tab,
    uint256 lot,
    address usr,
    address keeper
  ) external returns (uint256);
}

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
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external;

  function grantAllowance(address) external;

  function revokeAllowance(address) external;
}

interface AccountingEngineLike {
  function pushDebtToQueue(uint256) external;
}

contract LiquidationEngine {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
  }

  modifier isAuthorized() {
    require(authorizedAccounts[msg.sender] == 1, "Core/not-authorized");
    _;
  }

  // --- Data ---
  struct CollateralTypes {
    address liquidator; // Liquidator
    uint256 liquidatonPenalty; // Liquidation Penalty [wad]                                          [wad]
    uint256 maxDebtForActiveAuctions; // Max debt needed to cover debt+fees of active auctions per ilk [rad]
    uint256 debtRequiredForActiveAuctions; // Amt debt needed to cover debt+fees of active auctions per ilk [rad]
  }

  CoreEngineLike public immutable coreEngine; // CDP Engine

  mapping(bytes32 => CollateralTypes) public collateralTypes;

  AccountingEngineLike public accountingEngine; // Debt Engine
  uint256 public live; // Active Flag
  uint256 public globalMaxDebtForActiveAuctions; // Max debt needed to cover debt+fees of active auctions [rad]
  uint256 public globalDebtRequiredForActiveAuctions; // Amt debt needed to cover debt+fees of active auctions [rad]

  // --- Events ---
  event Rely(address indexed usr);
  event Deny(address indexed usr);

  event Bark(
    bytes32 indexed ilk,
    address indexed urn,
    uint256 ink,
    uint256 art,
    uint256 due,
    address liquidator,
    uint256 indexed id
  );
  event DebtRemoved(bytes32 indexed ilk, uint256 rad);
  event Cage();

  // --- Init ---
  constructor(address coreEngine_) {
    coreEngine = CoreEngineLike(coreEngine_);
    live = 1;
    authorizedAccounts[msg.sender] = 1;
    emit Rely(msg.sender);
  }

  // --- Math ---
  uint256 constant WAD = 10**18;

  function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x <= y ? x : y;
  }

  // --- Administration ---
  function updateAccountingEngine(address data) external isAuthorized {
    accountingEngine = AccountingEngineLike(data);
  }

  function updateGlobalMaxDebtForActiveAuctions(uint256 data)
    external
    isAuthorized
  {
    globalMaxDebtForActiveAuctions = data;
  }

  function updateLiquidatonPenalty(bytes32 collateralType, uint256 data)
    external
    isAuthorized
  {
    require(data >= WAD, "LiquidationEngine/file-liquidatonPenalty-lt-WAD");
    collateralTypes[collateralType].liquidatonPenalty = data;
  }

  function updateMaxDebtForActiveAuctions(bytes32 collateralType, uint256 data)
    external
    isAuthorized
  {
    collateralTypes[collateralType].maxDebtForActiveAuctions = data;
  }

  function updateLiquidator(bytes32 collateralType, address liquidator)
    external
    isAuthorized
  {
    require(
      collateralType == LiquidatorLike(liquidator).collateralType(),
      "LiquidationEngine/file-collateralType-neq-liquidator.collateralType"
    );
    collateralTypes[collateralType].liquidator = liquidator;
  }

  function liquidatonPenalty(bytes32 ilk) external view returns (uint256) {
    return collateralTypes[ilk].liquidatonPenalty;
  }

  // --- CDP Liquidation ---
  //
  // Liquidate a Vault and start a Dutch auction to sell its collateral for debt.
  //
  // The third argument is the address that will receive the liquidation reward, if any.
  //
  // The entire Vault will be liquidated except when the target amount of debt to be raised in
  // the resulting auction (debt of Vault + liquidation penalty) causes either globalDebtRequiredForActiveAuctions to exceed
  // globalMaxDebtForActiveAuctions or ilk.debtRequiredForActiveAuctions to exceed ilk.maxDebtForActiveAuctions by an economically significant amount. In that
  // case, a partial liquidation is performed to respect the global and per-ilk limits on
  // outstanding debt target. The one exception is if the resulting auction would likely
  // have too little collateral to be interesting to Keepers (debt taken from Vault < ilk.debtFloor),
  // in which case the function reverts. Please refer to the code and comments within if
  // more detail is desired.
  function liquidatePosition(
    bytes32 collateralType,
    address position,
    address keeper
  ) external returns (uint256 auctionId) {
    require(live == 1, "LiquidationEngine/not-live");

    (uint256 lockedCollateral, uint256 normalizedDebt) = coreEngine.positions(
      collateralType,
      position
    );
    CollateralTypes memory collateralTypeData = collateralTypes[collateralType];
    uint256 normalizedDebtToConfiscate;
    uint256 accumulatedRate;
    uint256 debtFloor;
    {
      uint256 safetyPrice;
      (, accumulatedRate, safetyPrice, , debtFloor) = coreEngine
        .collateralTypes(collateralType);
      require(
        safetyPrice > 0 &&
          lockedCollateral * safetyPrice < normalizedDebt * accumulatedRate,
        "LiquidationEngine/not-unsafe"
      );

      // Get the minimum value between:
      // 1) Remaining space in the general globalMaxDebtForActiveAuctions
      // 2) Remaining space in the collateral maxDebtForActiveAuctions
      require(
        globalMaxDebtForActiveAuctions > globalDebtRequiredForActiveAuctions &&
          collateralTypeData.maxDebtForActiveAuctions >
          collateralTypeData.debtRequiredForActiveAuctions,
        "LiquidationEngine/liquidation-limit-hit"
      );
      uint256 maximumDebtAllowedToBeLiquidated = min(
        globalMaxDebtForActiveAuctions - globalDebtRequiredForActiveAuctions,
        collateralTypeData.maxDebtForActiveAuctions -
          collateralTypeData.debtRequiredForActiveAuctions
      );

      // uint256.max()/(RAD*WAD) = 115,792,089,237,316
      normalizedDebtToConfiscate = min(
        normalizedDebt,
        (maximumDebtAllowedToBeLiquidated * WAD) /
          accumulatedRate /
          collateralTypeData.liquidatonPenalty
      );

      // Partial liquidation edge case logic
      if (normalizedDebt > normalizedDebtToConfiscate) {
        if (
          (normalizedDebt - normalizedDebtToConfiscate) * accumulatedRate <
          debtFloor
        ) {
          // If the leftover Vault would be debtFloory, just liquidate it entirely.
          // This will result in at least one of debtRequiredForActiveAuction_is > maxDebtForActiveAuctions_i or globalDebtRequiredForActiveAuctions > globalMaxDebtForActiveAuctions becoming true.
          // The amount of excess will be bounded above by ceiling(debtFloor_i * liquidatonPenalty_i / WAD).
          // This deviation is assumed to be small compared to both maxDebtForActiveAuctions_i and globalMaxDebtForActiveAuctions, so that
          // the extra amount of target debt over the limits intended is not of economic concern.
          normalizedDebtToConfiscate = normalizedDebt;
        } else {
          // In a partial liquidation, the resulting auction should also be non-debtFloory.
          require(
            normalizedDebtToConfiscate * accumulatedRate >= debtFloor,
            "LiquidationEngine/debtFloory-auction-from-pnormalizedDebtial-liquidation"
          );
        }
      }
    }

    uint256 lockedCollateralToConfiscate = (lockedCollateral *
      normalizedDebtToConfiscate) / normalizedDebt;

    require(lockedCollateralToConfiscate > 0, "LiquidationEngine/null-auction");
    require(
      normalizedDebtToConfiscate <= 2**255 &&
        lockedCollateralToConfiscate <= 2**255,
      "LiquidationEngine/overflow"
    );

    coreEngine.confiscateCollateralAndDebt(
      collateralType,
      position,
      collateralTypeData.liquidator,
      address(accountingEngine),
      -int256(lockedCollateralToConfiscate),
      -int256(normalizedDebtToConfiscate)
    );

    uint256 debtConfiscated = normalizedDebtToConfiscate * accumulatedRate;
    accountingEngine.pushDebtToQueue(debtConfiscated);

    {
      // Avoid stack too deep
      // This calcuation will overflow if normalizedDebtToConfiscate*accumulatedRate exceeds ~10^14
      uint256 debtWithPenalty = (debtConfiscated *
        collateralTypeData.liquidatonPenalty) / WAD;
      globalDebtRequiredForActiveAuctions =
        globalDebtRequiredForActiveAuctions +
        debtWithPenalty;
      collateralTypes[collateralType].debtRequiredForActiveAuctions =
        collateralTypeData.debtRequiredForActiveAuctions +
        debtWithPenalty;

      auctionId = LiquidatorLike(collateralTypeData.liquidator).startAuction({
        tab: debtWithPenalty,
        lot: lockedCollateralToConfiscate,
        usr: position,
        keeper: keeper
      });
    }

    emit Bark(
      collateralType,
      position,
      lockedCollateralToConfiscate,
      normalizedDebtToConfiscate,
      debtConfiscated,
      collateralTypeData.liquidator,
      auctionId
    );
  }

  function removeDebtFromLiquidation(bytes32 collateralType, uint256 rad)
    external
    isAuthorized
  {
    globalDebtRequiredForActiveAuctions =
      globalDebtRequiredForActiveAuctions -
      rad;
    collateralTypes[collateralType].debtRequiredForActiveAuctions =
      collateralTypes[collateralType].debtRequiredForActiveAuctions -
      rad;
    emit DebtRemoved(collateralType, rad);
  }

  function shutdown() external isAuthorized {
    live = 0;
    emit Cage();
  }
}
