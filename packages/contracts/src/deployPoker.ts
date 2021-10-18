/* eslint-disable no-await-in-loop */
import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";
import { readDeploymentPlan } from "./deploymentPlan";

export const deployPoker: UseDeployment<
  { deploymentPlan: string },
  { poker: Contract }
> = async (
  {
    deploymentPlan: deploymentPlanPath,
    deploymentCache,
    transactionCache,
    transactionOverrides,
  },
  hre
) => {
  const deploymentPlan = readDeploymentPlan(deploymentPlanPath);
  const stablecoinContext = deploymentPlan.stablecoin.symbol;
  const { deployOrGetInstance, getInstance, executeTransaction } =
    buildCachedDeployments({
      network: hre.network.name,
      deploymentCachePath: deploymentCache,
      transactionCachePath: transactionCache,
      skipDeploymentCache: false,
      skipTransactionCache: false,
      transactionOverrides,
      hre,
    });
  const oracleRelayer = await getInstance({
    key: `[${stablecoinContext}]ProxyOracleRelayer`,
    factory: "OracleRelayer",
  });
  const feesEngine = await getInstance({
    key: `[${stablecoinContext}]ProxyFeesEngine`,
    factory: "FeesEngine",
  });
  const savingsAccount = await getInstance({
    key: `[${stablecoinContext}]ProxySavingsAccount`,
    factory: "SavingsAccount",
  });
  const accountingEngine = await getInstance({
    key: `[${stablecoinContext}]ProxyAccountingEngine`,
    factory: "AccountingEngine",
  });
  const poker = await deployOrGetInstance({
    key: `[${stablecoinContext}]Poker`,
    factory: "Poker",
    args: [
      oracleRelayer.address,
      feesEngine.address,
      savingsAccount.address,
      accountingEngine.address,
    ],
  });
  for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
    const { key: collateral, collateralType } = deploymentPlan.collaterals[i];

    const osm = await getInstance({
      key: `[${stablecoinContext}][${collateral}]ProxyOSM`,
      factory: "OracleSecurityModule",
    });
    await executeTransaction({
      contract: poker,
      key: `[${stablecoinContext}][${collateral}]POKER_ADD_OSM`,
      method: "addOracleSecurityModule",
      args: [osm.address],
    });
    await executeTransaction({
      contract: poker,
      key: `[${stablecoinContext}][${collateral}]POKER_ADD_COLLATERAL_TYPE`,
      method: "addCollateralType",
      args: [collateralType],
    });
  }
  return {
    poker,
  };
};
