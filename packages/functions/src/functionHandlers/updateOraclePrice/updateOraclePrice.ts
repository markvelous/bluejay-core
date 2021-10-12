// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/camelcase
import { SingleFeedOracle__factory } from "@bluejayfinance/contracts";
import { BigNumber, providers, utils, Wallet } from "ethers";
import { publicRequestHandler } from "../../middlewares/handlers";
import { getLogger } from "../../common/logger";
import { getPricesFromMultipleSources } from "./getPricesFromMultipleSources";
import { config } from "../../config";
import { sendMessage } from "../../common/telegram";

const { info } = getLogger("updateOraclePrice");

export const exp = (exponent: number) => {
  return BigNumber.from(10).pow(exponent);
};

const provider = new providers.JsonRpcProvider(config.network.url, {
  name: config.network.name,
  chainId: config.network.chainId
});
const wallet = new Wallet(config.wallets.oraclePriceFeed, provider) as any;
// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/camelcase
const OracleContract = SingleFeedOracle__factory.connect(config.contracts.oracle, wallet);

const broadcastPrice = (
  priceData: {
    sources: {
      source: string;
      rate: number;
    }[];
    median: {
      source: string;
      rate: number;
    };
  },
  hash: string
) => {
  const { median, sources } = priceData;
  let message = "";
  message += `📈 *Oracle Price Update* 📈\n`;
  message += `Median source: ${median.source}\n`;
  message += `Median price: ${median.rate}\n\n`;
  message += `🧾 *Sources* 🧾\n`;
  sources.forEach(({ source, rate }) => {
    message += `Source: ${source}\n`;
    message += `Rate: ${rate}\n\n`;
  });
  message += `📡 *Price Update* 📡\n`;
  message += `[${hash}](https://polygonscan.com/tx/${hash})`;
  sendMessage(message);
};

const handleUpdateOraclePrice = async () => {
  const priceData = await getPricesFromMultipleSources();
  const price = priceData.median.rate;
  info(`Median price: ${price}`);

  const priceAsBn = BigNumber.from(Math.floor(price * 100000)).mul(exp(18 - 5));
  const receipt = await OracleContract.setPrice(priceAsBn, { gasPrice: utils.parseUnits("30", "gwei") });
  info(`Waiting to be mined: ${receipt.hash}`);
  broadcastPrice(priceData, receipt.hash);

  return { hash: receipt.hash };
};

export const handler = publicRequestHandler(handleUpdateOraclePrice);
