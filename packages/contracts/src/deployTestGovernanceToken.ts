import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployTestGovernanceToken: UseDeployment<
  {},
  { governanceToken: Contract }
> = async (
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
  const governanceToken = await deployOrGetInstance({
    key: "GovernanceToken",
    factory: "SimpleGovernanceToken",
    initArgs: [],
  });
  return {
    governanceToken,
  };
};