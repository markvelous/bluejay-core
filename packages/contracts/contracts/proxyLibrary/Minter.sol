pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../core/Ledger.sol";
import "../core/CollateralJoin.sol";
import "../core/StablecoinJoin.sol";
import "../core/SavingsAccount.sol";

contract Minter {
  uint256 constant RAY = 10**27;

  function joinStablecoin(address stablecoinJoinAddr, uint256 amount) public {
    StablecoinJoin stablecoinJoin = StablecoinJoin(stablecoinJoinAddr);
    IERC20 stablecoin = IERC20(address(stablecoinJoin.stablecoin()));
    stablecoin.transferFrom(msg.sender, address(this), amount);
    stablecoin.approve(stablecoinJoinAddr, amount);
    stablecoinJoin.deposit(address(this), amount);
  }

  function joinCollateral(address collateralJoinAddr, uint256 amount) public {
    CollateralJoin collateralJoin = CollateralJoin(collateralJoinAddr);
    IERC20 collateral = IERC20(address(collateralJoin.collateral()));
    collateral.transferFrom(msg.sender, address(this), amount);
    collateral.approve(collateralJoinAddr, amount);
    collateralJoin.deposit(address(this), amount);
  }

  function exitStablecoin(address stablecoinJoinAddr, uint256 amount) public {
    StablecoinJoin stablecoinJoin = StablecoinJoin(stablecoinJoinAddr);
    IERC20 stablecoin = IERC20(address(stablecoinJoin.stablecoin()));
    stablecoinJoin.withdraw(address(this), amount);
    stablecoin.transfer(msg.sender, amount);
  }

  function exitCollateral(address collateralJoinAddr, uint256 amount) public {
    CollateralJoin collateralJoin = CollateralJoin(collateralJoinAddr);
    IERC20 collateral = IERC20(address(collateralJoin.collateral()));
    collateralJoin.withdraw(address(this), amount);
    collateral.transfer(msg.sender, amount);
  }

  function transferCollateralAndDebt(
    bytes32 collateralType,
    address ledgerAddr,
    address stablecoinJoinAddr,
    address collateralJoinAddr,
    int256 collateralDelta,
    int256 normalizedDebtDelta
  ) public {
    Ledger ledger = Ledger(ledgerAddr);
    (, uint256 accumulatedRate, , , ) = ledger.collateralTypes(collateralType);

    // Deposit collateral if collateralDelta is positive
    if (collateralDelta > 0) {
      joinCollateral(collateralJoinAddr, uint256(collateralDelta));
    }
    // Deposit stablecoin if normalizedDebtDelta is negative
    if (normalizedDebtDelta < 0) {
      uint256 amountToDeposit = (uint256(-normalizedDebtDelta) *
        accumulatedRate) /
        RAY +
        1; // Precision adjustment
      joinStablecoin(stablecoinJoinAddr, amountToDeposit);
    }
    // Modify ledger
    ledger.modifyPositionCollateralization(
      collateralType,
      address(this),
      address(this),
      address(this),
      collateralDelta,
      normalizedDebtDelta
    );
    // Withdraw collateral if collateralDelta is negative
    if (collateralDelta < 0) {
      exitCollateral(collateralJoinAddr, uint256(-collateralDelta));
    }
    // Withdraw stablecoin if normalizedDebtDelta is positive
    if (normalizedDebtDelta > 0) {
      uint256 amountToWithdraw = (uint256(normalizedDebtDelta) *
        accumulatedRate) / RAY;
      exitStablecoin(stablecoinJoinAddr, amountToWithdraw);
    }
  }

  function transferSavings(
    address savingsAccountAddr,
    address stablecoinJoinAddr,
    int256 debtDelta
  ) public {
    SavingsAccount savingsAccount = SavingsAccount(savingsAccountAddr);
    savingsAccount.updateAccumulatedRate();
    uint256 accumulatedRates = savingsAccount.accumulatedRates();

    // If positive debtDelta deposit stablecoin
    if (debtDelta > 0) {
      joinStablecoin(stablecoinJoinAddr, uint256(debtDelta));
      savingsAccount.deposit((uint256(debtDelta) * RAY) / accumulatedRates);
    }

    // If negative debtDelta withdraw stablecoin
    if (debtDelta < 0) {
      savingsAccount.withdraw((uint256(-debtDelta) * RAY) / accumulatedRates);
      exitStablecoin(stablecoinJoinAddr, uint256(-debtDelta));
    }
  }
}
