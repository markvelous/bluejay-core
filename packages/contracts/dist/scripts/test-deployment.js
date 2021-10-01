"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCore = void 0;
const ethers_1 = require("ethers");
const fs_1 = require("fs");
const hardhat_1 = require("hardhat");
const debug_1 = require("../src/debug");
const utils_1 = require("../test/utils");
const { info, error } = (0, debug_1.getLogger)("deployCore");
const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const transactionOverrides = { gasLimit: 30000000 };
const buildContractFromCache = (cache, net) => {
    const deployments = JSON.parse((0, fs_1.readFileSync)(cache).toString())[net];
    return async (key, factory) => {
        if (!deployments[key])
            throw new Error("Deployment address not found");
        const Factory = await hardhat_1.ethers.getContractFactory(factory);
        return Factory.attach(deployments[key]);
    };
};
const collateralType = "0x0000000000000000000000000000000000000000000000000000000000000001";
const deployCore = async () => {
    const [deployer] = await hardhat_1.ethers.getSigners();
    if (!deployer.provider)
        throw new Error("Deployer has no provider");
    const account1 = hardhat_1.ethers.Wallet.createRandom().connect(deployer.provider);
    // Load contracts
    const getContract = buildContractFromCache(DEPLOYMENT_CACHE_PATH, hardhat_1.network.name);
    const collateral = await getContract("SimpleCollateral", "SimpleCollateral");
    const collateralJoin = await getContract("ProxyCollateralJoin", "CollateralJoin");
    const ledger = await getContract("ProxyLedger", "Ledger");
    const feesEngine = await getContract("ProxyFeesEngine", "FeesEngine");
    // Fund new wallet
    await deployer.sendTransaction({ to: account1.address, value: (0, utils_1.exp)(18) });
    // Mint some 1k USD for account
    await collateral.mint(account1.address, (0, utils_1.exp)(18).mul(1000));
    info(`Collateral Balance of ${account1.address}: ${await collateral.balanceOf(account1.address)}`);
    // Deposit 1k USD
    await collateral
        .connect(account1)
        .approve(collateralJoin.address, ethers_1.constants.MaxUint256, transactionOverrides);
    await collateralJoin
        .connect(account1)
        .deposit(account1.address, (0, utils_1.exp)(18).mul(1000), transactionOverrides);
    //   Draw out 1m of MMK
    await ledger
        .connect(account1)
        .modifyPositionCollateralization(collateralType, account1.address, account1.address, account1.address, (0, utils_1.exp)(18).mul(1000), (0, utils_1.exp)(18).mul(1000 * 1000), transactionOverrides);
    info(`Internal stablecoin balance: ${await ledger.debt(account1.address)}`);
    // Update fees
    await feesEngine.connect(account1).updateAccumulatedRate(collateralType);
    info(`${await ledger.collateralTypes(collateralType)}`);
};
exports.deployCore = deployCore;
hardhat_1.ethers.utils.Logger.setLogLevel(hardhat_1.ethers.utils.Logger.levels.ERROR);
(0, debug_1.enableAllLog)();
(0, exports.deployCore)()
    .then(() => process.exit(0))
    .catch((err) => {
    error(err);
    process.exit(1);
});
