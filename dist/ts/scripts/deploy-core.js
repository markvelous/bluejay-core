"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const debug_1 = require("../src/debug");
const deployCore_1 = require("../src/deployCore");
const { error } = debug_1.getLogger("deployCore");
const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const TRANSACTION_CACHE_PATH = `${__dirname}/core-transaction-cache.json`;
hardhat_1.ethers.utils.Logger.setLogLevel(hardhat_1.ethers.utils.Logger.levels.ERROR);
debug_1.enableAllLog();
deployCore_1.deployCore({
    network: hardhat_1.network.name,
    deploymentCache: DEPLOYMENT_CACHE_PATH,
    transactionCache: TRANSACTION_CACHE_PATH,
})
    .then(() => process.exit(0))
    .catch((err) => {
    error(err);
    process.exit(1);
});
