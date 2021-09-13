import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { getLogger } from "../src/debug";

const { info, error } = getLogger("utils");

export const exp = (exponent: number) => {
  return BigNumber.from(10).pow(exponent);
};

export const mineBlocks = async (
  blocksToMine: number,
  provider: typeof ethers.provider
) => {
  for (let i = 0; i < blocksToMine; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await provider.send("evm_mine", []);
  }
};

export const increaseTime = async (
  timeToIncrease: number,
  provider: typeof ethers.provider
) => {
  await provider.send("evm_increaseTime", [timeToIncrease]);
  await provider.send("evm_mine", []);
};

export const formatNumber =
  (decimal: number) =>
  (num: BigNumber): number => {
    try {
      return num.div(exp(decimal - 8)).toNumber() / 10 ** 8;
    } catch (_error) {
      try {
        return num.div(exp(decimal)).toNumber();
      } catch (_error2) {
        error(`Cannot convert ${num.toString()} with ${decimal} decimals`);
        return NaN;
      }
    }
  };

export const formatWad = formatNumber(18);
export const formatRay = formatNumber(27);
export const formatRad = formatNumber(45);

export const printCoreEngineCollateralType = async (
  coreEngine: Contract,
  collateralType: string
) => {
  const data = await coreEngine.collateralTypes(collateralType);
  const {
    normalizedDebt,
    accumulatedRate,
    safetyPrice,
    debtCeiling,
    debtFloor,
  }: {
    normalizedDebt: BigNumber;
    accumulatedRate: BigNumber;
    safetyPrice: BigNumber;
    debtCeiling: BigNumber;
    debtFloor: BigNumber;
  } = data;
  info(`==== COLLATERAL TYPE (${collateralType}) ====`);
  info(`Normalized Debt: ${formatWad(normalizedDebt)} WAD`);
  info(`Accumulated Rate: ${formatRay(accumulatedRate)} RAY`);
  info(`Safety Price: ${formatRay(safetyPrice)} RAY`);
  info(`Debt Ceiling: ${formatRad(debtCeiling)} RAD`);
  info(`Debt Floor: ${formatRad(debtFloor)} RAD`);
};

export const printCoreEngineGlobals = async (coreEngine: Contract) => {
  const [totalDebt, totalUnbackedDebt, totalDebtCeiling] = await Promise.all([
    coreEngine.totalDebt(),
    coreEngine.totalUnbackedDebt(),
    coreEngine.totalDebtCeiling(),
  ]);
  info(`==== CORE ENGINE ====`);
  info(`Total Debt: ${formatRad(totalDebt)} RAD`);
  info(`Total Unbacked Debt: ${formatRad(totalUnbackedDebt)} RAD`);
  info(`Total Debt Ceiling: ${formatRad(totalDebtCeiling)} RAD`);
};
