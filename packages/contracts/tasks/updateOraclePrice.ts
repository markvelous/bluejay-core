import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { enableAllLog, getLogger } from "../src/debug";

const { info } = getLogger("poke");

export const updateOraclePrice = async (
  {
    oracleAddress,
    price,
  }: {
    oracleAddress: string;
    price: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  enableAllLog();
  hre.ethers.utils.Logger.setLogLevel(hre.ethers.utils.Logger.levels.ERROR);

  const Oracle = await hre.ethers.getContractFactory("SingleFeedOracle");
  const oracle = await Oracle.attach(oracleAddress);
  const receipt = await oracle.setPrice(BigNumber.from(price));
  info(`Waiting for: ${receipt.hash}`);
  await receipt.wait();
  info(`Price update success`);
};
