// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface TokenLike {
  function mint(address, uint256) external;

  function burn(address, uint256) external;
}

interface LedgerLike {
  function transferDebt(
    address,
    address,
    uint256
  ) external;
}

contract StablecoinJoin {
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
      "StablecoinJoin/not-authorized"
    );
    _;
  }

  LedgerLike public ledger; // CDP Engine
  TokenLike public stablecoin; // Stablecoin Token
  uint256 public live; // Active Flag

  constructor(address ledger_, address stablecoin_) {
    authorizedAccounts[msg.sender] = 1;
    live = 1;
    ledger = LedgerLike(ledger_);
    stablecoin = TokenLike(stablecoin_);
  }

  function shutdown() external isAuthorized {
    live = 0;
  }

  uint256 constant ONE = 10**27;

  function join(address usr, uint256 wad) external {
    ledger.transferDebt(address(this), usr, ONE * wad);
    stablecoin.burn(msg.sender, wad);
  }

  function exit(address usr, uint256 wad) external {
    require(live == 1, "StablecoinJoin/not-live");
    ledger.transferDebt(msg.sender, address(this), ONE * wad);
    stablecoin.mint(usr, wad);
  }
}
