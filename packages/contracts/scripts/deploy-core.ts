import hre, { ethers } from "hardhat";
import { getLogger, enableAllLog } from "../src/debug";
import { deployCore } from "../src/deployCore";

const { error } = getLogger("deployCore");

const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const TRANSACTION_CACHE_PATH = `${__dirname}/core-transaction-cache.json`;

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
deployCore(
  {
    deploymentCache: DEPLOYMENT_CACHE_PATH,
    transactionCache: TRANSACTION_CACHE_PATH,
  },
  hre
)
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
