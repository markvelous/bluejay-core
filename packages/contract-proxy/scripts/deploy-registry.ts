import { network, ethers } from "hardhat";
import { utils } from "ethers";
import { getLogger, enableAllLog } from "../src/debug";
import { buildCachedDeployments } from "../src/cachedDeployments";

const { error } = getLogger("deployRegistry");

const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const TRANSACTION_CACHE_PATH = `${__dirname}/core-transaction-cache.json`;

export const deployRegistry = async () => {
  const transactionOverrides = { gasPrice: utils.parseUnits("10", "gwei") };
  const { deployOrGetInstance } = buildCachedDeployments({
    network: network.name,
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

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
deployRegistry()
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
