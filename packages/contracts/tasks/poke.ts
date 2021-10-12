import { HardhatRuntimeEnvironment } from "hardhat/types";
import { enableAllLog, getLogger } from "../src/debug";

const { info } = getLogger("poke");

export const poke = async (
  {
    pokerAddress,
  }: {
    pokerAddress: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  enableAllLog();
  hre.ethers.utils.Logger.setLogLevel(hre.ethers.utils.Logger.levels.ERROR);

  const Poker = await hre.ethers.getContractFactory("Poker");
  const poker = await Poker.attach(pokerAddress);
  const receipt = await poker.poke();
  info(`Waiting for: ${receipt.hash}`);
  await receipt.wait();
  info(`Poke success`);
};
