import { ChainId } from "@usedapp/core";
import { FeatureFlags } from "flagged";

// Determines if the configuration is for production or staging (still on polygon)
const isProduction = process.env?.REACT_APP_IS_MAINNET === "true";

const generateNetowork = (): { name: string; chainId: ChainId } => ({
  name: "polygon",
  chainId: ChainId.Polygon,
});

const generateNode = (): { rpc: string } => ({
  rpc: `https://polygon-mainnet.g.alchemy.com/v2/eM-07SCfIfmW68J7WcxxbjWS1xDMCqzs`,
});

const generateContractDeployment = (): { auction: string; governanceToken: string } => ({
  governanceToken: isProduction
    ? "0xc6B30dFA547c9f5403B7feD44FC45cD309E76DDe"
    : "0xba5fbf1f9333aBEadbCC36FbA450f8bc3B4535F0",
  auction: isProduction ? "0xcA3b9181aA4e2BaE51871a75644b6c955b982655" : "0x0c866448A25B9A67Ac2FAf217b2248556C13cd44",
});

const generateFeatureFlags = (): FeatureFlags => {
  return isProduction
    ? {
        liveTokenPrice: true,
        linkLiquidityMining: true,
        linkBuyBlu: true,
      }
    : {
        liveTokenPrice: true,
        linkLiquidityMining: true,
        linkBuyBlu: true,
      };
};

export const config = {
  isProduction,
  network: generateNetowork(),
  node: generateNode(),
  contractDeployments: generateContractDeployment(),
  featureFlags: generateFeatureFlags(),
};
