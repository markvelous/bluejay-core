import { ChainId } from "@usedapp/core";

// local - local blockchain deployment
// development = development deployment on mumbai
// staging - staging deployment on ploygon
// production - production deployment on ploygon
type ENVIRONMENT = "local" | "development" | "staging" | "production";
const environment = (process.env.REACT_ENVIRONMENT ?? "local") as ENVIRONMENT;

const generateNetwork = (
  env: ENVIRONMENT
): {
  name: string;
  chainId: ChainId;
  rpc: string;
  publicRpc: string;
  nativeCurrency: string;
  blockExplorer: string;
} => {
  if (env === "local") {
    return {
      name: "hardhat",
      chainId: ChainId.Hardhat,
      rpc: `http://localhost:8545`,
      publicRpc: `http://localhost:8545`,
      nativeCurrency: "MATIC",
      blockExplorer: "",
    };
  }
  if (env === "development") {
    return {
      name: "mumbai",
      chainId: ChainId.Mumbai,
      rpc: `https://polygon-mumbai.g.alchemy.com/v2/eM-07SCfIfmW68J7WcxxbjWS1xDMCqzs`,
      publicRpc: `https://rpc-mumbai.matic.today`,
      nativeCurrency: "MATIC",
      blockExplorer: "https://mumbai.polygonscan.com/",
    };
  }
  // staging or production
  return {
    name: "polygon",
    chainId: ChainId.Polygon,
    rpc: `https://polygon-mainnet.g.alchemy.com/v2/eM-07SCfIfmW68J7WcxxbjWS1xDMCqzs`,
    publicRpc: `https://rpc-mainnet.matic.network`,
    nativeCurrency: "MATIC",
    blockExplorer: "https://polygonscan.com/",
  };
};

export const config = {
  environment,
  network: generateNetwork(environment),
};
