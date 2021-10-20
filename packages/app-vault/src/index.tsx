import React from "react";
import ReactDOM from "react-dom";
import { ChainId, DAppProvider } from "@usedapp/core";
// it will fail in the ci because the file may not exist => disabled
// eslint-disable-next-line import/no-unresolved
import "./index.css";
import { App } from "./App";
import { config } from "./config";
import { UserContextProvider } from "./context/UserContext";

const dappConfig = {
  readOnlyChainId: config.network.chainId,
  readOnlyUrls: {
    [config.network.chainId]: config.network.rpc,
  },
  supportedChains: Object.values(ChainId) as ChainId[],
  ...(config.network.multicallAddr
    ? {
        multicallAddresses: {
          [config.network.chainId]: config.network.multicallAddr,
        },
      }
    : {}),
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={dappConfig}>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
