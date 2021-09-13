import { ethers } from "hardhat";
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { BigNumber, constants } from "ethers";
import { exp } from "./utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const whenCoreDeployed = async () => {
  const accounts = await ethers.getSigners();
  const SimpleCollateral = await ethers.getContractFactory("SimpleCollateral");
  const SimpleOracle = await ethers.getContractFactory("SimpleOracle");
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const StablecoinJoin = await ethers.getContractFactory("StablecoinJoin");
  const CollateralJoin = await ethers.getContractFactory("CollateralJoin");
  const OracleRelayer = await ethers.getContractFactory("OracleRelayer");
  const CoreEngine = await ethers.getContractFactory("CoreEngine");

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

  // Permissions
  coreEngine.grantAuthorization(oracleRelayer.address);
  coreEngine.grantAuthorization(collateralJoin.address);
  coreEngine.grantAuthorization(stablecoinJoin.address);

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
  };
};

const normalizeByRate = (amount: BigNumber, rate: BigNumber) => {
  return amount.div(rate);
};

describe("E2E", () => {
  it("should allow user to mint and withdraw stablecoin", async () => {
    const {
      accounts,
      collateral,
      collateralJoin,
      coreEngine,
      collateralType,
      stablecoinJoin,
      stablecoin,
    } = await whenCoreDeployed();
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
        normalizeByRate(exp(45).mul(10000 * 1000), exp(27))
      );

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
});
