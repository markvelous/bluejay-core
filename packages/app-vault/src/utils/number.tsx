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

export const bnToNum = (num: BigNumber, decimals = 18, precision = 2): number => {
  const beforeDecimals = num.div(exp(decimals - precision));
  return beforeDecimals.toNumber() / 10 ** precision;
};

export const bnRayPow = (ray: BigNumber, pow: number): BigNumber => {
  const res = ray;
  for (let i = 0; i < pow; i++) {
    res.mul(ray).div(exp(27));
  }
  return res;
};
