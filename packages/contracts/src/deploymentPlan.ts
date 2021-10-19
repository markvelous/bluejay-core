/* eslint-disable no-await-in-loop */
import { Record, String, Array, Boolean, Static } from "runtypes";
import { readFileSync } from "fs";

export const DeploymentPlanRt = Record({
  stablecoin: Record({
    name: String,
    symbol: String,
  }),
  governanceToken: Record({
    grantMinterRole: Boolean,
  }),
  global: Record({
    debtCeiling: String,
    savingsRate: String,
    stabilityFee: String,
    debtDelay: String,
    surplusLotSize: String,
    surplusBuffer: String,
    debtLotSize: String,
    debtLotInitialBid: String,
    maxDebtInActiveLiquidation: String,
    discountCalculatorStep: String,
    discountCalculatorFactorPerStep: String,
  }),
  collaterals: Array(
    Record({
      key: String,
      name: String,
      collateralType: String,
      debtCeiling: String,
      debtFloor: String,
      collateralizationRatio: String,
      stabilityFee: String,
      liquidationPenalty: String,
      maxDebtInActiveLiquidation: String,
      liquidationStartingPriceMultiplier: String,
      liquidationMaxDuration: String,
      liquidationMaxPriceDiscount: String,
      liquidationKeeperRewardFactor: String,
      liquidationKeeperIncentive: String,
      osmPriceDelay: String,
    })
  ),
});

export type DeploymentPlan = Static<typeof DeploymentPlanRt>;

export const readDeploymentPlan = (deploymentPlanPath: string) => {
  const planText = JSON.parse(readFileSync(deploymentPlanPath).toString());
  const deploymentPlan = DeploymentPlanRt.check(planText);
  return deploymentPlan;
};
