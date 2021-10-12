import { HardhatRuntimeEnvironment } from "hardhat/types";
import { enableAllLog } from "../src/debug";
import { deployCore } from "../src/deployCore";
import { deployProxy } from "../src/deployProxy";
import { deployHelper } from "../src/deployHelper";
import { deployPoker } from "../src/deployPoker";
import { deployProxyHelper } from "../src/deployProxyHelper";

export const deployInfrastructure = async (
  {
    deploymentCache,
    transactionCache,
  }: {
    deploymentCache: string;
    transactionCache: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  enableAllLog();
  hre.ethers.utils.Logger.setLogLevel(hre.ethers.utils.Logger.levels.ERROR);

  await deployCore(
    {
      deploymentCache,
      transactionCache,
    },
    hre
  );
  await deployProxy(
    {
      deploymentCache,
      transactionCache,
    },
    hre
  );
  await deployProxyHelper(
    {
      deploymentCache,
      transactionCache,
    },
    hre
  );
  await deployHelper(
    {
      deploymentCache,
      transactionCache,
    },
    hre
  );
  await deployPoker(
    {
      deploymentCache,
      transactionCache,
    },
    hre
  );
};
