// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IBaseBondDepository {
  struct Bond {
    uint256 id;
    uint256 principal; // [wad]
    uint256 vestingPeriod; // [seconds]
    uint256 lastRedeemed; // [unix timestamp]
  }

  function listBondIds(address owner)
    external
    view
    returns (uint256[] memory bondIds);

  function listBonds(address owner) external view returns (Bond[] memory);
}
