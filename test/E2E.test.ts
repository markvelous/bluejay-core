import { ethers } from "hardhat";
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { BigNumber, constants, Contract, Signer } from "ethers";
import { exp, incrementTime } from "./utils";
import { enableAllLog } from "../src/debug";

enableAllLog();

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const DEFAULT_SAVINGS_RATE = BigNumber.from("1000000003022265980097387651"); // 10% per year, root(1.1, 365*24*60*60) * exp(27)
const DEFAULT_STABILITY_FEE = BigNumber.from("1000000004431822129783699001"); // 15% per year, root(1.15, 365*24*60*60) * exp(27)
const normalizeByRate = (amount: BigNumber, rate: BigNumber) => {
  return amount.div(rate);
};

interface WhenCoreDeployed {
  stabilityFee?: BigNumber;
  globalStabilityFee?: BigNumber;
}

const whenCoreDeployed = async ({
  stabilityFee = DEFAULT_STABILITY_FEE,
  globalStabilityFee = BigNumber.from(0),
}: WhenCoreDeployed = {}) => {
  const accounts = await ethers.getSigners();
  const SimpleCollateral = await ethers.getContractFactory("SimpleCollateral");
  const SimpleOracle = await ethers.getContractFactory("SimpleOracle");
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const StablecoinJoin = await ethers.getContractFactory("StablecoinJoin");
  const CollateralJoin = await ethers.getContractFactory("CollateralJoin");
  const OracleRelayer = await ethers.getContractFactory("OracleRelayer");
  const CoreEngine = await ethers.getContractFactory("CoreEngine");
  const SavingsAccount = await ethers.getContractFactory("SavingsAccount");
  const FeesEngine = await ethers.getContractFactory("FeesEngine");
  const AccountingEngine = await ethers.getContractFactory("AccountingEngine");
  const DiscountCalculator = await ethers.getContractFactory(
    "StairstepExponentialDecrease"
  );
  const LiquidationAuction = await ethers.getContractFactory(
    "LiquidationAuction"
  );
  const LiquidationEngine = await ethers.getContractFactory(
    "LiquidationEngine"
  );
  const SimpleGovernanceToken = await ethers.getContractFactory(
    "SimpleGovernanceToken"
  );
  const SurplusAuction = await ethers.getContractFactory("SurplusAuction");
  const DebtAuction = await ethers.getContractFactory("DebtAuction");

  const collateral = await SimpleCollateral.deploy();
  const oracle = await SimpleOracle.deploy();
  const stablecoin = await Stablecoin.deploy("Myanmar Kyat Tracker", "MMKT");
  const governanceToken = await SimpleGovernanceToken.deploy();
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
  const feesEngine = await FeesEngine.deploy(coreEngine.address);
  const surplusAuction = await SurplusAuction.deploy(
    coreEngine.address,
    governanceToken.address
  );
  const debtAuction = await DebtAuction.deploy(
    coreEngine.address,
    governanceToken.address
  );
  const accountingEngine = await AccountingEngine.deploy(
    coreEngine.address,
    surplusAuction.address,
    debtAuction.address
  );
  const discountCalculator = await DiscountCalculator.deploy();
  const liquidationEngine = await LiquidationEngine.deploy(coreEngine.address);
  const liquidationAuction = await LiquidationAuction.deploy(
    coreEngine.address,
    oracleRelayer.address,
    liquidationEngine.address,
    collateralType
  );

  // Permissions
  coreEngine.grantAuthorization(oracleRelayer.address);
  coreEngine.grantAuthorization(collateralJoin.address);
  coreEngine.grantAuthorization(stablecoinJoin.address);
  coreEngine.grantAuthorization(savingsAccount.address);
  coreEngine.grantAuthorization(feesEngine.address);
  coreEngine.grantAuthorization(accountingEngine.address);
  coreEngine.grantAuthorization(liquidationEngine.address);
  coreEngine.grantAuthorization(liquidationAuction.address);
  coreEngine.grantAuthorization(debtAuction.address);

  accountingEngine.grantAuthorization(liquidationEngine.address);

  liquidationAuction.grantAuthorization(liquidationEngine.address);
  liquidationEngine.grantAuthorization(liquidationAuction.address);

  surplusAuction.grantAuthorization(accountingEngine.address);

  // Initializations
  await governanceToken.initialize();
  await governanceToken.grantRole(MINTER_ROLE, accounts[0].address);
  await governanceToken.grantRole(MINTER_ROLE, debtAuction.address);

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
  await savingsAccount.updateAccountingEngine(accountingEngine.address);

  await feesEngine.init(collateralType);
  await feesEngine.updateAccountingEngine(accountingEngine.address);
  await feesEngine.updateStabilityFee(collateralType, stabilityFee);
  await feesEngine.updateGlobalStabilityFee(globalStabilityFee);

  // Reference https://etherscan.io/address/0xA950524441892A31ebddF91d3cEEFa04Bf454466#readContract
  await accountingEngine.updatePopDebtDelay(561600);
  await accountingEngine.updateSurplusAuctionLotSize(exp(45).mul(100000));
  await accountingEngine.updateSurplusBuffer(exp(45).mul(500000));
  await accountingEngine.updateIntialDebtAuctionBid(exp(45).mul(50000));
  await accountingEngine.updateDebtAuctionLotSize(exp(18).mul(1000));

  // Reference https://etherscan.io/address/0x135954d155898D42C90D2a57824C690e0c7BEf1B#readContract
  // Ilk: 0x4554482d43000000000000000000000000000000000000000000000000000000
  await liquidationEngine.updateAccountingEngine(accountingEngine.address);
  await liquidationEngine.updateGlobalMaxDebtForActiveAuctions(
    exp(45).mul(100000000)
  );
  await liquidationEngine.updateLiquidatonPenalty(
    collateralType,
    exp(18).mul(113).div(100)
  );
  await liquidationEngine.updateMaxDebtForActiveAuctions(
    collateralType,
    exp(45).mul(20000000)
  );
  await liquidationEngine.updateLiquidationAuction(
    collateralType,
    liquidationAuction.address
  );

  // Reference https://etherscan.io/address/0xc2b12567523e3f3CBd9931492b91fe65b240bc47
  await liquidationAuction.updateStartingPriceFactor(exp(27).mul(130).div(100));
  await liquidationAuction.updateMaxAuctionDuration(8400);
  await liquidationAuction.updateMaxPriceDiscount(exp(27).mul(40).div(100)); // TODO CHECK VALUE
  await liquidationAuction.updateKeeperRewardFactor(exp(18).div(1000));
  await liquidationAuction.updateKeeperIncentive(exp(45).mul(300));
  await liquidationAuction.updateAccountingEngine(accountingEngine.address);
  await liquidationAuction.updateDiscountCalculator(discountCalculator.address);

  // Reference https://etherscan.io/address/0x1c4fc274d12b2e1bbdf97795193d3148fcda6108
  await discountCalculator.updateStep(60); // 60 sec
  await discountCalculator.updateFactorPerStep(exp(27).mul(99).div(100)); // 0.99 per step

  // Account Initializations
  const [, account1, account2] = accounts;
  await collateral.mint(account1.address, exp(18).mul(10000));
  await collateral.mint(account2.address, exp(18).mul(10000));

  return {
    accounts,
    accountingEngine,
    collateral,
    collateralType,
    collateralJoin,
    stablecoin,
    stablecoinJoin,
    coreEngine,
    surplusAuction,
    oracleRelayer,
    oracle,
    savingsAccount,
    feesEngine,
    governanceToken,
    discountCalculator,
    liquidationEngine,
    liquidationAuction,
    debtAuction,
  };
};

interface WhenDebtDrawn extends WhenCoreDeployed {
  debtDrawn?: BigNumber;
}

const depositCollateralAndDrawDebt = async ({
  collateral,
  collateralJoin,
  coreEngine,
  account,
  collateralType,
  debtDrawn,
  collateralDeposit = exp(18).mul(10000),
}: {
  collateral: Contract;
  collateralJoin: Contract;
  coreEngine: Contract;
  collateralType: string;
  debtDrawn: BigNumber;
  collateralDeposit: BigNumber;
  account: Signer & { address: string };
}) => {
  // Allow collateralJoin to transfer collateral from account
  await collateral
    .connect(account)
    .approve(collateralJoin.address, constants.MaxUint256);

  // Deposit 100k into collateralJoin
  await collateralJoin
    .connect(account)
    .join(account.address, collateralDeposit);

  // Draw 10,000,000 max debt (10000 * 1500 / 150%)
  await coreEngine
    .connect(account)
    .modifyPositionCollateralization(
      collateralType,
      account.address,
      account.address,
      account.address,
      collateralDeposit,
      normalizeByRate(
        debtDrawn,
        (
          await coreEngine.collateralTypes(collateralType)
        ).accumulatedRate
      )
    );
};

const whenDebtDrawn = async ({
  debtDrawn = exp(45).mul(10000 * 1000),
  stabilityFee,
  globalStabilityFee,
}: WhenDebtDrawn = {}) => {
  const status = await whenCoreDeployed({ stabilityFee, globalStabilityFee });
  const { accounts } = status;
  const [, account1] = accounts;

  // Deposit 100k into collateralJoin
  // Draw 10,000,000 max debt (10000 * 1500 / 150%)
  await depositCollateralAndDrawDebt({
    ...status,
    debtDrawn,
    collateralDeposit: exp(18).mul(10000),
    account: account1,
  });

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
    const { savingsAccount, accounts, coreEngine, accountingEngine } =
      await whenDebtDrawn();
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
      accountingEngine.address
    );
    expect(unbackedDebt).to.be.gt(exp(45).mul(900000));
    expect(unbackedDebt).to.be.lt(exp(45).mul(1000000));
  });

  it("should allow stability fees to be collected", async () => {
    const status = await whenDebtDrawn();
    const {
      coreEngine,
      accounts,
      feesEngine,
      collateral,
      collateralType,
      collateralJoin,
      accountingEngine,
    } = status;
    const [, account1, account2] = accounts;

    // Accrues some stability fee through the year
    await incrementTime(60 * 60 * 24 * 365, ethers.provider);
    await feesEngine.updateAccumulatedRate(collateralType);

    expect(await coreEngine.debt(accountingEngine.address)).to.gt(
      exp(45).mul(1500000)
    );
    // Transfer from debt from another account (simulating buy from ext account)
    await depositCollateralAndDrawDebt({
      ...status,
      debtDrawn: exp(45).mul(10000 * 1000),
      collateralDeposit: exp(18).mul(10000),
      account: account2,
    });
    await coreEngine
      .connect(account2)
      .transferDebt(
        account2.address,
        account1.address,
        exp(45).mul(10000 * 1000 - 1)
      );

    // Pay off debt with stability fee and withdraw all collaterals
    const position = await coreEngine.positions(
      collateralType,
      account1.address
    );
    await coreEngine
      .connect(account1)
      .modifyPositionCollateralization(
        collateralType,
        account1.address,
        account1.address,
        account1.address,
        BigNumber.from(0).sub(position.lockedCollateral),
        BigNumber.from(0).sub(position.normalizedDebt)
      );

    // Exit into collateral
    await collateralJoin
      .connect(account1)
      .exit(account1.address, exp(18).mul(10000));
    expect(await collateral.balanceOf(account1.address)).to.equal(
      exp(18).mul(10000)
    );

    // Check that system parameters are correct
    const totalDebt = await coreEngine.totalDebt();
    expect(totalDebt).to.lte(exp(45).mul(10000 * 1000));
    expect(totalDebt).to.gt(exp(45).mul(10000 * 999));

    expect(await coreEngine.totalUnbackedDebt()).to.equal(0);

    const collateralData = await coreEngine.collateralTypes(collateralType);
    const normalizedDebtCeil = Math.floor((10000 * 1000) / 1.14);
    const normalizedDebtFloor = Math.floor((10000 * 1000) / 1.16);
    expect(collateralData.normalizedDebt).to.lte(
      exp(18).mul(normalizedDebtCeil)
    );
    expect(collateralData.normalizedDebt).to.gt(
      exp(18).mul(normalizedDebtFloor)
    );
  });

  it("should allow unsafe positions to be liquidated", async () => {
    const status = await whenDebtDrawn();
    const {
      accounts,
      oracle,
      collateral,
      collateralJoin,
      oracleRelayer,
      liquidationEngine,
      liquidationAuction,
      accountingEngine,
      collateralType,
      coreEngine,
    } = status;
    const [, account1, account2] = accounts;

    await oracle.setPrice(exp(18).mul(1250));
    await oracleRelayer.updateCollateralPrice(collateralType);

    await liquidationEngine
      .connect(account2)
      .liquidatePosition(collateralType, account1.address, account2.address);

    // All drawn debt & locked collateral to be confiscated from the liquidated account
    const {
      lockedCollateral: lockedCollateralAcc1,
      normalizedDebt: normalizedDebtAcc1,
    } = await coreEngine.positions(collateralType, account1.address);
    expect(lockedCollateralAcc1).to.equal(0);
    expect(normalizedDebtAcc1).to.equal(0);
    // Debt is not touched for liquidated position
    expect(await coreEngine.debt(account1.address)).to.equal(
      exp(45).mul(10000 * 1000)
    );

    // Collateral goes to liquidation auction (unlocked)
    expect(
      await coreEngine.collateral(collateralType, liquidationAuction.address)
    ).to.equal(exp(18).mul(10000));

    // Reward credited for starting auction
    const reward = await coreEngine.debt(account2.address);
    expect(reward).to.equal(
      exp(45)
        .mul(10000 * 1000)
        .mul(113)
        .div(100) // x 1.13 for liquidation penalty
        .div(1000)
        .add(exp(45).mul(300))
    ); // Keeper incentive plus debtToRaise * keeperRewardFactor

    // Debt plus reward goes to accounting engine as unbacked debt
    expect(await coreEngine.unbackedDebt(accountingEngine.address)).to.equal(
      exp(45)
        .mul(10000 * 1000)
        .add(reward)
    );

    // Debt is pushed into accounting engine queue
    expect(await accountingEngine.totalQueuedDebt()).to.equal(
      exp(45).mul(10000 * 1000)
    );

    // Auction started
    const { debtToRaise, collateralToSell, position, startingPrice } =
      await liquidationAuction.auction(1);
    expect(debtToRaise).to.equal(
      exp(45)
        .mul(10000 * 1000)
        .mul(113)
        .div(100)
    );
    expect(collateralToSell).to.equal(exp(18).mul(10000));
    expect(position).to.equal(account1.address);
    expect(startingPrice).to.equal(exp(27).mul(1250).mul(130).div(100));

    // Draw some debt for account 2
    const debtDrawnOnAcc2 = exp(45).mul(10000 * 1500);
    await collateral.mint(account2.address, exp(18).mul(100000));
    await depositCollateralAndDrawDebt({
      collateral,
      coreEngine,
      collateralJoin,
      collateralType,
      account: account2,
      debtDrawn: debtDrawnOnAcc2,
      collateralDeposit: exp(18).mul(100000),
    });

    // Wait for liquidation price to drop
    await incrementTime(1600, ethers.provider);

    const {
      price: discountedPrice,
      debtToRaise: debtRequired,
      collateralToSell: collateralLeft,
    } = await liquidationAuction.getAuctionStatus(1);
    expect(discountedPrice).to.be.closeTo(
      exp(27)
        .mul(1250)
        .mul(130)
        .div(100)
        .mul(BigNumber.from(99).pow(26)) // 26 periods have passed
        .div(BigNumber.from(100).pow(26)),
      1000
    );

    // Partial liquidation
    await liquidationAuction
      .connect(account2)
      .bidOnAuction(
        1,
        collateralLeft.div(2),
        discountedPrice,
        account2.address,
        "0x"
      );

    // Auction has not closed
    const {
      debtToRaise: debtRequiredAfterPartial,
      collateralToSell: collateralToSellAfterPartial,
    } = await liquidationAuction.getAuctionStatus(1);

    expect(collateralToSellAfterPartial).to.equal(collateralLeft.div(2));
    expect(debtRequiredAfterPartial).to.equal(
      debtRequired.sub(collateralLeft.div(2).mul(discountedPrice))
    );
    const {
      lockedCollateral: lockedCollateralBeforeClose,
      normalizedDebt: normalizedDebtBeforeClose,
    } = await coreEngine.positions(collateralType, account1.address);

    expect(lockedCollateralBeforeClose).to.equal(0);
    expect(normalizedDebtBeforeClose).to.equal(0);

    // Liquidator has paid debt and collected collateral
    expect(await coreEngine.debt(account2.address)).to.equal(
      exp(45).mul(15011600).sub(collateralLeft.div(2).mul(discountedPrice))
    );
    expect(
      await coreEngine.collateral(collateralType, account2.address)
    ).to.equal(collateralLeft.div(2));

    // // Full liquidation
    await liquidationAuction
      .connect(account2)
      .bidOnAuction(
        1,
        collateralLeft.div(2),
        discountedPrice,
        account2.address,
        "0x"
      );

    // Liquidator paid all debt and received all collaterals
    expect(await coreEngine.debt(account2.address)).to.equal(
      exp(45).mul(15011600).sub(debtRequired)
    );
    expect(
      await coreEngine.collateral(collateralType, account2.address)
    ).to.equal(debtRequired.div(discountedPrice));

    // Liquidated position received remaining collateral as refunds
    expect(
      await coreEngine.collateral(collateralType, account1.address)
    ).to.equal(collateralLeft.sub(debtRequired.div(discountedPrice)));
  });

  it("should allow users to bid on surplus of debt collected from stability fee", async () => {
    const status = await whenDebtDrawn();
    const {
      accounts,
      feesEngine,
      collateralType,
      coreEngine,
      accountingEngine,
      surplusAuction,
      governanceToken,
    } = status;
    const [, account1, account2] = accounts;

    await governanceToken.mint(account1.address, exp(18).mul(150));
    await governanceToken
      .connect(account1)
      .approve(surplusAuction.address, constants.MaxUint256);
    await governanceToken.mint(account2.address, exp(18).mul(300));
    await governanceToken
      .connect(account2)
      .approve(surplusAuction.address, constants.MaxUint256);
    await incrementTime(60 * 60 * 24 * 365, ethers.provider);
    await feesEngine.updateAccumulatedRate(collateralType);

    await accountingEngine.auctionSurplus();

    const { debtToSell } = await surplusAuction.bids(1);
    expect(debtToSell).to.equal(exp(45).mul(100000));

    await surplusAuction
      .connect(account1)
      .placeBid(1, debtToSell, exp(18).mul(150));

    expect(await governanceToken.balanceOf(account1.address)).to.equal(0);
    expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(
      exp(18).mul(150)
    );

    const firstBid = await surplusAuction.bids(1);
    expect(firstBid.bidAmount).to.equal(exp(18).mul(150));
    expect(firstBid.bidExpiry).to.not.equal(0);
    expect(firstBid.highestBidder).to.equal(account1.address);

    await incrementTime(640, ethers.provider);

    await surplusAuction
      .connect(account2)
      .placeBid(1, debtToSell, exp(18).mul(300));

    expect(await governanceToken.balanceOf(account1.address)).to.equal(
      exp(18).mul(150)
    );
    expect(await governanceToken.balanceOf(account2.address)).to.equal(0);
    expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(
      exp(18).mul(300)
    );

    await incrementTime(3 * 60 * 60 + 1, ethers.provider);

    await surplusAuction.connect(account2).settleAuction(1);
    expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(0);
    expect(await governanceToken.totalSupply()).to.equal(exp(18).mul(150));

    expect(await coreEngine.debt(account2.address)).to.equal(debtToSell);
  });

  it.only("should allow users to bid on bad debt to earn governance token", async () => {
    const status = await whenDebtDrawn();
    const {
      accounts,
      oracle,
      oracleRelayer,
      liquidationEngine,
      collateralType,
      coreEngine,
      accountingEngine,
    } = status;
    const [, account1, account2] = accounts;

    await oracle.setPrice(exp(18).mul(1000));
    await oracleRelayer.updateCollateralPrice(collateralType);

    console.log(
      (await coreEngine.unbackedDebt(accountingEngine.address)).toString()
    );
    await liquidationEngine
      .connect(account2)
      .liquidatePosition(collateralType, account1.address, account2.address);

    console.log(
      (await coreEngine.unbackedDebt(accountingEngine.address)).toString()
    );
  });
});
