// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LedgerLike {
  function updateSafetyPrice(bytes32 collateralType, uint256 data) external;
}

interface OracleLike {
  function getPrice() external returns (uint256, bool); // wad
}

contract OracleRelayer {
  uint256 constant ONE = 10**27;

  struct CollateralType {
    OracleLike oracle; // Price Feed
    uint256 collateralizationRatio; // Liquidation ratio [ray]
  }

  mapping(address => uint256) public authorizedAccounts;
  mapping(bytes32 => CollateralType) public collateralTypes;

  LedgerLike public ledger; // CDP Engine
  uint256 public redemptionPrice; // ref per dai [ray]
  uint256 public live;

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event UpdateCollateralPrice(
    bytes32 collateralType,
    uint256 price, // [wad]
    uint256 safetyPrice // [ray]
  );
  event UpdateParameter(bytes32 indexed parameter, uint256 data);
  event UpdateParameter(
    bytes32 indexed parameter,
    bytes32 indexed collateralType,
    uint256 data
  );
  event UpdateParameter(
    bytes32 indexed parameter,
    bytes32 indexed collateralType,
    address data
  );

  // --- Init ---
  constructor(address ledger_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    redemptionPrice = ONE;
    live = 1;
    emit GrantAuthorization(msg.sender);
  }

  // --- Auth ---
  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
    emit GrantAuthorization(user);
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
    emit RevokeAuthorization(user);
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "OracleRelayer/not-authorized"
    );
    _;
  }

  // --- Math ---
  function rdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = (x * ONE) / y;
  }

  // --- Administration ---
  function updateOracle(bytes32 collateralType, address oracle_)
    external
    isAuthorized
  {
    collateralTypes[collateralType].oracle = OracleLike(oracle_);
    emit UpdateParameter("oracle", collateralType, oracle_);
  }

  function updateRedemptionPrice(uint256 data) external isAuthorized {
    redemptionPrice = data;
    emit UpdateParameter("redemptionPrice", data);
  }

  function updateCollateralizationRatio(bytes32 collateralType, uint256 data)
    external
    isAuthorized
  {
    require(data >= ONE, "OracleRelayer/ratio-lt-ray");
    collateralTypes[collateralType].collateralizationRatio = data;
    emit UpdateParameter("collateralizationRatio", collateralType, data);
  }

  // --- Update value ---
  function updateCollateralPrice(bytes32 collateralType) external {
    (uint256 price, bool isValidPrice) = collateralTypes[collateralType]
      .oracle
      .getPrice();
    uint256 safetyPrice = isValidPrice
      ? rdiv(
        rdiv(price * 10**9, redemptionPrice),
        collateralTypes[collateralType].collateralizationRatio
      )
      : 0;
    ledger.updateSafetyPrice(collateralType, safetyPrice);
    emit UpdateCollateralPrice(collateralType, price, safetyPrice);
  }

  function shutdown() external isAuthorized {
    live = 0;
  }
}
