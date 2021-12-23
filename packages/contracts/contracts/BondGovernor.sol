// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "./interface/IBondGovernor.sol";

contract BondGovernor is Ownable, IBondGovernor {
  uint256 constant WAD = 10**18;
  uint256 constant RAY = 10**27;

  IERC20 immutable BLU;

  uint256 minimumSize; // [wad]
  uint256 maximumRatio; // [wad]
  uint256 fees; // [wad]

  mapping(address => Policy) public policies;

  modifier policyExist(address asset) {
    require(policies[asset].controlVariable != 0, "Policy not initialized");
    _;
  }

  constructor(address _BLU) {
    BLU = IERC20(_BLU);
    minimumSize = WAD / 1000; // 1 thousandth of the token [wad]
    maximumRatio = WAD / 100; // 1% of total token supply [wad]
    fees = WAD / 5; // 20% of sale proceeds [wad]
  }

  // Public Functions
  function updateControlVariable(address asset)
    public
    override
    policyExist(asset)
  {
    uint256 currentControlVariable = getControlVariable(asset);
    policies[asset].controlVariable = currentControlVariable;
    policies[asset].lastControlVariableUpdate = block.timestamp;
  }

  // Admin Functions
  function initializePolicy(
    address asset,
    uint256 controlVariable,
    uint256 totalDebtCeiling,
    uint256 minimumPrice
  ) public override onlyOwner {
    require(
      policies[asset].controlVariable == 0,
      "Policy has been initialized"
    );
    require(controlVariable >= RAY, "Control variable less than 1");
    policies[asset] = Policy({
      controlVariable: controlVariable,
      lastControlVariableUpdate: block.timestamp,
      targetControlVariable: controlVariable,
      timeToTargetControlVariable: 0,
      totalDebtCeiling: totalDebtCeiling,
      minimumPrice: minimumPrice
    });
    emit CreatedPolicy(asset, controlVariable, totalDebtCeiling, minimumPrice);
  }

  function adjustPolicy(
    address asset,
    uint256 targetControlVariable,
    uint256 timeToTargetControlVariable,
    uint256 totalDebtCeiling,
    uint256 minimumPrice
  ) public override onlyOwner policyExist(asset) {
    require(
      targetControlVariable >= RAY,
      "Target control variable less than 1"
    );

    updateControlVariable(asset);
    policies[asset].targetControlVariable = targetControlVariable;
    policies[asset].timeToTargetControlVariable = timeToTargetControlVariable;
    policies[asset].totalDebtCeiling = totalDebtCeiling;
    policies[asset].minimumPrice = minimumPrice;
    emit UpdatedPolicy(
      asset,
      targetControlVariable,
      totalDebtCeiling,
      minimumPrice,
      timeToTargetControlVariable
    );
  }

  function setFees(uint256 _fees) public override onlyOwner {
    require(_fees <= WAD, "Fees greater than 100%");
    fees = _fees;
    emit UpdatedFees(fees);
  }

  function setMinimumSize(uint256 _minimumSize) public override onlyOwner {
    minimumSize = _minimumSize;
    emit UpdatedMinimumSize(minimumSize);
  }

  function setMaximumRatio(uint256 _maximumRatio) public override onlyOwner {
    require(_maximumRatio <= WAD, "Maximum ratio greater than 100%");
    maximumRatio = _maximumRatio;
    emit UpdatedMaximumRatio(maximumRatio);
  }

  // View Functions
  function getControlVariable(address asset)
    public
    view
    override
    policyExist(asset)
    returns (uint256)
  {
    Policy memory policy = policies[asset];

    // Target control variable is reached
    if (
      policy.controlVariable == policy.targetControlVariable ||
      policy.lastControlVariableUpdate + policy.timeToTargetControlVariable <=
      block.timestamp
    ) {
      return policy.controlVariable;
    }

    // Target control variable is not reached
    uint256 progress = ((block.timestamp - policy.lastControlVariableUpdate) *
      WAD) / policy.timeToTargetControlVariable;

    if (policy.controlVariable <= policy.targetControlVariable) {
      return
        policy.controlVariable +
        (progress * (policy.targetControlVariable - policy.controlVariable)) /
        WAD;
    } else {
      return
        policy.controlVariable -
        (progress * (policy.controlVariable - policy.targetControlVariable)) /
        WAD;
    }
  }

  function maximumBondSize()
    public
    view
    override
    returns (uint256 maximumSize)
  {
    maximumSize = (BLU.totalSupply() * maximumRatio) / WAD;
  }

  function getPolicy(address asset)
    public
    view
    override
    policyExist(asset)
    returns (
      uint256,
      uint256,
      uint256,
      uint256,
      uint256,
      uint256
    )
  {
    return (
      getControlVariable(asset),
      policies[asset].totalDebtCeiling,
      policies[asset].minimumPrice,
      minimumSize,
      maximumBondSize(),
      fees
    );
  }
}
