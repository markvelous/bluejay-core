import React from "react";
import { Vault } from "./VaultContainer";
import { action } from "@storybook/addon-actions";

export default {
  title: "Vault",
  component: Vault,
  parameters: {
    info: { inline: true, header: false },
  },
};

const proxyAddress = "0xabcd";
const walletAddress = "0x1234";
const deactivate = action("deactivate");
const switchNetwork = action("switchNetwork");
const activateBrowserWallet = action("activateBrowserWallet");

export const VaultFound: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Vault Found</h1>
    <Vault
      userContext={{
        state: "READY",
        proxyAddress,
        walletAddress,
        deactivate,
      }}
    />
  </div>
);

export const VaultMissing: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">No proxy found</h1>
    <Vault
      userContext={{
        state: "PROXY_UNDEPLOYED",
        walletAddress: "0x1234",
        deactivate,
        deployVault: action("deployVault"),
      }}
    />
  </div>
);
export const WrongNetwork: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Wrong Network</h1>
    <Vault userContext={{ state: "WRONG_NETWORK", switchNetwork }} />
  </div>
);

export const Unconnected: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Unconnected</h1>
    <Vault userContext={{ state: "UNCONNECTED", activateBrowserWallet }} />
  </div>
);

export const DeployingProxy: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Deploying Proxy</h1>
    <Vault userContext={{ state: "DEPLOYING_PROXY", walletAddress: "0x1234", deactivate }} />
  </div>
);

export const PendingProxy: React.FunctionComponent = () => (
  <div>
    <h1 className="storybook-title">Waiting for proxy to be found</h1>
    <Vault userContext={{ state: "PENDING_PROXY", walletAddress: "0x1234", deactivate }} />
  </div>
);
