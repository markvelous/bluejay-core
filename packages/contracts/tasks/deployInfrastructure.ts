import { enableAllLog } from "../src/debug";
import { deployCore } from "../src/deployCore";
import { deployProxy } from "../src/deployProxy";
import { deployHelper } from "../src/deployHelper";
import { deployPoker } from "../src/deployPoker";
import { deployProxyHelper } from "../src/deployProxyHelper";
import { UseDeployment } from "../src/types";

export const deployInfrastructure: UseDeployment<{}, void> = async (
  args,
  hre
) => {
  enableAllLog();
  hre.ethers.utils.Logger.setLogLevel(hre.ethers.utils.Logger.levels.ERROR);

  await deployCore(args, hre);
  await deployProxy(args, hre);
  await deployProxyHelper(args, hre);
  await deployHelper(args, hre);
  await deployPoker(args, hre);
};
