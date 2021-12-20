import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { getLogger } from "./debug";

const { error } = getLogger("utils");

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
