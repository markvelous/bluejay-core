// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract CoreEngine {
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

  modifier isLive() {
    require(live == 1, "Core/not-live");
    _;
  }

  mapping(address => mapping(address => uint256)) public allowed;

  function grantAllowance(address user) external {
    allowed[msg.sender][user] = 1;
  }

  function revokeAllowance(address user) external {
    allowed[msg.sender][user] = 0;
  }

  function allowedToModifyDebtOrCollateral(address bit, address user)
    internal
    view
    returns (bool)
  {
    return
      either(
        // Either user is owner, or allowance is given
        either(bit == user, allowed[bit][user] == 1),
        // Sender is admin
        authorizedAccounts[msg.sender] == 1
      );
  }

  // --- Data ---
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

  mapping(bytes32 => CollateralType) public collateralTypes;
  mapping(bytes32 => mapping(address => Position)) public positions;
  mapping(bytes32 => mapping(address => uint256)) public collateral; // [wad]
  mapping(address => uint256) public debt; // internal coin balance [rad]
  mapping(address => uint256) public unbackedDebt; // system debt, not belonging to any Position [rad]

  uint256 public totalDebt; // Total Stablecoin Issued    [rad]
  uint256 public totalUnbackedDebt; // Total Unbacked Stablecoin  [rad]
  uint256 public totalDebtCeiling; // Total Debt Ceiling  [rad]
  uint256 public live; // Active Flag

  // --- Init ---
  constructor() {
    authorizedAccounts[msg.sender] = 1;
    live = 1;
  }

  // --- Math ---
  function addInt(uint256 x, int256 y) internal pure returns (uint256 z) {
    unchecked {
      z = x + uint256(y);
    }
    require(y >= 0 || z <= x);
    require(y <= 0 || z >= x);
  }

  function subInt(uint256 x, int256 y) internal pure returns (uint256 z) {
    unchecked {
      z = x - uint256(y);
    }
    require(y <= 0 || z <= x);
    require(y >= 0 || z >= x);
  }

  function mulInt(uint256 x, int256 y) internal pure returns (int256 z) {
    unchecked {
      z = int256(x) * y;
    }
    require(int256(x) >= 0);
    require(y == 0 || z / y == int256(x));
  }

  // --- Administration ---
  function initializeCollateralType(bytes32 collateralType)
    external
    isAuthorized
  {
    require(
      collateralTypes[collateralType].accumulatedRate == 0,
      "Core/collateralType-already-init"
    );
    collateralTypes[collateralType].accumulatedRate = 10**27;
  }

  function updateTotalDebtCeiling(uint256 data) external isAuthorized isLive {
    totalDebtCeiling = data;
  }

  function updateSafetyPrice(bytes32 collateralType, uint256 data)
    external
    isAuthorized
    isLive
  {
    collateralTypes[collateralType].safetyPrice = data;
  }

  function updateDebtCeiling(bytes32 collateralType, uint256 data)
    external
    isAuthorized
    isLive
  {
    collateralTypes[collateralType].debtCeiling = data;
  }

  function updateDebtFloor(bytes32 collateralType, uint256 data)
    external
    isAuthorized
    isLive
  {
    collateralTypes[collateralType].debtFloor = data;
  }

  function shutdown() external isAuthorized {
    live = 0;
  }

  // --- Fungibility ---
  function modifyCollateral(
    bytes32 collateralType,
    address user,
    int256 wad
  ) external isAuthorized {
    collateral[collateralType][user] = addInt(
      collateral[collateralType][user],
      wad
    );
  }

  function transferCollateral(
    bytes32 collateralType,
    address from,
    address to,
    uint256 wad
  ) external {
    require(
      allowedToModifyDebtOrCollateral(from, msg.sender),
      "Core/not-allowed"
    );
    collateral[collateralType][from] = collateral[collateralType][from] - wad;
    collateral[collateralType][to] = collateral[collateralType][to] + wad;
  }

  function transferDebt(
    address from,
    address to,
    uint256 rad
  ) external {
    require(
      allowedToModifyDebtOrCollateral(from, msg.sender),
      "Core/not-allowed"
    );
    debt[from] = debt[from] - rad;
    debt[to] = debt[to] + rad;
  }

  function either(bool x, bool y) internal pure returns (bool z) {
    assembly {
      z := or(x, y)
    }
  }

  function both(bool x, bool y) internal pure returns (bool z) {
    assembly {
      z := and(x, y)
    }
  }

  // --- CDP Manipulation ---
  function modifyPositionCollateralization(
    bytes32 collateralType,
    address position,
    address collateralSource,
    address debtDestination,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external isLive {
    Position memory positionData = positions[collateralType][position];
    CollateralType memory collateralTypeData = collateralTypes[collateralType];
    // collateralType has been initialised
    require(
      collateralTypeData.accumulatedRate != 0,
      "Core/collateralType-not-init"
    );

    positionData.lockedCollateral = addInt(
      positionData.lockedCollateral,
      collateralDelta
    );
    positionData.normalizedDebt = addInt(
      positionData.normalizedDebt,
      normalizedDebtDelta
    );
    collateralTypeData.normalizedDebt = addInt(
      collateralTypeData.normalizedDebt,
      normalizedDebtDelta
    );

    int256 adjustedDebtDelta = mulInt(
      collateralTypeData.accumulatedRate,
      normalizedDebtDelta
    );
    uint256 totalDebtOfPosition = collateralTypeData.accumulatedRate *
      positionData.normalizedDebt;
    totalDebt = addInt(totalDebt, adjustedDebtDelta);

    // either totalDebt has decreased, or totalDebtceilings are not exceeded
    require(
      either(
        normalizedDebtDelta <= 0,
        both(
          collateralTypeData.normalizedDebt *
            collateralTypeData.accumulatedRate <=
            collateralTypeData.debtCeiling,
          totalDebt <= totalDebtCeiling
        )
      ),
      "Core/ceiling-exceeded"
    );
    // position is either less risky than before, or it is safe
    require(
      either(
        both(normalizedDebtDelta <= 0, collateralDelta >= 0),
        totalDebtOfPosition <=
          positionData.lockedCollateral * collateralTypeData.safetyPrice
      ),
      "Core/not-safe"
    );

    // position is either more safe, or the owner consents
    require(
      either(
        both(normalizedDebtDelta <= 0, collateralDelta >= 0),
        allowedToModifyDebtOrCollateral(position, msg.sender)
      ),
      "Core/not-allowed-position"
    );
    // collateral src consents
    require(
      either(
        collateralDelta <= 0,
        allowedToModifyDebtOrCollateral(collateralSource, msg.sender)
      ),
      "Core/not-allowed-collateral-src"
    );
    // totalDebtdst consents
    require(
      either(
        normalizedDebtDelta >= 0,
        allowedToModifyDebtOrCollateral(debtDestination, msg.sender)
      ),
      "Core/not-allowed-debt-dst"
    );

    // position has no debt, or a non-negligible amount
    require(
      either(
        positionData.normalizedDebt == 0,
        totalDebtOfPosition >= collateralTypeData.debtFloor
      ),
      "Core/debtFloor"
    );

    collateral[collateralType][collateralSource] = subInt(
      collateral[collateralType][collateralSource],
      collateralDelta
    );
    debt[debtDestination] = addInt(debt[debtDestination], adjustedDebtDelta);

    positions[collateralType][position] = positionData;
    collateralTypes[collateralType] = collateralTypeData;
  }

  // --- CDP Fungibility ---
  function transferCollateralAndDebt(
    bytes32 collateralType,
    address src,
    address dst,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external {
    Position storage sourcePosition = positions[collateralType][src];
    Position storage destinationPosition = positions[collateralType][dst];
    CollateralType storage collateralTypeData = collateralTypes[collateralType];

    sourcePosition.lockedCollateral = subInt(
      sourcePosition.lockedCollateral,
      collateralDelta
    );
    sourcePosition.normalizedDebt = subInt(
      sourcePosition.normalizedDebt,
      normalizedDebtDelta
    );
    destinationPosition.lockedCollateral = addInt(
      destinationPosition.lockedCollateral,
      collateralDelta
    );
    destinationPosition.normalizedDebt = addInt(
      destinationPosition.normalizedDebt,
      normalizedDebtDelta
    );

    uint256 sourceDebt = sourcePosition.normalizedDebt *
      collateralTypeData.accumulatedRate;
    uint256 destinationDebt = destinationPosition.normalizedDebt *
      collateralTypeData.accumulatedRate;

    // both sides consent
    require(
      both(
        allowedToModifyDebtOrCollateral(src, msg.sender),
        allowedToModifyDebtOrCollateral(dst, msg.sender)
      ),
      "Core/not-allowed"
    );

    // both sides safe
    require(
      sourceDebt <=
        sourcePosition.lockedCollateral * collateralTypeData.safetyPrice,
      "Core/not-safe-src"
    );
    require(
      destinationDebt <=
        destinationPosition.lockedCollateral * collateralTypeData.safetyPrice,
      "Core/not-safe-dst"
    );

    // both sides non-negligible
    require(
      either(
        sourceDebt >= collateralTypeData.debtFloor,
        sourcePosition.normalizedDebt == 0
      ),
      "Core/debtFloor-src"
    );
    require(
      either(
        destinationDebt >= collateralTypeData.debtFloor,
        destinationPosition.normalizedDebt == 0
      ),
      "Core/debtFloor-dst"
    );
  }

  // --- CDP Confiscation ---
  function confiscateCollateralAndDebt(
    bytes32 collateralType,
    address user,
    address collateralCounterparty,
    address debtCounterparty,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) external isAuthorized {
    Position storage position = positions[collateralType][user];
    CollateralType storage collateralTypeData = collateralTypes[collateralType];

    position.lockedCollateral = addInt(
      position.lockedCollateral,
      collateralDelta
    );
    position.normalizedDebt = addInt(
      position.normalizedDebt,
      normalizedDebtDelta
    );
    collateralTypeData.normalizedDebt = addInt(
      collateralTypeData.normalizedDebt,
      normalizedDebtDelta
    );

    int256 unbackedDebtDelta = mulInt(
      collateralTypeData.accumulatedRate,
      normalizedDebtDelta
    );

    collateral[collateralType][collateralCounterparty] = subInt(
      collateral[collateralType][collateralCounterparty],
      collateralDelta
    );
    unbackedDebt[debtCounterparty] = subInt(
      unbackedDebt[debtCounterparty],
      unbackedDebtDelta
    );
    totalUnbackedDebt = subInt(totalUnbackedDebt, unbackedDebtDelta);
  }

  // --- Settlement ---
  function settleDebt(uint256 rad) external {
    address user = msg.sender;
    unbackedDebt[user] = unbackedDebt[user] - rad;
    debt[user] = debt[user] - rad;
    totalUnbackedDebt = totalUnbackedDebt - rad;
    totalDebt = totalDebt - rad;
  }

  function createUnbackedDebt(
    address unbackedDebtAccount,
    address debtAccount,
    uint256 rad
  ) external isAuthorized {
    unbackedDebt[unbackedDebtAccount] = unbackedDebt[unbackedDebtAccount] + rad;
    debt[debtAccount] = debt[debtAccount] + rad;
    totalUnbackedDebt = totalUnbackedDebt + rad;
    totalDebt = totalDebt + rad;
  }

  // --- Rates ---
  function updateAccumulatedRate(
    bytes32 collateralType,
    address debtDestination,
    int256 accumulatedRateDelta
  ) external isAuthorized isLive {
    CollateralType storage collateralTypeData = collateralTypes[collateralType];
    collateralTypeData.accumulatedRate = addInt(
      collateralTypeData.accumulatedRate,
      accumulatedRateDelta
    );
    int256 debtDelta = mulInt(
      collateralTypeData.normalizedDebt,
      accumulatedRateDelta
    );
    debt[debtDestination] = addInt(debt[debtDestination], debtDelta);
    totalDebt = addInt(totalDebt, debtDelta);
  }
}
