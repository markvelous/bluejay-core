import { config } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: any;

export const addToken = async ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenImage = "",
}: {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenImage?: string;
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

export const switchNetwork = async (): Promise<void> =>
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: config.network.chainId,
        chainName: config.network.name,
        nativeCurrency: {
          name: config.network.nativeCurrency,
          symbol: config.network.nativeCurrency,
          decimals: 18,
        },
        rpcUrls: [config.network.publicRpc],
        blockExplorerUrls: [config.network.blockExplorer],
      },
    ],
  });
