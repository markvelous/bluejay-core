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

export const ReadyCollateralFaucetStory: React.FunctionComponent = () => {
  return (
    <CollateralFaucet
      faucetState={{
        state: "READY",
        account: "0x12345",
        balance: BigNumber.from(0),
        mintToken: action("testing"),
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
