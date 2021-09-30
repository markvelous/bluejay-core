import { BigNumber } from "ethers";

export const exp = (e: number): BigNumber => BigNumber.from(10).pow(e);

const precision = (a: number): number => {
  if (!isFinite(a)) return 0;
  let e = 1;
  let p = 0;
  while (Math.round(a * e) / e !== a) {
    e *= 10;
    p++;
  }
  return p;
};

export const toBigNumber = (num: number, decimals = 18): BigNumber => {
  const adjustments = precision(num) < decimals ? precision(num) : decimals;
  const multiplier = decimals - adjustments;
  return BigNumber.from(num * 10 ** adjustments).mul(exp(multiplier));
};
