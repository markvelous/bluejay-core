import { config as loadEnv } from "dotenv";

loadEnv();

const PLACEHOLDER_KEY =
  "0000000000000000000000000000000000000000000000000000000000000001";

const generateNetworks = () => {
  return {
    hardhat: {},
    local: {
      url: `http://127.0.0.1:8545/`,
    },
    development: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.DEVELOPMENT_KEY || PLACEHOLDER_KEY],
      chainId: 80001,
    },
    staging: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.STAGING_KEY || PLACEHOLDER_KEY],
      chainId: 137,
    },
    production: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRODUCTION_KEY || PLACEHOLDER_KEY],
      chainId: 137,
    },
  };
};

const generateConfig = () => ({
  networks: generateNetworks(),
});

export const config = generateConfig();
