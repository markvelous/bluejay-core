// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface LedgerLike {
  function updateSafetyPrice(bytes32 collateralType, uint256 data) external;
}

interface OracleLike {
  function getPrice() external returns (uint256, bool); // wad
}

contract OracleRelayer {
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address guy) external isAuthorized {
    authorizedAccounts[guy] = 1;
  }

  function revokeAuthorization(address guy) external isAuthorized {
    authorizedAccounts[guy] = 0;
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "OracleRelayer/not-authorized"
    );
    _;
  }

  // --- Data ---
  struct CollateralType {
    OracleLike oracle; // Price Feed
    uint256 collateralizationRatio; // Liquidation ratio [ray]
  }

  mapping(bytes32 => CollateralType) public collateralTypes;

  LedgerLike public ledger; // CDP Engine
  uint256 public redemptionPrice; // ref per dai [ray]

  uint256 public live;

  // --- Events ---
  event UpdateCollateralPrice(
    bytes32 collateralType,
    uint256 price, // [wad]
    uint256 safetyPrice // [ray]
  );

  // --- Init ---
  constructor(address ledger_) {
    authorizedAccounts[msg.sender] = 1;
    ledger = LedgerLike(ledger_);
    redemptionPrice = ONE;
    live = 1;
  }

  // --- Math ---
  uint256 constant ONE = 10**27;

  function rdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = (x * ONE) / y;
  }

  // --- Administration ---
  function updateOracle(bytes32 collateralType, address oracle_)
    external
    isAuthorized
  {
    collateralTypes[collateralType].oracle = OracleLike(oracle_);
  }

  function updateRedemptionPrice(uint256 data) external isAuthorized {
    redemptionPrice = data;
  }

  function updateCollateralizationRatio(bytes32 collateralType, uint256 data)
    external
    isAuthorized
  {
    collateralTypes[collateralType].collateralizationRatio = data;
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
