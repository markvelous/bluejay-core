/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/camelcase */
// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/camelcase
import {
  SingleFeedOracle__factory,
  OracleSecurityModule__factory,
  AccountingEngine__factory,
  Ledger__factory
} from "@bluejayfinance/contracts";
import { providers, Wallet } from "ethers";
import { publicRequestHandler } from "../../middlewares/handlers";
import { getLogger } from "../../common/logger";
import { formatWad, formatRad } from "../../common/numbers";
import { config } from "../../config";
import { sendMessage } from "../../common/telegram";

const { info } = getLogger("reportSystemInfo");

const provider = new providers.JsonRpcProvider(config.network.url, {
  name: config.network.name,
  chainId: config.network.chainId
});
const wallet = new Wallet(config.wallets.poker, provider) as any;

const OracleContract = SingleFeedOracle__factory.connect(config.contracts.oracle, wallet);
const OsmContract = OracleSecurityModule__factory.connect(config.contracts.osm, wallet);
const LedgerContract = Ledger__factory.connect(config.contracts.ledger, wallet);
const AccountingEngineContract = AccountingEngine__factory.connect(config.contracts.accountingEngine, wallet);

const handleReportSystemInfo = async () => {
  const [oracleCurrentPrice] = await OracleContract.getPrice();
  const [osmCurrentPrice] = await OsmContract.getPrice();
  const [osmNextPrice] = await OsmContract.getNextPrice();
  const ledgerTotalDebt = await LedgerContract.totalDebt();
  const ledgerTotalUnbackedDebt = await LedgerContract.totalUnbackedDebt();
  const ledgerTotalDebtCeiling = await LedgerContract.totalDebtCeiling();
  const accountingEngineQueuedDebt = await AccountingEngineContract.totalQueuedDebt();
  const accountingEngineDebtOnAuction = await AccountingEngineContract.totalDebtOnAuction();
  const accountingEngineSurplus = await LedgerContract.debt(config.contracts.accountingEngine);
  const accountingEngineDebtInQueue = await AccountingEngineContract.countPendingDebts();

  const data = {
    oracle: { currentPrice: formatWad(oracleCurrentPrice) },
    osm: { currentPrice: formatWad(osmCurrentPrice), nextPrice: formatWad(osmNextPrice) },
    ledger: {
      debt: formatRad(ledgerTotalDebt),
      unbackedDebt: formatRad(ledgerTotalUnbackedDebt),
      debtCeiling: formatRad(ledgerTotalDebtCeiling)
    },
    accountingEngine: {
      pendingDebt: formatRad(accountingEngineQueuedDebt),
      debtOnAuction: formatRad(accountingEngineDebtOnAuction),
      surplus: formatRad(accountingEngineSurplus),
      pendingDebtCount: accountingEngineDebtInQueue
    }
  };
  info(JSON.stringify(data));

  let message = "";
  message += "*System Report*\n";

  message += `\n📈 *Price Info* 📈\n`;
  message += `Oracle Price: ${data.oracle.currentPrice.toLocaleString()}\n`;
  message += `OSM Current Price: ${data.osm.currentPrice.toLocaleString()}\n`;
  message += `OSM Next Price: ${data.osm.nextPrice.toLocaleString()}\n`;

  message += `\n📔 *Ledger Info* 📔\n`;
  message += `Total Stablecoin (Debt): ${data.ledger.debt.toLocaleString()}\n`;
  message += `Total Unbacked Debt: ${data.ledger.unbackedDebt.toLocaleString()}\n`;
  message += `Total Debt Ceiling: ${data.ledger.debtCeiling.toLocaleString()}\n`;

  message += `\n📑 *P&L Info* 📑\n`;
  message += `Surplus: ${data.accountingEngine.surplus.toLocaleString()}\n`;
  message += `Debt In Queue: ${data.accountingEngine.pendingDebt.toLocaleString()}\n`;
  message += `Debt On Auction: ${data.accountingEngine.debtOnAuction.toLocaleString()}\n`;
  message += `Queued Debt Count: ${data.accountingEngine.pendingDebtCount}\n`;
  sendMessage(message);

  return data;
};

export const handler = publicRequestHandler(handleReportSystemInfo);
