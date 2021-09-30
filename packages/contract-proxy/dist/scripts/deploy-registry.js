"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployRegistry = void 0;
const hardhat_1 = require("hardhat");
const ethers_1 = require("ethers");
const debug_1 = require("../src/debug");
const cachedDeployments_1 = require("../src/cachedDeployments");
const { error } = (0, debug_1.getLogger)("deployRegistry");
const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const TRANSACTION_CACHE_PATH = `${__dirname}/core-transaction-cache.json`;
const deployRegistry = async () => {
    const transactionOverrides = { gasPrice: ethers_1.utils.parseUnits("10", "gwei") };
    const { deployOrGetInstance } = (0, cachedDeployments_1.buildCachedDeployments)({
        network: hardhat_1.network.name,
        deploymentCachePath: DEPLOYMENT_CACHE_PATH,
        transactionCachePath: TRANSACTION_CACHE_PATH,
        skipDeploymentCache: false,
        skipTransactionCache: false,
        transactionOverrides,
    });
    // Test Fixtures
    const registry = await deployOrGetInstance({
        key: "ProxyRegistry",
        factory: "ProxyRegistry",
    });
    return {
        registry,
    };
};
exports.deployRegistry = deployRegistry;
hardhat_1.ethers.utils.Logger.setLogLevel(hardhat_1.ethers.utils.Logger.levels.ERROR);
(0, debug_1.enableAllLog)();
(0, exports.deployRegistry)()
    .then(() => process.exit(0))
    .catch((err) => {
    error(err);
    process.exit(1);
});
