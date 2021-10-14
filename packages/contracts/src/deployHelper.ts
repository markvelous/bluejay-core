import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployHelper: UseDeployment<{}, { helper: Contract }> = async (
  { deploymentCache, transactionCache, transactionOverrides },
  hre
) => {
  const { deployOrGetInstance } = buildCachedDeployments({
    network: hre.network.name,
    deploymentCachePath: deploymentCache,
    transactionCachePath: transactionCache,
    skipDeploymentCache: false,
    skipTransactionCache: false,
    transactionOverrides,
    hre,
  });
  const helper = await deployOrGetInstance({
    key: "Helper",
    factory: "Helper",
  });
  return {
    helper,
  };
};
