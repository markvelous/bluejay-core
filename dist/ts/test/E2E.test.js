"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const utils_2 = require("./utils");
const debug_1 = require("../src/debug");
debug_1.enableAllLog();
hardhat_1.ethers.utils.Logger.setLogLevel(hardhat_1.ethers.utils.Logger.levels.ERROR);
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const DEFAULT_SAVINGS_RATE = ethers_1.BigNumber.from("1000000003022265980097387651"); // 10% per year, root(1.1, 365*24*60*60) * exp(27)
const DEFAULT_STABILITY_FEE = ethers_1.BigNumber.from("1000000004431822129783699001"); // 15% per year, root(1.15, 365*24*60*60) * exp(27)
const normalizeByRate = (amount, rate) => {
    return amount.div(rate);
};
const whenCoreDeployed = async ({ stabilityFee = DEFAULT_STABILITY_FEE, globalStabilityFee = ethers_1.BigNumber.from(0), } = {}) => {
    const accounts = await hardhat_1.ethers.getSigners();
    const SimpleCollateral = await hardhat_1.ethers.getContractFactory("SimpleCollateral");
    const SimpleOracle = await hardhat_1.ethers.getContractFactory("SimpleOracle");
    const Stablecoin = await hardhat_1.ethers.getContractFactory("Stablecoin");
    const StablecoinJoin = await hardhat_1.ethers.getContractFactory("StablecoinJoin");
    const CollateralJoin = await hardhat_1.ethers.getContractFactory("CollateralJoin");
    const OracleRelayer = await hardhat_1.ethers.getContractFactory("OracleRelayer");
    const Ledger = await hardhat_1.ethers.getContractFactory("Ledger");
    const SavingsAccount = await hardhat_1.ethers.getContractFactory("SavingsAccount");
    const FeesEngine = await hardhat_1.ethers.getContractFactory("FeesEngine");
    const AccountingEngine = await hardhat_1.ethers.getContractFactory("AccountingEngine");
    const DiscountCalculator = await hardhat_1.ethers.getContractFactory("StairstepExponentialDecrease");
    const LiquidationAuction = await hardhat_1.ethers.getContractFactory("LiquidationAuction");
    const LiquidationEngine = await hardhat_1.ethers.getContractFactory("LiquidationEngine");
    const SimpleGovernanceToken = await hardhat_1.ethers.getContractFactory("SimpleGovernanceToken");
    const SurplusAuction = await hardhat_1.ethers.getContractFactory("SurplusAuction");
    const DebtAuction = await hardhat_1.ethers.getContractFactory("DebtAuction");
    const collateral = await SimpleCollateral.deploy();
    const oracle = await SimpleOracle.deploy();
    // stablecoin not using uups to avoid console warning during testing
    const stablecoin = await hardhat_1.upgrades.deployProxy(Stablecoin, [
        "Myanmar Kyat Tracker",
        "MMKT",
    ]);
    // governanceToken not using uups to avoid console warning during testing
    const governanceToken = await hardhat_1.upgrades.deployProxy(SimpleGovernanceToken, []);
    const collateralType = utils_1.keccak256(collateral.address);
    const ledger = await hardhat_1.upgrades.deployProxy(Ledger, []);
    const collateralJoin = await hardhat_1.upgrades.deployProxy(CollateralJoin, [
        ledger.address,
        collateralType,
        collateral.address,
    ]);
    const stablecoinJoin = await hardhat_1.upgrades.deployProxy(StablecoinJoin, [
        ledger.address,
        stablecoin.address,
    ]);
    const oracleRelayer = await hardhat_1.upgrades.deployProxy(OracleRelayer, [
        ledger.address,
    ]);
    const savingsAccount = await hardhat_1.upgrades.deployProxy(SavingsAccount, [
        ledger.address,
    ]);
    const feesEngine = await hardhat_1.upgrades.deployProxy(FeesEngine, [ledger.address]);
    const surplusAuction = await hardhat_1.upgrades.deployProxy(SurplusAuction, [
        ledger.address,
        governanceToken.address,
    ]);
    const debtAuction = await hardhat_1.upgrades.deployProxy(DebtAuction, [
        ledger.address,
        governanceToken.address,
    ]);
    const accountingEngine = await hardhat_1.upgrades.deployProxy(AccountingEngine, [
        ledger.address,
        surplusAuction.address,
        debtAuction.address,
    ]);
    const discountCalculator = await hardhat_1.upgrades.deployProxy(DiscountCalculator, []);
    const liquidationEngine = await hardhat_1.upgrades.deployProxy(LiquidationEngine, [
        ledger.address,
    ]);
    const liquidationAuction = await hardhat_1.upgrades.deployProxy(LiquidationAuction, [
        ledger.address,
        oracleRelayer.address,
        liquidationEngine.address,
        collateralType,
    ]);
    // Permissions
    ledger.grantAuthorization(oracleRelayer.address);
    ledger.grantAuthorization(collateralJoin.address);
    ledger.grantAuthorization(stablecoinJoin.address);
    ledger.grantAuthorization(savingsAccount.address);
    ledger.grantAuthorization(feesEngine.address);
    ledger.grantAuthorization(accountingEngine.address);
    ledger.grantAuthorization(liquidationEngine.address);
    ledger.grantAuthorization(liquidationAuction.address);
    ledger.grantAuthorization(debtAuction.address);
    ledger.grantAuthorization(surplusAuction.address);
    accountingEngine.grantAuthorization(liquidationEngine.address);
    liquidationAuction.grantAuthorization(liquidationEngine.address);
    liquidationEngine.grantAuthorization(liquidationAuction.address);
    surplusAuction.grantAuthorization(accountingEngine.address);
    debtAuction.grantAuthorization(accountingEngine.address);
    // Initializations
    await governanceToken.grantRole(MINTER_ROLE, accounts[0].address);
    await governanceToken.grantRole(MINTER_ROLE, debtAuction.address);
    await ledger.initializeCollateralType(collateralType);
    await ledger.updateDebtCeiling(collateralType, utils_2.exp(45).mul(1000000 * 1000));
    await ledger.updateDebtFloor(collateralType, utils_2.exp(45).mul(100));
    await ledger.updateTotalDebtCeiling(utils_2.exp(45).mul(1000000 * 1000));
    await stablecoin.grantRole(MINTER_ROLE, stablecoinJoin.address);
    await oracle.setPrice(utils_2.exp(18).mul(1500));
    await oracleRelayer.updateOracle(collateralType, oracle.address);
    await oracleRelayer.updateCollateralizationRatio(collateralType, utils_2.exp(27).mul(150).div(100));
    await oracleRelayer.updateCollateralPrice(collateralType);
    await savingsAccount.updateSavingsRate(DEFAULT_SAVINGS_RATE);
    await savingsAccount.updateAccountingEngine(accountingEngine.address);
    await feesEngine.initializeCollateral(collateralType);
    await feesEngine.updateAccountingEngine(accountingEngine.address);
    await feesEngine.updateStabilityFee(collateralType, stabilityFee);
    await feesEngine.updateGlobalStabilityFee(globalStabilityFee);
    // Reference https://etherscan.io/address/0xA950524441892A31ebddF91d3cEEFa04Bf454466#readContract
    await accountingEngine.updatePopDebtDelay(561600);
    await accountingEngine.updateSurplusAuctionLotSize(utils_2.exp(45).mul(100000));
    await accountingEngine.updateSurplusBuffer(utils_2.exp(45).mul(500000));
    await accountingEngine.updateIntialDebtAuctionBid(utils_2.exp(18).mul(1000));
    await accountingEngine.updateDebtAuctionLotSize(utils_2.exp(45).mul(50000));
    // Reference https://etherscan.io/address/0x135954d155898D42C90D2a57824C690e0c7BEf1B#readContract
    // Ilk: 0x4554482d43000000000000000000000000000000000000000000000000000000
    await liquidationEngine.updateAccountingEngine(accountingEngine.address);
    await liquidationEngine.updateGlobalMaxDebtForActiveAuctions(utils_2.exp(45).mul(100000000));
    await liquidationEngine.updateLiquidatonPenalty(collateralType, utils_2.exp(18).mul(113).div(100));
    await liquidationEngine.updateMaxDebtForActiveAuctions(collateralType, utils_2.exp(45).mul(20000000));
    await liquidationEngine.updateLiquidationAuction(collateralType, liquidationAuction.address);
    // Reference https://etherscan.io/address/0xc2b12567523e3f3CBd9931492b91fe65b240bc47
    await liquidationAuction.updateStartingPriceFactor(utils_2.exp(27).mul(130).div(100));
    await liquidationAuction.updateMaxAuctionDuration(8400);
    await liquidationAuction.updateMaxPriceDiscount(utils_2.exp(27).mul(40).div(100)); // TODO CHECK VALUE
    await liquidationAuction.updateKeeperRewardFactor(utils_2.exp(18).div(1000));
    await liquidationAuction.updateKeeperIncentive(utils_2.exp(45).mul(300));
    await liquidationAuction.updateAccountingEngine(accountingEngine.address);
    await liquidationAuction.updateDiscountCalculator(discountCalculator.address);
    // Reference https://etherscan.io/address/0x1c4fc274d12b2e1bbdf97795193d3148fcda6108
    await discountCalculator.updateStep(60); // 60 sec
    await discountCalculator.updateFactorPerStep(utils_2.exp(27).mul(99).div(100)); // 0.99 per step
    // Account Initializations
    const [, account1, account2] = accounts;
    await collateral.mint(account1.address, utils_2.exp(18).mul(10000));
    await collateral.mint(account2.address, utils_2.exp(18).mul(10000));
    return {
        accounts,
        accountingEngine,
        collateral,
        collateralType,
        collateralJoin,
        stablecoin,
        stablecoinJoin,
        ledger,
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
const depositCollateralAndDrawDebt = async ({ collateral, collateralJoin, ledger, account, collateralType, debtDrawn, collateralDeposit = utils_2.exp(18).mul(10000), }) => {
    // Allow collateralJoin to transfer collateral from account
    await collateral
        .connect(account)
        .approve(collateralJoin.address, ethers_1.constants.MaxUint256);
    // Deposit 100k into collateralJoin
    await collateralJoin
        .connect(account)
        .deposit(account.address, collateralDeposit);
    // Draw 10,000,000 max debt (10000 * 1500 / 150%)
    await ledger
        .connect(account)
        .modifyPositionCollateralization(collateralType, account.address, account.address, account.address, collateralDeposit, normalizeByRate(debtDrawn, (await ledger.collateralTypes(collateralType)).accumulatedRate));
};
const whenDebtDrawn = async ({ debtDrawn = utils_2.exp(45).mul(10000 * 1000), stabilityFee, globalStabilityFee, } = {}) => {
    const status = await whenCoreDeployed({ stabilityFee, globalStabilityFee });
    const { accounts } = status;
    const [, account1] = accounts;
    // Deposit 100k into collateralJoin
    // Draw 10,000,000 max debt (10000 * 1500 / 150%)
    await depositCollateralAndDrawDebt({
        ...status,
        debtDrawn,
        collateralDeposit: utils_2.exp(18).mul(10000),
        account: account1,
    });
    return status;
};
describe("E2E", () => {
    it("should allow user to mint and withdraw stablecoin", async () => {
        const { collateralType, ledger, stablecoinJoin, accounts, stablecoin } = await whenDebtDrawn();
        const [, account1] = accounts;
        // Withdraw as stablecoin
        await stablecoinJoin
            .connect(account1)
            .withdraw(account1.address, utils_2.exp(18).mul(10000 * 1000));
        // Should have the right amount of stablecoin
        chai_1.expect(await stablecoin.balanceOf(account1.address)).to.equal(utils_2.exp(18).mul(10000 * 1000));
        // System parameters should be correct
        chai_1.expect(await ledger.totalDebt()).to.equal(utils_2.exp(45).mul(10000 * 1000));
        chai_1.expect(await ledger.totalUnbackedDebt()).to.equal(0);
        // Collateral parameters should be correct
        const collateralData = await ledger.collateralTypes(collateralType);
        chai_1.expect(collateralData.normalizedDebt).to.equal(utils_2.exp(18).mul(10000 * 1000));
    });
    it("should allow user to save (assuming zero stability fee)", async () => {
        const { savingsAccount, accounts, ledger, accountingEngine } = await whenDebtDrawn();
        const [, account1] = accounts;
        // Start saving in the SavingsAccount module
        await savingsAccount.connect(account1).deposit(utils_2.exp(45)
            .mul(10000 * 1000 - 100)
            .div(DEFAULT_SAVINGS_RATE));
        // After one year
        await utils_2.incrementTime(60 * 60 * 24 * 365, hardhat_1.ethers.provider);
        await savingsAccount.connect(account1).updateAccumulatedRate();
        const totalDebt = await ledger.totalDebt();
        chai_1.expect(totalDebt).to.be.gt(utils_2.exp(45).mul(10900000));
        chai_1.expect(totalDebt).to.be.lt(utils_2.exp(45).mul(11000000));
        const totalUnbackedDebt = await ledger.totalUnbackedDebt();
        chai_1.expect(totalUnbackedDebt).to.be.gt(utils_2.exp(45).mul(900000));
        chai_1.expect(totalUnbackedDebt).to.be.lt(utils_2.exp(45).mul(1000000));
        // Withdraw savings
        const totalSavings = await savingsAccount.savings(account1.address);
        await savingsAccount.connect(account1).withdraw(totalSavings);
        const accountBalance = await ledger.debt(account1.address);
        chai_1.expect(accountBalance).to.be.gt(utils_2.exp(45).mul(10900000));
        chai_1.expect(accountBalance).to.be.lt(utils_2.exp(45).mul(11000000));
        const unbackedDebt = await ledger.unbackedDebt(accountingEngine.address);
        chai_1.expect(unbackedDebt).to.be.gt(utils_2.exp(45).mul(900000));
        chai_1.expect(unbackedDebt).to.be.lt(utils_2.exp(45).mul(1000000));
    });
    it("should allow stability fees to be collected", async () => {
        const status = await whenDebtDrawn();
        const { ledger, accounts, feesEngine, collateral, collateralType, collateralJoin, accountingEngine, } = status;
        const [, account1, account2] = accounts;
        // Accrues some stability fee through the year
        await utils_2.incrementTime(60 * 60 * 24 * 365, hardhat_1.ethers.provider);
        await feesEngine.updateAccumulatedRate(collateralType);
        chai_1.expect(await ledger.debt(accountingEngine.address)).to.gt(utils_2.exp(45).mul(1500000));
        // Transfer from debt from another account (simulating buy from ext account)
        await depositCollateralAndDrawDebt({
            ...status,
            debtDrawn: utils_2.exp(45).mul(10000 * 1000),
            collateralDeposit: utils_2.exp(18).mul(10000),
            account: account2,
        });
        await ledger
            .connect(account2)
            .transferDebt(account2.address, account1.address, utils_2.exp(45).mul(10000 * 1000 - 1));
        // Pay off debt with stability fee and withdraw all collaterals
        const position = await ledger.positions(collateralType, account1.address);
        await ledger
            .connect(account1)
            .modifyPositionCollateralization(collateralType, account1.address, account1.address, account1.address, ethers_1.BigNumber.from(0).sub(position.lockedCollateral), ethers_1.BigNumber.from(0).sub(position.normalizedDebt));
        // Exit into collateral
        await collateralJoin
            .connect(account1)
            .withdraw(account1.address, utils_2.exp(18).mul(10000));
        chai_1.expect(await collateral.balanceOf(account1.address)).to.equal(utils_2.exp(18).mul(10000));
        // Check that system parameters are correct
        const totalDebt = await ledger.totalDebt();
        chai_1.expect(totalDebt).to.lte(utils_2.exp(45).mul(10000 * 1000));
        chai_1.expect(totalDebt).to.gt(utils_2.exp(45).mul(10000 * 999));
        chai_1.expect(await ledger.totalUnbackedDebt()).to.equal(0);
        const collateralData = await ledger.collateralTypes(collateralType);
        const normalizedDebtCeil = Math.floor((10000 * 1000) / 1.14);
        const normalizedDebtFloor = Math.floor((10000 * 1000) / 1.16);
        chai_1.expect(collateralData.normalizedDebt).to.lte(utils_2.exp(18).mul(normalizedDebtCeil));
        chai_1.expect(collateralData.normalizedDebt).to.gt(utils_2.exp(18).mul(normalizedDebtFloor));
    });
    it("should allow unsafe positions to be liquidated", async () => {
        const status = await whenDebtDrawn();
        const { accounts, oracle, collateral, collateralJoin, oracleRelayer, liquidationEngine, liquidationAuction, accountingEngine, collateralType, ledger, } = status;
        const [, account1, account2] = accounts;
        await oracle.setPrice(utils_2.exp(18).mul(1250));
        await oracleRelayer.updateCollateralPrice(collateralType);
        await liquidationEngine
            .connect(account2)
            .liquidatePosition(collateralType, account1.address, account2.address);
        // All drawn debt & locked collateral to be confiscated from the liquidated account
        const { lockedCollateral: lockedCollateralAcc1, normalizedDebt: normalizedDebtAcc1, } = await ledger.positions(collateralType, account1.address);
        chai_1.expect(lockedCollateralAcc1).to.equal(0);
        chai_1.expect(normalizedDebtAcc1).to.equal(0);
        // Debt is not touched for liquidated position
        chai_1.expect(await ledger.debt(account1.address)).to.equal(utils_2.exp(45).mul(10000 * 1000));
        // Collateral goes to liquidation auction (unlocked)
        chai_1.expect(await ledger.collateral(collateralType, liquidationAuction.address)).to.equal(utils_2.exp(18).mul(10000));
        // Reward credited for starting auction
        const reward = await ledger.debt(account2.address);
        chai_1.expect(reward).to.equal(utils_2.exp(45)
            .mul(10000 * 1000)
            .mul(113)
            .div(100) // x 1.13 for liquidation penalty
            .div(1000)
            .add(utils_2.exp(45).mul(300))); // Keeper incentive plus debtToRaise * keeperRewardFactor
        // Debt plus reward goes to accounting engine as unbacked debt
        chai_1.expect(await ledger.unbackedDebt(accountingEngine.address)).to.equal(utils_2.exp(45)
            .mul(10000 * 1000)
            .add(reward));
        // Debt is pushed into accounting engine queue
        chai_1.expect(await accountingEngine.totalQueuedDebt()).to.equal(utils_2.exp(45).mul(10000 * 1000));
        // Auction started
        const { debtToRaise, collateralToSell, position, startingPrice } = await liquidationAuction.auction(1);
        chai_1.expect(debtToRaise).to.equal(utils_2.exp(45)
            .mul(10000 * 1000)
            .mul(113)
            .div(100));
        chai_1.expect(collateralToSell).to.equal(utils_2.exp(18).mul(10000));
        chai_1.expect(position).to.equal(account1.address);
        chai_1.expect(startingPrice).to.equal(utils_2.exp(27).mul(1250).mul(130).div(100));
        // Draw some debt for account 2
        const debtDrawnOnAcc2 = utils_2.exp(45).mul(10000 * 1500);
        await collateral.mint(account2.address, utils_2.exp(18).mul(100000));
        await depositCollateralAndDrawDebt({
            collateral,
            ledger,
            collateralJoin,
            collateralType,
            account: account2,
            debtDrawn: debtDrawnOnAcc2,
            collateralDeposit: utils_2.exp(18).mul(100000),
        });
        // Wait for liquidation price to drop
        await utils_2.incrementTime(1600, hardhat_1.ethers.provider);
        const { price: discountedPrice, debtToRaise: debtRequired, collateralToSell: collateralLeft, } = await liquidationAuction.getAuctionStatus(1);
        chai_1.expect(discountedPrice).to.be.closeTo(utils_2.exp(27)
            .mul(1250)
            .mul(130)
            .div(100)
            .mul(ethers_1.BigNumber.from(99).pow(26)) // 26 periods have passed
            .div(ethers_1.BigNumber.from(100).pow(26)), 1000);
        // Partial liquidation
        await liquidationAuction
            .connect(account2)
            .bidOnAuction(1, collateralLeft.div(2), discountedPrice, account2.address, "0x");
        // Auction has not closed
        const { debtToRaise: debtRequiredAfterPartial, collateralToSell: collateralToSellAfterPartial, } = await liquidationAuction.getAuctionStatus(1);
        chai_1.expect(collateralToSellAfterPartial).to.equal(collateralLeft.div(2));
        chai_1.expect(debtRequiredAfterPartial).to.equal(debtRequired.sub(collateralLeft.div(2).mul(discountedPrice)));
        const { lockedCollateral: lockedCollateralBeforeClose, normalizedDebt: normalizedDebtBeforeClose, } = await ledger.positions(collateralType, account1.address);
        chai_1.expect(lockedCollateralBeforeClose).to.equal(0);
        chai_1.expect(normalizedDebtBeforeClose).to.equal(0);
        // Liquidator has paid debt and collected collateral
        chai_1.expect(await ledger.debt(account2.address)).to.equal(utils_2.exp(45).mul(15011600).sub(collateralLeft.div(2).mul(discountedPrice)));
        chai_1.expect(await ledger.collateral(collateralType, account2.address)).to.equal(collateralLeft.div(2));
        // // Full liquidation
        await liquidationAuction
            .connect(account2)
            .bidOnAuction(1, collateralLeft.div(2), discountedPrice, account2.address, "0x");
        // Liquidator paid all debt and received all collaterals
        chai_1.expect(await ledger.debt(account2.address)).to.equal(utils_2.exp(45).mul(15011600).sub(debtRequired));
        chai_1.expect(await ledger.collateral(collateralType, account2.address)).to.equal(debtRequired.div(discountedPrice));
        // Liquidated position received remaining collateral as refunds
        chai_1.expect(await ledger.collateral(collateralType, account1.address)).to.equal(collateralLeft.sub(debtRequired.div(discountedPrice)));
    });
    it("should allow users to bid on surplus of debt collected from stability fee", async () => {
        const status = await whenDebtDrawn();
        const { accounts, feesEngine, collateralType, ledger, accountingEngine, surplusAuction, governanceToken, } = status;
        const [, account1, account2] = accounts;
        await governanceToken.mint(account1.address, utils_2.exp(18).mul(150));
        await governanceToken
            .connect(account1)
            .approve(surplusAuction.address, ethers_1.constants.MaxUint256);
        await governanceToken.mint(account2.address, utils_2.exp(18).mul(300));
        await governanceToken
            .connect(account2)
            .approve(surplusAuction.address, ethers_1.constants.MaxUint256);
        await utils_2.incrementTime(60 * 60 * 24 * 365, hardhat_1.ethers.provider);
        await feesEngine.updateAccumulatedRate(collateralType);
        await accountingEngine.auctionSurplus();
        const activeAuctions = await surplusAuction.listActiveAuctions();
        chai_1.expect(activeAuctions.length).to.equal(1);
        chai_1.expect(activeAuctions[0]).to.equal(1);
        chai_1.expect(await surplusAuction.countActiveAuctions()).to.equal(1);
        const { debtToSell } = await surplusAuction.auctions(1);
        chai_1.expect(debtToSell).to.equal(utils_2.exp(45).mul(100000));
        await surplusAuction
            .connect(account1)
            .placeBid(1, debtToSell, utils_2.exp(18).mul(150));
        chai_1.expect(await governanceToken.balanceOf(account1.address)).to.equal(0);
        chai_1.expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(utils_2.exp(18).mul(150));
        const firstBid = await surplusAuction.auctions(1);
        chai_1.expect(firstBid.bidAmount).to.equal(utils_2.exp(18).mul(150));
        chai_1.expect(firstBid.bidExpiry).to.not.equal(0);
        chai_1.expect(firstBid.highestBidder).to.equal(account1.address);
        await utils_2.incrementTime(640, hardhat_1.ethers.provider);
        await surplusAuction
            .connect(account2)
            .placeBid(1, debtToSell, utils_2.exp(18).mul(300));
        chai_1.expect(await governanceToken.balanceOf(account1.address)).to.equal(utils_2.exp(18).mul(150));
        chai_1.expect(await governanceToken.balanceOf(account2.address)).to.equal(0);
        chai_1.expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(utils_2.exp(18).mul(300));
        await utils_2.incrementTime(3 * 60 * 60 + 1, hardhat_1.ethers.provider);
        await surplusAuction.connect(account2).settleAuction(1);
        chai_1.expect(await governanceToken.balanceOf(surplusAuction.address)).to.equal(0);
        chai_1.expect(await governanceToken.totalSupply()).to.equal(utils_2.exp(18).mul(150));
        chai_1.expect(await ledger.debt(account2.address)).to.equal(debtToSell);
        chai_1.expect(await surplusAuction.countActiveAuctions()).to.equal(0);
    });
    it("should allow users to bid on bad debt to earn governance token", async () => {
        const status = await whenDebtDrawn();
        const { accounts, oracle, oracleRelayer, liquidationEngine, collateralType, ledger, accountingEngine, debtAuction, governanceToken, } = status;
        const [, account1, account2] = accounts;
        // Generate some bad debt
        await oracle.setPrice(utils_2.exp(18).mul(1000));
        await oracleRelayer.updateCollateralPrice(collateralType);
        await liquidationEngine
            .connect(account2)
            .liquidatePosition(collateralType, account1.address, account2.address);
        chai_1.expect(await ledger.unbackedDebt(accountingEngine.address)).to.gt(utils_2.exp(45).mul(10000000));
        // Get some stablecoin for account2
        await depositCollateralAndDrawDebt({
            ...status,
            debtDrawn: utils_2.exp(45).mul(100000),
            collateralDeposit: utils_2.exp(18).mul(10000),
            account: account2,
        });
        // Wait for queue
        await utils_2.incrementTime(561600 + 1, hardhat_1.ethers.provider);
        // Allow debt to be liquidated
        chai_1.expect(await accountingEngine.countPendingDebts()).to.equal(1);
        chai_1.expect((await accountingEngine.listPendingDebts())[0]).to.equal(1);
        await accountingEngine.popDebtFromQueue(1);
        chai_1.expect(await accountingEngine.countPendingDebts()).to.equal(0);
        // Start off some auctions (each with 50k of unbacked debts)
        chai_1.expect(await accountingEngine.totalDebtOnAuction()).to.equal(0);
        await accountingEngine.connect(account2).auctionDebt();
        await accountingEngine.connect(account2).auctionDebt();
        chai_1.expect(await accountingEngine.totalDebtOnAuction()).to.equal(utils_2.exp(45).mul(100000));
        // Check that there are two ongoing auctions
        chai_1.expect(await debtAuction.countActiveAuctions()).to.equal(2);
        const activeAuctions = await debtAuction.listActiveAuctions();
        chai_1.expect(activeAuctions[0]).to.equal(1);
        chai_1.expect(activeAuctions[1]).to.equal(2);
        // Bid on the auctions
        chai_1.expect(await ledger.debt(account1.address)).to.equal(utils_2.exp(45).mul(10000 * 1000));
        await debtAuction
            .connect(account1)
            .placeBid(1, utils_2.exp(18).mul(800), utils_2.exp(45).mul(50000));
        await debtAuction
            .connect(account1)
            .placeBid(2, utils_2.exp(18).mul(800), utils_2.exp(45).mul(50000));
        chai_1.expect(await ledger.debt(account1.address)).to.equal(utils_2.exp(45)
            .mul(10000 * 1000)
            .sub(utils_2.exp(45).mul(100000)));
        await utils_2.incrementTime(600, hardhat_1.ethers.provider);
        // Bid on auction from another account
        await debtAuction
            .connect(account2)
            .placeBid(1, utils_2.exp(18).mul(600), utils_2.exp(45).mul(50000));
        await debtAuction
            .connect(account2)
            .placeBid(2, utils_2.exp(18).mul(600), utils_2.exp(45).mul(50000));
        chai_1.expect(await ledger.debt(account1.address)).to.equal(utils_2.exp(45).mul(10000 * 1000));
        // Settle the auction
        await utils_2.incrementTime(3 * 60 * 60, hardhat_1.ethers.provider);
        await debtAuction.connect(account2).settleAuction(1);
        await debtAuction.connect(account2).settleAuction(2);
        // Check that unbacked debt has decreased and account has gov token now
        chai_1.expect(await ledger.unbackedDebt(accountingEngine.address)).to.lt(utils_2.exp(45).mul(10000000));
        chai_1.expect(await governanceToken.balanceOf(account2.address)).to.equal(utils_2.exp(18).mul(1200));
        chai_1.expect(await governanceToken.balanceOf(account1.address)).to.equal(0);
        chai_1.expect(await debtAuction.countActiveAuctions()).to.equal(0);
    });
});
