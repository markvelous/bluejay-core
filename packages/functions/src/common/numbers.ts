import { BigNumber } from "ethers";
import { getLogger } from "./logger";

const { error } = getLogger("numbers");

export const exp = (exponent: number) => {
  return BigNumber.from(10).pow(exponent);
};

export const formatNumber = (decimal: number) => (num: BigNumber): number => {
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
