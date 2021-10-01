// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./ILedger.sol";
import "./IToken.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StablecoinJoin is Initializable {
  uint256 constant ONE = 10**27;

  mapping(address => uint256) public authorizedAccounts;
  ILedger public ledger; // CDP Engine
  IToken public stablecoin; // Stablecoin Token
  uint256 public live; // Active Flag

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event Deposit(address indexed user, uint256 amount);
  event Withdraw(address indexed user, uint256 amount);

  function initialize(address ledger_, address stablecoin_) public initializer {
    authorizedAccounts[msg.sender] = 1;
    live = 1;
    ledger = ILedger(ledger_);
    stablecoin = IToken(stablecoin_);
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
      "StablecoinJoin/not-authorized"
    );
    _;
  }

  function shutdown() external isAuthorized {
    live = 0;
  }

  function deposit(address user, uint256 wad) external {
    ledger.transferDebt(address(this), user, ONE * wad);
    stablecoin.burnFrom(msg.sender, wad);
    emit Deposit(user, wad);
  }

  function withdraw(address user, uint256 wad) external {
    require(live == 1, "StablecoinJoin/not-live");
    ledger.transferDebt(msg.sender, address(this), ONE * wad);
    stablecoin.mint(user, wad);
    emit Withdraw(user, wad);
  }
}
