import { HardhatRuntimeEnvironment } from "hardhat/types";
import { utils } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";

export const deployProxyHelper = async (
  {
    deploymentCache,
    transactionCache,
  }: {
    deploymentCache: string;
    transactionCache: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  const transactionOverrides = { gasPrice: utils.parseUnits("10", "gwei") };
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
