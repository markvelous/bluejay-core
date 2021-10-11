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
  return {
    oracle
  };
};

const generateWallets = () => {
  const oraclePriceFeed = process.env.ORACLE_UPDATER_KEY;
  if (!oraclePriceFeed) throw new Error("ORACLE_UPDATER_KEY is not defined");
  return { oraclePriceFeed };
};

const generateConfig = () => ({
  appName: "bluejay",
  networkName: currentNetwork,
  contracts: generateContracts(),
  network: generateNetworks(),
  apiKeys: generateApiKeys(),
  wallets: generateWallets()
});

export const config = generateConfig();
