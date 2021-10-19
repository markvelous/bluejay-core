import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployTestCollateral: UseDeployment<
  { name: string },
  { collateral: Contract }
> = async (
  { deploymentCache, transactionCache, transactionOverrides, name },
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
  const collateral = await deployOrGetInstance({
    key: `Collateral[${name}]`,
    factory: "SimpleCollateral",
  });
  return {
    collateral,
  };
};
