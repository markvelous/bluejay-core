import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { getLogger } from "./debug";

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

export const incrementTime = async (
  ttl: number,
  provider: typeof ethers.provider
) => {
  await provider.send("evm_increaseTime", [ttl]);
  await mineBlocks(1, provider);
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

export const printLedgerCollateralType = async (
  ledger: Contract,
  collateralType: string
) => {
  const data = await ledger.collateralTypes(collateralType);
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

export const printLedgerGlobals = async (ledger: Contract) => {
  const [totalDebt, totalUnbackedDebt, totalDebtCeiling] = await Promise.all([
    ledger.totalDebt(),
    ledger.totalUnbackedDebt(),
    ledger.totalDebtCeiling(),
  ]);
  info(`==== CORE ENGINE ====`);
  info(`Total Debt: ${formatRad(totalDebt)} RAD`);
  info(`Total Unbacked Debt: ${formatRad(totalUnbackedDebt)} RAD`);
  info(`Total Debt Ceiling: ${formatRad(totalDebtCeiling)} RAD`);
};

export const printLedgerPosition = async (
  ledger: Contract,
  collateralType: string,
  address: string
) => {
  const { safetyPrice } = await ledger.collateralTypes(collateralType);
  const collateral = await ledger.collateral(collateralType, address);
  const debt = await ledger.debt(address);
  const position = await ledger.positions(collateralType, address);
  const {
    lockedCollateral,
    normalizedDebt,
  }: {
    lockedCollateral: BigNumber;
    normalizedDebt: BigNumber;
  } = position;
  info(`==== POSITION (${address}) ====`);
  info(`Free Collateral: ${formatWad(collateral)} WAD`);
  info(`Locked Collateral: ${formatWad(lockedCollateral)} WAD`);
  info(`Normalized Debt: ${formatWad(normalizedDebt)} WAD`);
  info(`Drawn Debt (stablecoin balance): ${formatRad(debt)} RAD`);
  info(
    `Max Debt Before Liquidation: ${formatRad(
      lockedCollateral.mul(safetyPrice)
    )} RAD`
  );
};
