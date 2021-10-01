// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Stablecoin is
  Initializable,
  UUPSUpgradeable,
  ERC20Upgradeable,
  ERC20BurnableUpgradeable,
  AccessControlUpgradeable,
  ERC20PermitUpgradeable
{
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  function initialize(string memory name, string memory symbol)
    public
    initializer
  {
    __UUPSUpgradeable_init();
    __ERC20_init(name, symbol);
    __ERC20Burnable_init();
    __AccessControl_init();
    __ERC20Permit_init(name); // Note: Replay attack possible on netwwork with same chain id

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(MINTER_ROLE, msg.sender);
  }

  function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
  {}
}
