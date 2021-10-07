import React, { FunctionComponent } from "react";
import { useCollateralFaucet } from "../../hooks/useCollateralFaucet";
import { Button } from "../Button/Button";
import { Layout } from "../Layout";
import { addToken } from "../../utils/metamask";
import { collateralFaucetAddress } from "../../fixtures/deployments";
import { bnToNum } from "../../utils/number";
export const CollateralFaucetContainer: FunctionComponent = () => {
  const faucetState = useCollateralFaucet();
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">Faucet</div>
      {faucetState.state === "PENDING" && `Deploying: ${faucetState.hash}`}
      {faucetState.state === "UNCONNECTED" && <Button onClick={faucetState.activateBrowserWallet}>Connect</Button>}
      {faucetState.state === "WRONG_NETWORK" && <Button onClick={faucetState.switchNetwork}>Switch Network</Button>}
      {faucetState.state === "READY" && (
        <div className="p-4">
          <div>Balance: {bnToNum(faucetState.balance)} FakeUSD</div>
          <Button onClick={() => faucetState.mintToken(1000)}>Mint Token</Button>
        </div>
      )}
      {faucetState.state === "UNSUPPORTED_FAUCET" && "Faucet not available on this network"}
      {faucetState.state !== "UNSUPPORTED_FAUCET" && (
        <Button
          onClick={() => addToken({ tokenAddress: collateralFaucetAddress, tokenDecimals: 18, tokenSymbol: "FakeUSD" })}
        >
          Add Fake USD Token
        </Button>
      )}
    </Layout>
  );
};
