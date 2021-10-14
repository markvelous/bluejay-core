import { Contract } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";

export const deployPoker: UseDeployment<{}, { poker: Contract }> = async (
  { deploymentCache, transactionCache, transactionOverrides },
  hre
) => {
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
    key: "ProxyOracleRelayer",
    factory: "OracleRelayer",
  });
  const feesEngine = await getInstance({
    key: "ProxyFeesEngine",
    factory: "FeesEngine",
  });
  const savingsAccount = await getInstance({
    key: "ProxySavingsAccount",
    factory: "SavingsAccount",
  });
  const accountingEngine = await getInstance({
    key: "ProxyAccountingEngine",
    factory: "AccountingEngine",
  });
  const osm = await getInstance({
    key: "ProxyOSM",
    factory: "OracleSecurityModule",
  });
  const poker = await deployOrGetInstance({
    key: "Poker",
    factory: "Poker",
    args: [
      oracleRelayer.address,
      feesEngine.address,
      savingsAccount.address,
      accountingEngine.address,
    ],
  });
  await executeTransaction({
    contract: poker,
    key: "POKER_ADD_OSM",
    method: "addOracleSecurityModule",
    args: [osm.address],
  });
  await executeTransaction({
    contract: poker,
    key: "POKER_ADD_COLLATERAL_TYPE",
    method: "addCollateralType",
    args: [
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ],
  });
  return {
    poker,
  };
};
