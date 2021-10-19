/* eslint-disable no-await-in-loop */
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";
import { readDeploymentPlan } from "./deploymentPlan";
import { getLogger } from "./debug";
import { formatRad, formatRay, formatWad } from "./utils";

const { info } = getLogger("debugVault");

export const debugVault: UseDeployment<
  { vault: string; deploymentPlan: string },
  void
> = async (
  {
    deploymentPlan: deploymentPlanPath,
    deploymentCache,
    transactionCache,
    transactionOverrides,
    vault,
  },
  hre
) => {
  const deploymentPlan = readDeploymentPlan(deploymentPlanPath);
  const stablecoinContext = deploymentPlan.stablecoin.symbol;

  const { getInstance } = buildCachedDeployments({
    network: hre.network.name,
    deploymentCachePath: deploymentCache,
    transactionCachePath: transactionCache,
    skipDeploymentCache: false,
    skipTransactionCache: false,
    transactionOverrides,
    hre,
  });
  const ledger = await getInstance({
    key: `[${stablecoinContext}]ProxyLedger`,
    factory: "Ledger",
  });
  for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
    const { key, collateralType } = deploymentPlan.collaterals[i];

    // Get position
    const { accumulatedRate, safetyPrice } = await ledger.collateralTypes(
      collateralType
    );
    const { lockedCollateral, normalizedDebt } = await ledger.positions(
      collateralType,
      vault
    );

    info(`Collateral: ${formatWad(lockedCollateral)}`);
    info(`Debt: ${formatRad(normalizedDebt.mul(accumulatedRate))}`);
    info(`Safety Price: ${formatRay(safetyPrice)}`);

    const canBeLiquidated = lockedCollateral
      .mul(safetyPrice)
      .lt(normalizedDebt.mul(accumulatedRate));
    info(`Can be liquidated: ${canBeLiquidated}`);

    console.log(key);
  }
};
