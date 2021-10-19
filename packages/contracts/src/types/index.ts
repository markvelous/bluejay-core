import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
export type UseDeployment<Args = {}, ReturnParams = void> = (
  args: {
    deploymentCache: string;
    transactionCache: string;
    transactionOverrides: { gasPrice: BigNumber };
  } & Args,
  hre: HardhatRuntimeEnvironment
) => Promise<ReturnParams>;
