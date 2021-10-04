import hre, { ethers } from "hardhat";
import { getLogger, enableAllLog } from "../src/debug";
import { deployCore } from "../src/deployCore";
import { deployProxy } from "../src/deployProxy";

const { error } = getLogger("deployCore");

const DEPLOYMENT_CACHE_PATH = `../app-vault/src/fixtures/deployment/contracts.json`;
const TRANSACTION_CACHE_PATH = `../app-vault/src/fixtures/deployment/transactions.json`;

const main = async () => {
  await deployCore(
    {
      deploymentCache: DEPLOYMENT_CACHE_PATH,
      transactionCache: TRANSACTION_CACHE_PATH,
    },
    hre
  );
  await deployProxy(
    {
      deploymentCache: DEPLOYMENT_CACHE_PATH,
      transactionCache: TRANSACTION_CACHE_PATH,
    },
    hre
  );
};

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
main()
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
