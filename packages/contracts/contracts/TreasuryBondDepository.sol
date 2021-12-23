// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./BaseBondDepository.sol";

import "./interface/ITreasuryBondDepository.sol";
import "./interface/IBondGovernor.sol";
import "./interface/ITreasury.sol";

// Note: Can only be used for assets with 18 decimals
contract TreasuryBondDepository is
  Initializable,
  OwnableUpgradeable,
  UUPSUpgradeable,
  BaseBondDepository,
  ITreasuryBondDepository
{
  using SafeERC20 for IERC20;

  uint256 constant WAD = 10**18;
  uint256 constant RAY = 10**27;
  uint256 constant RAD = 10**45;

  IERC20 public BLU;
  IERC20 public reserve;
  ITreasury public treasury;
  IBondGovernor public bondGovernor;
  address public feeCollector;

  bool public isPurchasePaused;
  bool public isRedeemPaused;

  uint256 public totalDebt; // [WAD]
  uint256 public lastDecay; // [unix timestamp]

  function initialize(
    address _bondGovernor,
    address _reserve,
    address _BLU,
    address _treasury,
    address _feeCollector,
    uint256 _vestingPeriod
  ) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();

    bondGovernor = IBondGovernor(_bondGovernor);
    reserve = IERC20(_reserve);
    BLU = IERC20(_BLU);
    treasury = ITreasury(_treasury);
    feeCollector = _feeCollector;
    vestingPeriod = _vestingPeriod;

    emit UpdatedBondGovernor(_bondGovernor);
  }

  // Internal functions
  function _decayDebt() internal {
    totalDebt = totalDebt - debtDecay();
    lastDecay = block.timestamp;
  }

  // Public functions
  function purchase(
    uint256 amount,
    uint256 maxPrice,
    address recipient
  ) public override returns (uint256 bondId) {
    require(!isPurchasePaused, "Purchase paused");
    (
      ,
      uint256 totalDebtCeiling,
      ,
      uint256 minimumSize,
      uint256 maximumSize,
      uint256 fees
    ) = bondGovernor.getPolicy(address(reserve));
    require(recipient != address(0), "Invalid address");

    _decayDebt();

    uint256 price = bondPrice();
    require(price <= maxPrice, "Price too high");

    uint256 payout = (amount * WAD) / price;
    require(payout >= minimumSize, "Bond size too small");
    require(payout <= maximumSize, "Bond size too big");

    uint256 feeCollected = (payout * fees) / WAD;
    reserve.safeTransferFrom(msg.sender, address(this), amount);
    reserve.safeTransfer(address(treasury), amount);
    treasury.mint(address(this), payout + feeCollected);

    if (feeCollected > 0) {
      BLU.safeTransfer(feeCollector, feeCollected);
    }

    bondId = _mint(recipient, payout);
    totalDebt += payout;
    require(totalDebt <= totalDebtCeiling, "Exceeds debt ceiling");

    emit BondPurchased(bondId, recipient, amount, payout, price);
  }

  function redeem(uint256 bondId, address recipient)
    public
    override
    returns (uint256 payout)
  {
    require(!isRedeemPaused, "Redeem paused");
    require(bondOwners[bondId] == msg.sender, "Not bond owner");
    Bond memory bond = bonds[bondId];
    if (bond.lastRedeemed + bond.vestingPeriod <= block.timestamp) {
      _burn(bondId);
      payout = bond.principal;
      BLU.safeTransfer(recipient, bond.principal);
      emit BondRedeemed(bondId, recipient, true, payout, 0);
    } else {
      payout =
        (bond.principal * (block.timestamp - bond.lastRedeemed)) /
        bond.vestingPeriod;
      uint256 principal = bond.principal - payout;
      bonds[bondId] = Bond({
        id: bond.id,
        principal: principal,
        vestingPeriod: bond.vestingPeriod -
          (block.timestamp - bond.lastRedeemed),
        lastRedeemed: block.timestamp
      });
      BLU.safeTransfer(recipient, payout);
      emit BondRedeemed(bondId, recipient, false, payout, principal);
    }
  }

  // Admin functions
  function setBondGovernor(address _bondGovernor) public override onlyOwner {
    bondGovernor = IBondGovernor(_bondGovernor);
    emit UpdatedBondGovernor(_bondGovernor);
  }

  function setFeeCollector(address _feeCollector) public override onlyOwner {
    feeCollector = _feeCollector;
    emit UpdatedFeeCollector(_feeCollector);
  }

  function setIsRedeemPaused(bool pause) public override onlyOwner {
    isRedeemPaused = pause;
  }

  function setIsPurchasePaused(bool pause) public override onlyOwner {
    isPurchasePaused = pause;
  }

  // View functions
  function currentDebt() public view override returns (uint256) {
    return totalDebt - debtDecay();
  }

  function debtDecay() public view override returns (uint256 decay) {
    uint256 blocksSinceLast = block.timestamp - lastDecay;
    decay = (totalDebt * blocksSinceLast) / vestingPeriod;
    if (decay > totalDebt) {
      decay = totalDebt;
    }
  }

  function debtRatio() public view override returns (uint256 ratio) {
    ratio = (currentDebt() * WAD) / BLU.totalSupply();
  }

  function bondPrice() public view override returns (uint256 price) {
    (uint256 controlVariable, , uint256 minimumPrice, , , ) = bondGovernor
      .getPolicy(address(reserve));
    price = (controlVariable * debtRatio() + RAD) / RAY;
    if (price < minimumPrice) {
      price = minimumPrice;
    }
  }

  // Required overrides
  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyOwner
  {}
}
