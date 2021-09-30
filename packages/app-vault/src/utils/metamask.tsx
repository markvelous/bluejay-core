import { config } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: any;

export const switchNetwork = async (): Promise<void> =>
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x89",
        chainName: "Matic Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: ["https://rpc-mainnet.matic.network"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    ],
  });

export const addToken = async ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenImage,
}: {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenImage: string;
}): Promise<void> =>
  window.ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        image: tokenImage,
      },
    },
  });

export const addGovernanceToken = (): ReturnType<typeof addToken> =>
  addToken({
    tokenAddress: config.contractDeployments.governanceToken,
    tokenSymbol: config.isProduction ? "BLU" : "BLU (TEST)",
    tokenDecimals: 18,
    tokenImage: "https://assets.bluejay.finance/logo/logo512.png",
  });
