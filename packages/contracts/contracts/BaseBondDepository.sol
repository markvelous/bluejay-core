// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./interface/IBaseBondDepository.sol";

contract BaseBondDepository is IBaseBondDepository {
  uint256 public vestingPeriod; // [seconds]

  // Bonds states
  // TODO: check if there is a need for no. outstanding bonds
  uint256 public bondsCount;
  mapping(uint256 => Bond) public bonds;
  mapping(uint256 => address) public bondOwners;
  mapping(address => uint256[]) public ownedBonds;
  mapping(address => mapping(uint256 => uint256)) public ownedBondsIndex;

  function _mint(address to, uint256 payout) internal returns (uint256 bondId) {
    bondId = ++bondsCount;
    bonds[bondId] = Bond({
      id: bondId,
      principal: payout,
      vestingPeriod: vestingPeriod,
      lastRedeemed: block.timestamp
    });
    bondOwners[bondId] = to;

    // Operations for enumeration
    ownedBondsIndex[to][bondId] = ownedBonds[to].length;
    ownedBonds[to].push(bondId);
  }

  function _burn(uint256 bondId) internal {
    // Operations for enumeration
    address bondOwner = bondOwners[bondId];

    uint256 lastBondIndex = ownedBonds[bondOwner].length - 1;
    uint256 bondIndex = ownedBondsIndex[bondOwner][bondId];

    if (bondIndex != lastBondIndex) {
      uint256 lastBondId = ownedBonds[bondOwner][lastBondIndex];

      ownedBonds[bondOwner][bondIndex] = lastBondId;
      ownedBondsIndex[bondOwner][lastBondId] = bondIndex;
    }

    ownedBonds[bondOwner].pop();
    delete ownedBondsIndex[bondOwner][bondId];

    // Deletion of bond
    delete bonds[bondId];
    delete bondOwners[bondId];
  }

  // View functions
  function listBondIds(address owner)
    public
    view
    override
    returns (uint256[] memory bondIds)
  {
    bondIds = ownedBonds[owner];
  }

  function listBonds(address owner)
    public
    view
    override
    returns (Bond[] memory)
  {
    uint256[] memory bondIds = ownedBonds[owner];
    Bond[] memory bondsOwned = new Bond[](bondIds.length);
    for (uint256 i = 0; i < bondIds.length; i++) {
      bondsOwned[i] = bonds[bondIds[i]];
    }
    return bondsOwned;
  }
}
