// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/camelcase
import { Poker__factory } from "@bluejayfinance/contracts";
import { BigNumber, providers, utils, Wallet } from "ethers";
import { publicRequestHandler } from "../../middlewares/handlers";
import { getLogger } from "../../common/logger";
import { config } from "../../config";

const { info } = getLogger("updateInfrastructure");

export const exp = (exponent: number) => {
  return BigNumber.from(10).pow(exponent);
};

const provider = new providers.JsonRpcProvider(config.network.url, {
  name: config.network.name,
  chainId: config.network.chainId
});
const wallet = new Wallet(config.wallets.poker, provider) as any;
// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/camelcase
const PokerContract = Poker__factory.connect(config.contracts.poker, wallet);

const handleUpdateInfrastructure = async () => {
  const receipt = await PokerContract.poke({ gasPrice: utils.parseUnits("30", "gwei") });
  info(`Waiting to be mined: ${receipt.hash}`);

  return { hash: receipt.hash };
};

export const handler = publicRequestHandler(handleUpdateInfrastructure);
