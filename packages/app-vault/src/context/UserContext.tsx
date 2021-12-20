import React, { createContext, FunctionComponent, useContext } from "react";
import { useEthers } from "@usedapp/core";
import { config } from "../config";
import { switchNetwork } from "../utils/metamask";

export interface Unconnected {
  state: "UNCONNECTED";
  activateBrowserWallet: () => void;
}

export interface WrongNetwork {
  state: "WRONG_NETWORK";
  switchNetwork: () => void;
}

export interface Ready {
  state: "READY";
  walletAddress: string;
  deactivate: () => void;
}

export type UserStates = Unconnected | WrongNetwork | Ready;

export const hasWalletAddress = (state: UserStates): state is Ready => {
  return ["READY"].includes(state.state);
};

export const UserContext = createContext<UserStates>({
  state: "UNCONNECTED",
  activateBrowserWallet: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
});

export const UserContextProvider: FunctionComponent = ({ children }) => {
  const { account, chainId, activateBrowserWallet, deactivate } = useEthers();

  const renderChildren = (value: UserStates): JSX.Element => (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );

  if (chainId !== config.network.chainId) return renderChildren({ state: "WRONG_NETWORK", switchNetwork });
  if (!account) return renderChildren({ state: "UNCONNECTED", activateBrowserWallet });

  return renderChildren({ state: "READY", walletAddress: account, deactivate });
};

export const useUserContext = (): UserStates => useContext(UserContext);
