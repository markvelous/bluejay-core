/* eslint-disable import/no-extraneous-dependencies */
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const swapOnPool = async (
  {
    StablecoinToken,
    ReserveToken,
    Pool,
    deployer,
  }: {
    StablecoinToken: Contract;
    ReserveToken: Contract;
    Pool: Contract;
    deployer: SignerWithAddress;
  },
  stablecoinToReserve: boolean,
  amount: BigNumber
) => {
  const reserveIsToken0 = ReserveToken.address === (await Pool.token0());
  const reserves = await Pool.getReserves();
  const stablecoinReserve = reserveIsToken0
    ? reserves.reserve1
    : reserves.reserve0;
  const reserveReserve = reserveIsToken0
    ? reserves.reserve0
    : reserves.reserve1;
  const amountInWithFee = amount.mul(997);
  const numerator = amountInWithFee.mul(
    stablecoinToReserve ? reserveReserve : stablecoinReserve
  );
  const denominator = (stablecoinToReserve ? stablecoinReserve : reserveReserve)
    .mul(1000)
    .add(amountInWithFee);
  const amountOut = numerator.div(denominator);
  if (stablecoinToReserve) {
    await StablecoinToken.mint(Pool.address, amount);
  } else {
    await ReserveToken.mint(Pool.address, amount);
  }
  await Pool.swap(
    stablecoinToReserve === reserveIsToken0 ? amountOut : 0,
    stablecoinToReserve === reserveIsToken0 ? 0 : amountOut,
    deployer.address,
    "0x"
  );
};
