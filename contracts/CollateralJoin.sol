// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface TokenLike {
  function decimals() external view returns (uint8);

  function transfer(address, uint256) external returns (bool);

  function transferFrom(
    address,
    address,
    uint256
  ) external returns (bool);
}

interface LedgerLike {
  function modifyCollateral(
    bytes32,
    address,
    int256
  ) external;
}

contract CollateralJoin {
  mapping(address => uint256) public authorizedAccounts;
  LedgerLike public ledger; // CDP Engine
  bytes32 public collateralType; // Collateral Type
  TokenLike public collateral;
  uint256 public decimals;
  uint256 public live; // Active Flag

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event Deposit(address indexed user, uint256 amount);
  event Withdraw(address indexed user, uint256 amount);

  constructor(
    address ledger_,
    bytes32 collateralType_,
    address collateral_
  ) {
    authorizedAccounts[msg.sender] = 1;
    live = 1;
    ledger = LedgerLike(ledger_);
    collateralType = collateralType_;
    collateral = TokenLike(collateral_);
    decimals = collateral.decimals();
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
      "CollateralJoin/not-authorized"
    );
    _;
  }

  function shutdown() external isAuthorized {
    live = 0;
  }

  function deposit(address user, uint256 wad) external {
    require(live == 1, "CollateralJoin/not-live");
    require(int256(wad) >= 0, "CollateralJoin/overflow");
    ledger.modifyCollateral(collateralType, user, int256(wad));
    require(
      collateral.transferFrom(msg.sender, address(this), wad),
      "CollateralJoin/failed-transfer"
    );
    emit Deposit(user, wad);
  }

  function withdraw(address user, uint256 wad) external {
    require(wad <= 2**255, "CollateralJoin/overflow");
    ledger.modifyCollateral(collateralType, msg.sender, -int256(wad));
    require(collateral.transfer(user, wad), "CollateralJoin/failed-transfer");
    emit Withdraw(user, wad);
  }
}
