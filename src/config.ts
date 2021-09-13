import { config as loadEnv } from "dotenv";

loadEnv();

const generateNetworks = () => {
  if (!process.env.MATIC_ACCOUNT_1)
    throw new Error(`MATIC_ACCOUNT_1 not set in config`);
  if (!process.env.MUMBAI_ACCOUNT_1)
    throw new Error(`MUMBAI_ACCOUNT_1 not set in config`);
  return {
    hardhat: {},
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [process.env.MATIC_ACCOUNT_1],
      chainId: 137,
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [process.env.MUMBAI_ACCOUNT_1],
      chainId: 80001,
    },
  };
};

const generateConfig = () => ({
  networks: generateNetworks(),
});

export const config = generateConfig();
