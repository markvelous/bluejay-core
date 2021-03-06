const NETWORKS = {
  local: {
    url: `http://127.0.0.1:8545/`,
    chainId: 31337,
    name: "local"
  },
  development: {
    url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    chainId: 80001,
    name: "mumbai"
  },
  staging: {
    url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    chainId: 137,
    name: "polygon"
  },
  production: {
    url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    chainId: 137,
    name: "polygon"
  }
};
type NETWORK = "local" | "development" | "staging" | "production";

if (!process.env.NETWORK) throw new Error("NETWORK is undefined");
const currentNetwork = process.env.NETWORK as NETWORK;

const generateNetworks = () => {
  return NETWORKS[currentNetwork];
};

const generateApiKeys = () => {
  return {
    fixerKeys: JSON.parse(process.env.FIXER_KEYS || "[]") as string[]
  };
};

const generateContracts = () => {
  const oracle = process.env.ORACLE_ADDRESS;
  if (!oracle) throw new Error("ORACLE_ADDRESS is not defined");
  const poker = process.env.POKER_ADDRESS;
  if (!poker) throw new Error("POKER_ADDRESS is not defined");
  const osm = process.env.OSM_ADDRESS;
  if (!osm) throw new Error("OSM_ADDRESS is not defined");
  const ledger = process.env.LEDGER_ADDRESS;
  if (!ledger) throw new Error("LEDGER_ADDRESS is not defined");
  const accountingEngine = process.env.ACCOUNTING_ENGINE_ADDRESS;
  if (!accountingEngine) throw new Error("ACCOUNTING_ENGINE_ADDRESS is not defined");

  return {
    oracle,
    poker,
    ledger,
    osm,
    accountingEngine
  };
};

const generateWallets = () => {
  const oraclePriceFeed = process.env.ORACLE_UPDATER_KEY;
  if (!oraclePriceFeed) throw new Error("ORACLE_UPDATER_KEY is not defined");
  const poker = process.env.POKER_KEY;
  if (!poker) throw new Error("POKER_KEY is not defined");
  return { oraclePriceFeed, poker };
};

const generateTelegram = () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not defined");
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not defined");
  return { botToken, chatId };
};

const generateConfig = () => ({
  appName: "bluejay",
  networkName: currentNetwork,
  contracts: generateContracts(),
  network: generateNetworks(),
  apiKeys: generateApiKeys(),
  wallets: generateWallets(),
  telegram: generateTelegram()
});

export const config = generateConfig();
