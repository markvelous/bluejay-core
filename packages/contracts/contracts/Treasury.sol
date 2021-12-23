// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interface/ITreasury.sol";

interface IERC20Mintable is IERC20 {
  function mint(address to, uint256 amount) external;
}

contract Treasury is
  Initializable,
  AccessControlUpgradeable,
  UUPSUpgradeable,
  ITreasury
{
  using SafeERC20 for IERC20;

  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");

  IERC20Mintable public BLU;

  function initialize(address _BLU) public initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    BLU = IERC20Mintable(_BLU);
  }

  function mint(address to, uint256 amount)
    public
    override
    onlyRole(MINTER_ROLE)
  {
    BLU.mint(to, amount);
    emit Mint(to, amount);
  }

  function withdraw(
    address token,
    address to,
    uint256 amount
  ) public override onlyRole(TREASURER_ROLE) {
    IERC20(token).safeTransfer(to, amount);
    emit Withdraw(token, to, amount);
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(UPGRADER_ROLE)
  {}
}
