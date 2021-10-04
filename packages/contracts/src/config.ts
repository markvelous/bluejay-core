import { config as loadEnv } from "dotenv";

loadEnv();

const generateNetworks = () => {
  if (!process.env.ALCHEMY_KEY)
    throw new Error(`ALCHEMY_KEY not set in config`);
  if (!process.env.STAGING_KEY)
    throw new Error(`STAGING_KEY not set in config`);
  if (!process.env.PRODUCTION_KEY)
    throw new Error(`PRODUCTION_KEY not set in config`);
  if (!process.env.DEVELOPMENT_KEY)
    throw new Error(`DEVELOPMENT_KEY not set in config`);
  return {
    hardhat: {},
    local: {
      url: `http://127.0.0.1:8545/`,
    },
    development: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.DEVELOPMENT_KEY],
      chainId: 80001,
    },
    staging: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.STAGING_KEY],
      chainId: 137,
    },
    production: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRODUCTION_KEY],
      chainId: 137,
    },
  };
};

const generateConfig = () => ({
  networks: generateNetworks(),
});

export const config = generateConfig();
