import { ethers } from "hardhat";
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { BigNumber, constants } from "ethers";
import { exp, incrementTime } from "./utils";
import { enableAllLog } from "../src/debug";

enableAllLog();

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const TEMP_ACCOUNTING_ENGINE_ADDR =
  "0x6A646C9Da20391dAD50ce58D06bf35040D3aF4fb";
const DEFAULT_SAVINGS_RATE = BigNumber.from("1000000003022265980097387651"); // 10% per year, root(1.1, 365*24*60*60) * exp(27)
const normalizeByRate = (amount: BigNumber, rate: BigNumber) => {
  return amount.div(rate);
};

const whenCoreDeployed = async () => {
  const accounts = await ethers.getSigners();
  const SimpleCollateral = await ethers.getContractFactory("SimpleCollateral");
  const SimpleOracle = await ethers.getContractFactory("SimpleOracle");
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const StablecoinJoin = await ethers.getContractFactory("StablecoinJoin");
  const CollateralJoin = await ethers.getContractFactory("CollateralJoin");
  const OracleRelayer = await ethers.getContractFactory("OracleRelayer");
  const CoreEngine = await ethers.getContractFactory("CoreEngine");
  const SavingsAccount = await ethers.getContractFactory("SavingsAccount");

  const collateral = await SimpleCollateral.deploy();
  const oracle = await SimpleOracle.deploy();
  const stablecoin = await Stablecoin.deploy("Myanmar Kyat Tracker", "MMKT");

  const collateralType = keccak256(collateral.address);
  const coreEngine = await CoreEngine.deploy();
  const collateralJoin = await CollateralJoin.deploy(
    coreEngine.address,
    collateralType,
    collateral.address
  );
  const stablecoinJoin = await StablecoinJoin.deploy(
    coreEngine.address,
    stablecoin.address
  );
  const oracleRelayer = await OracleRelayer.deploy(coreEngine.address);
  const savingsAccount = await SavingsAccount.deploy(coreEngine.address);

  // Permissions
  coreEngine.grantAuthorization(oracleRelayer.address);
  coreEngine.grantAuthorization(collateralJoin.address);
  coreEngine.grantAuthorization(stablecoinJoin.address);
  coreEngine.grantAuthorization(savingsAccount.address);

  // Initializations
  await coreEngine.initializeCollateralType(collateralType);
  await coreEngine.updateDebtCeiling(
    collateralType,
    exp(45).mul(1000000 * 1000)
  );
  await coreEngine.updateDebtFloor(collateralType, exp(45).mul(100));
  await coreEngine.updateTotalDebtCeiling(exp(45).mul(1000000 * 1000));

  await stablecoin.grantRole(MINTER_ROLE, stablecoinJoin.address);

  await oracle.setPrice(exp(18).mul(1500));

  await oracleRelayer.updateOracle(collateralType, oracle.address);
  await oracleRelayer.updateCollateralizationRatio(
    collateralType,
    exp(27).mul(150).div(100)
  );
  await oracleRelayer.updateCollateralPrice(collateralType);
  await savingsAccount.updateSavingsRate(DEFAULT_SAVINGS_RATE);
  await savingsAccount.updateAccountingEngine(TEMP_ACCOUNTING_ENGINE_ADDR);

  // Account Initializations
  const [, account1, account2] = accounts;
  await collateral.mint(account1.address, exp(18).mul(10000));
  await collateral.mint(account2.address, exp(18).mul(10000));

  return {
    accounts,
    collateral,
    collateralType,
    collateralJoin,
    stablecoin,
    stablecoinJoin,
    coreEngine,
    oracleRelayer,
    oracle,
    savingsAccount,
  };
};

const whenDebtDrawn = async ({
  debtDrawn = exp(45).mul(10000 * 1000),
}: {
  debtDrawn?: BigNumber;
} = {}) => {
  const status = await whenCoreDeployed();
  const { accounts, collateral, collateralJoin, coreEngine, collateralType } =
    status;
  const [, account1] = accounts;

  // Allow collateralJoin to transfer collateral from account
  await collateral
    .connect(account1)
    .approve(collateralJoin.address, constants.MaxUint256);

  // Deposit 100k into collateralJoin
  await collateralJoin
    .connect(account1)
    .join(account1.address, exp(18).mul(10000));

  // Draw 10,000,000 max debt (10000 * 1500 / 150%)
  await coreEngine
    .connect(account1)
    .modifyPositionCollateralization(
      collateralType,
      account1.address,
      account1.address,
      account1.address,
      exp(18).mul(10000),
      normalizeByRate(debtDrawn, exp(27))
    );
  return status;
};

describe("E2E", () => {
  it("should allow user to mint and withdraw stablecoin", async () => {
    const { collateralType, coreEngine, stablecoinJoin, accounts, stablecoin } =
      await whenDebtDrawn();
    const [, account1] = accounts;

    // Withdraw as stablecoin
    await stablecoinJoin
      .connect(account1)
      .exit(account1.address, exp(18).mul(10000 * 1000));

    // Should have the right amount of stablecoin
    expect(await stablecoin.balanceOf(account1.address)).to.equal(
      exp(18).mul(10000 * 1000)
    );

    // System parameters should be correct
    expect(await coreEngine.totalDebt()).to.equal(exp(45).mul(10000 * 1000));
    expect(await coreEngine.totalUnbackedDebt()).to.equal(0);

    // Collateral parameters should be correct
    const collateralData = await coreEngine.collateralTypes(collateralType);
    expect(collateralData.normalizedDebt).to.equal(exp(18).mul(10000 * 1000));
  });

  it("should allow user to save (assuming zero stability fee)", async () => {
    const { savingsAccount, accounts, coreEngine } = await whenDebtDrawn();
    const [, account1] = accounts;

    // Start saving in the SavingsAccount module
    await savingsAccount.connect(account1).join(
      exp(45)
        .mul(10000 * 1000 - 100)
        .div(DEFAULT_SAVINGS_RATE)
    );

    // After one year
    await incrementTime(60 * 60 * 24 * 365, ethers.provider);
    await savingsAccount.connect(account1).updateAccumulatedRate();

    const totalDebt = await coreEngine.totalDebt();
    expect(totalDebt).to.be.gt(exp(45).mul(10900000));
    expect(totalDebt).to.be.lt(exp(45).mul(11000000));

    const totalUnbackedDebt = await coreEngine.totalUnbackedDebt();
    expect(totalUnbackedDebt).to.be.gt(exp(45).mul(900000));
    expect(totalUnbackedDebt).to.be.lt(exp(45).mul(1000000));

    // Withdraw savings
    const totalSavings = await savingsAccount.savings(account1.address);
    await savingsAccount.connect(account1).exit(totalSavings);

    const accountBalance = await coreEngine.debt(account1.address);
    expect(accountBalance).to.be.gt(exp(45).mul(10900000));
    expect(accountBalance).to.be.lt(exp(45).mul(11000000));

    const unbackedDebt = await coreEngine.unbackedDebt(
      TEMP_ACCOUNTING_ENGINE_ADDR
    );
    expect(unbackedDebt).to.be.gt(exp(45).mul(900000));
    expect(unbackedDebt).to.be.lt(exp(45).mul(1000000));
  });
});
