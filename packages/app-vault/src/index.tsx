import React from "react";
import ReactDOM from "react-dom";
import { ChainId, DAppProvider } from "@usedapp/core";
import { FlagsProvider } from "flagged";
// it will fail in the ci because the file may not exist => disabled
// eslint-disable-next-line import/no-unresolved
import "./index.css";
import { App } from "./App";
import { config } from "./config";

const dappConfig = {
  readOnlyChainId: config.network.chainId,
  readOnlyUrls: {
    [config.network.chainId]: config.node.rpc,
  },
  supportedChains: Object.values(ChainId) as ChainId[],
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={dappConfig}>
      <FlagsProvider features={config.featureFlags}>
        <App />
      </FlagsProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);