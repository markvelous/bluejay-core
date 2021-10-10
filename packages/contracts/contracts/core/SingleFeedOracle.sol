// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface OracleLike {
  function getPrice() external returns (uint256, bool);
}

contract SingleFeedOracle is OracleLike, Initializable {
  uint16 constant ONE_HOUR = uint16(3600);

  mapping(address => uint256) public authorizedAccounts;
  uint256 public tokenPrice;
  uint64 public timestampRounding;

  // --- Events ---
  event GrantAuthorization(address indexed account);
  event RevokeAuthorization(address indexed account);
  event UpdatePrice(uint64 indexed timestamp, uint256 price);
  event UpdateRounding(uint64 rounding);

  modifier isAuthorized() {
    require(authorizedAccounts[msg.sender] == 1, "SFO/not-authorized");
    _;
  }

  // --- Init ---
  function initialize() public initializer {
    authorizedAccounts[msg.sender] = 1;
    timestampRounding = ONE_HOUR;
    emit GrantAuthorization(msg.sender);
  }

  function grantAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 1;
    emit GrantAuthorization(user);
  }

  function revokeAuthorization(address user) external isAuthorized {
    authorizedAccounts[user] = 0;
    emit RevokeAuthorization(user);
  }

  function updateTimestampRounding(uint64 rounding) external isAuthorized {
    require(rounding != 0, "SFO/timestamp-rounding-is-zero");
    timestampRounding = rounding;
    emit UpdateRounding(rounding);
  }

  function roundTimestamp(uint256 timestamp) internal view returns (uint64) {
    require(timestampRounding != 0, "SFO/timestamp-rounding-is-zero");
    return uint64(timestamp - (timestamp % timestampRounding));
  }

  function setPrice(uint256 value) public isAuthorized {
    tokenPrice = value;
    emit UpdatePrice(roundTimestamp(block.timestamp), value);
  }

  function getPrice() public view override returns (uint256, bool) {
    return (tokenPrice, true);
  }
}
