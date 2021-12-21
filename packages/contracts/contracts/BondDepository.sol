// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BaseBondDepository.sol";

interface ITreasury {
  function mint(address to, uint256 amount) external;
}

interface IBondGovernor {
  function getPolicy(address reserve)
    external
    view
    returns (
      uint256 controlVariable,
      uint256 totalDebtCeiling,
      uint256 minimumPrice,
      uint256 minimumSize,
      uint256 maximumSize,
      uint256 fees
    );
}

// Assumptions
// - Reserve reserves / LP tokens will have 1e18 decimal place (untrue for USDC)
//   - Can potentially add scaling factor in purchase to add decimals to `amount`
// TODO
// - Add auto stake function
contract BondDepository is
  Initializable,
  OwnableUpgradeable,
  UUPSUpgradeable,
  BaseBondDepository
{
  using SafeERC20 for IERC20;

  uint256 constant WAD = 10**18;
  uint256 constant RAY = 10**27;
  uint256 constant RAD = 10**45;

  // Immutables - set in initializer only
  IERC20 public BLU;
  IERC20 public reserve;
  ITreasury public treasury;
  address public dao;

  // Global states
  IBondGovernor public bondGovernor;
  uint256 public totalDebt; // [WAD]
  uint256 public lastDecay; // [unix timestamp]

  function initialize(
    address _bondGovernor,
    address _reserve,
    address _BLU,
    address _treasury,
    address _dao,
    uint256 _vestingPeriod
  ) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();

    bondGovernor = IBondGovernor(_bondGovernor);
    reserve = IERC20(_reserve);
    BLU = IERC20(_BLU);
    treasury = ITreasury(_treasury);
    dao = _dao;
    vestingPeriod = _vestingPeriod;
  }

  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) public returns (uint256 bondId) {
    (
      ,
      uint256 totalDebtCeiling,
      ,
      uint256 minimumSize,
      uint256 maximumSize,
      uint256 fees
    ) = bondGovernor.getPolicy(address(reserve));
    require(recipient != address(0), "Invalid address");

    decayDebt();

    uint256 price = bondPrice();
    require(price <= maxPrice, "Price too high");

    uint256 payout = (amount * WAD) / price;
    require(payout >= minimumSize, "Bond size too small");
    require(payout <= maximumSize, "Bond size too big");

    uint256 revenue = (payout * fees) / WAD;
    reserve.safeTransferFrom(msg.sender, address(this), amount);
    reserve.safeTransfer(address(treasury), amount);
    treasury.mint(address(this), payout + revenue);

    if (revenue > 0) {
      BLU.safeTransfer(dao, revenue);
    }

    bondId = _mint(recipient, payout);
    totalDebt += payout;
    require(totalDebt <= totalDebtCeiling, "Exceeds debt ceiling");
  }

  function redeem(uint256 bondId, address recipient) public {
    require(bondOwners[bondId] == msg.sender, "Not owner of bond");
    Bond memory bond = bonds[bondId];
    if (bond.lastRedeemed + bond.vestingPeriod <= block.timestamp) {
      _burn(bondId);
      BLU.safeTransfer(recipient, bond.principal);
    } else {
      uint256 payout = (bond.principal *
        (block.timestamp - bond.lastRedeemed)) / bond.vestingPeriod;
      bonds[bondId] = Bond({
        id: bond.id,
        principal: bond.principal - payout,
        vestingPeriod: bond.vestingPeriod -
          (block.timestamp - bond.lastRedeemed),
        lastRedeemed: block.timestamp
      });
      BLU.safeTransfer(recipient, payout);
    }
  }

  function decayDebt() internal {
    totalDebt = totalDebt - debtDecay();
    lastDecay = block.timestamp;
  }

  // View functions
  function currentDebt() public view returns (uint256) {
    return totalDebt - debtDecay();
  }

  function debtDecay() public view returns (uint256 decay) {
    uint256 blocksSinceLast = block.timestamp - lastDecay;
    decay = (totalDebt * blocksSinceLast) / vestingPeriod;
    if (decay > totalDebt) {
      decay = totalDebt;
    }
  }

  function debtRatio() public view returns (uint256 ratio) {
    ratio = (currentDebt() * WAD) / BLU.totalSupply();
  }

  function bondPrice() public view returns (uint256 price) {
    (uint256 controlVariable, , uint256 minimumPrice, , , ) = bondGovernor
      .getPolicy(address(reserve));
    price = (controlVariable * debtRatio() + RAD) / RAY;
    if (price < minimumPrice) {
      price = minimumPrice;
    }
  }

  // Admin functions
  function setBondGovernor(address _bondGovernor) public onlyOwner {
    bondGovernor = IBondGovernor(_bondGovernor);
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyOwner
  {}
}
