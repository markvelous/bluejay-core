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
  // --- Auth ---
  mapping(address => uint256) public authorizedAccounts;

  function grantAuthorization(address usr) external isAuthorized {
    authorizedAccounts[usr] = 1;
  }

  function revokeAuthorization(address usr) external isAuthorized {
    authorizedAccounts[usr] = 0;
  }

  modifier isAuthorized() {
    require(
      authorizedAccounts[msg.sender] == 1,
      "CollateralJoin/not-authorized"
    );
    _;
  }

  LedgerLike public ledger; // CDP Engine
  bytes32 public collateralType; // Collateral Type
  TokenLike public collateral;
  uint256 public decimals;
  uint256 public live; // Active Flag

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
  }

  function shutdown() external isAuthorized {
    live = 0;
  }

  function join(address usr, uint256 wad) external {
    require(live == 1, "CollateralJoin/not-live");
    require(int256(wad) >= 0, "CollateralJoin/overflow");
    ledger.modifyCollateral(collateralType, usr, int256(wad));
    require(
      collateral.transferFrom(msg.sender, address(this), wad),
      "CollateralJoin/failed-transfer"
    );
  }

  function exit(address usr, uint256 wad) external {
    require(wad <= 2**255, "CollateralJoin/overflow");
    ledger.modifyCollateral(collateralType, msg.sender, -int256(wad));
    require(collateral.transfer(usr, wad), "CollateralJoin/failed-transfer");
  }
}
