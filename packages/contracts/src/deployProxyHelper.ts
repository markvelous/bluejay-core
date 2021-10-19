import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployProxyHelper: UseDeployment<{}, { proxyHelper: Contract }> =
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
    const proxyHelper = await deployOrGetInstance({
      key: "ProxyHelper",
      factory: "ProxyHelper",
    });
    return {
      proxyHelper,
    };
  };
