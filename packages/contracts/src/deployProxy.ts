import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployProxy: UseDeployment<{}, { proxyRegistry: Contract }> =
  async ({ deploymentCache, transactionCache, transactionOverrides }, hre) => {
    const { deployOrGetInstance } = buildCachedDeployments({
      network: hre.network.name,
      deploymentCachePath: deploymentCache,
      transactionCachePath: transactionCache,
      skipDeploymentCache: false,
      skipTransactionCache: false,
      transactionOverrides,
      hre,
    });
    const proxyRegistry = await deployOrGetInstance({
      key: "ProxyRegistry",
      factory: "ProxyRegistry",
    });
    return {
      proxyRegistry,
    };
  };
