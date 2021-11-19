import { BigNumber } from "ethers";
import React from "react";
import { CollateralFaucet } from "./CollateralFaucetContainer";
import { action } from "@storybook/addon-actions";

export default {
  title: "CollateralFaucet",
  decorators: [],
  component: CollateralFaucet,
  parameters: {
    info: { inline: true, header: false },
  },
};
export const UnconnectedCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "UNCONNECTED",
        activateBrowserWallet: action("activateBrowserWallet"),
      }}
    />
  );
};
export const WrongNetworkCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "WRONG_NETWORK",
        switchNetwork: action("switchNetwork"),
      }}
    />
  );
};
export const ErrorCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "ERROR",
      }}
    />
  );
};
export const UnsupportedFaucetCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "UNSUPPORTED_FAUCET",
      }}
    />
  );
};
export const ReadyCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "READY",
        account: "0x12345",
        balance: BigNumber.from(0),
        mintToken: action("mintToken"),
      }}
    />
  );
};
export const SuccessCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "SUCCESS",
        account: "0x12345",
        hash: "0xabcd",
        balance: BigNumber.from(0),
        mintToken: action("mintToken"),
      }}
    />
  );
};
export const PendingCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "PENDING",
        account: "0x12345",
        hash: "0xabcd",
      }}
    />
  );
};
