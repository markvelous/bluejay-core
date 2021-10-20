import React, { createContext, FunctionComponent, useContext } from "react";
import { useEthers, useContractFunction } from "@usedapp/core";
import { config } from "../config";
import { switchNetwork } from "../utils/metamask";
import { useTypedContractCall } from "../hooks/utils";
import { constants, utils, Contract } from "ethers";
import ProxyRegistryAbi from "@bluejayfinance/contracts/abi/ProxyRegistry.json";
import { proxyRegistryAddress } from "../fixtures/deployments";

export interface Unconnected {
  state: "UNCONNECTED";
  activateBrowserWallet: () => void;
}

export interface WrongNetwork {
  state: "WRONG_NETWORK";
  switchNetwork: () => void;
}

export interface PendingProxy {
  state: "PENDING_PROXY";
  walletAddress: string;
  deactivate: () => void;
}

export interface Ready {
  state: "READY";
  walletAddress: string;
  proxyAddress: string;
  deactivate: () => void;
}

export interface ProxyUndeployed {
  state: "PROXY_UNDEPLOYED";
  walletAddress: string;
  deployVault: () => void;
  deactivate: () => void;
}

export interface DeployingProxy {
  state: "DEPLOYING_PROXY";
  walletAddress: string;
  deactivate: () => void;
}

export type UserStates = Unconnected | WrongNetwork | PendingProxy | ProxyUndeployed | DeployingProxy | Ready;

export const hasWalletAddress = (
  state: UserStates
): state is DeployingProxy | ProxyUndeployed | Ready | PendingProxy => {
  return ["DEPLOYING_PROXY", "PROXY_UNDEPLOYED", "READY", "PENDING_PROXY"].includes(state.state);
};

export const UserContext = createContext<UserStates>({
  state: "UNCONNECTED",
  activateBrowserWallet: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyRegistryContract = new Contract(proxyRegistryAddress, ProxyRegistryAbi) as any;

export const UserContextProvider: FunctionComponent = ({ children }) => {
  const { account, chainId, activateBrowserWallet, deactivate } = useEthers();
  const { state: deployingState, send } = useContractFunction(proxyRegistryContract, "build()");

  const proxyState = useTypedContractCall<[string]>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: new utils.Interface(ProxyRegistryAbi),
    address: proxyRegistryAddress,
    method: "proxies",
    args: [account],
  });

  const renderChildren = (value: UserStates): JSX.Element => (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );

  const deployVault = (): Promise<void> => send();

  if (chainId !== config.network.chainId) return renderChildren({ state: "WRONG_NETWORK", switchNetwork });
  if (!account) return renderChildren({ state: "UNCONNECTED", activateBrowserWallet });

  if (proxyState.state === "UNRESOLVED")
    return renderChildren({ state: "PENDING_PROXY", walletAddress: account, deactivate });

  if (deployingState.status === "Mining")
    return renderChildren({ state: "DEPLOYING_PROXY", walletAddress: account, deactivate });

  if (proxyState.state === "RESOLVED")
    return proxyState.result[0] !== constants.AddressZero
      ? renderChildren({ state: "READY", walletAddress: account, proxyAddress: proxyState.result[0], deactivate })
      : renderChildren({ state: "PROXY_UNDEPLOYED", walletAddress: account, deployVault, deactivate });

  return renderChildren({ state: "UNCONNECTED", activateBrowserWallet });
};

export const useUserContext = (): UserStates => useContext(UserContext);
