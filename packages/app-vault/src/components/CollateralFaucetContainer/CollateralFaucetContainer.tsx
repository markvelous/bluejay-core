import React, { FunctionComponent, useState } from "react";
import { useCollateralFaucet, VaultState } from "../../hooks/useCollateralFaucet";
import { Button } from "../Button/Button";
import { Layout } from "../Layout";
import { addToken } from "../../utils/metamask";
import { collateralFaucetAddress } from "../../fixtures/deployments";
import { bnToNum } from "../../utils/number";

export const CollateralFaucet: FunctionComponent<{ faucetState: VaultState }> = ({ faucetState }) => {
  // added mintAmt and mintAmtChangeHanlder
  const [mintAmt, setMintAmt] = useState(1000);

  const mintAmtChangehandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMintAmt(parseFloat(event.target.value));
  };
  console.log(faucetState);
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden text-blue-200 font-bold">
        Faucet
      </div>
      {faucetState.state === "PENDING" && `Deploying: ${faucetState.hash}`}
      {faucetState.state === "UNCONNECTED" && <Button onClick={faucetState.activateBrowserWallet}>Connect</Button>}
      {faucetState.state === "WRONG_NETWORK" && <Button onClick={faucetState.switchNetwork}>Switch Network</Button>}
      {faucetState.state === "READY" && (
        <div className="p-4">
          <h3>MINT (Fake USD) Amount</h3>
          <input className="shadow-md rounded-lg" type="number" placeholder="1000" onChange={mintAmtChangehandler} />
          <div>Balance: {bnToNum(faucetState.balance)} FakeUSD</div>
          <Button onClick={() => faucetState.mintToken(mintAmt)}>Mint Token</Button>
        </div>
      )}
      {faucetState.state === "UNSUPPORTED_FAUCET" && "Faucet not available on this network"}
      {faucetState.state !== "UNSUPPORTED_FAUCET" && (
        // wrapped div with p-4
        <div className="p-4">
          <Button
            onClick={() =>
              addToken({ tokenAddress: collateralFaucetAddress, tokenDecimals: 18, tokenSymbol: "FakeUSD" })
            }
          >
            Add Fake USD Token
          </Button>
        </div>
      )}
    </Layout>
  );
};

export const CollateralFaucetContainer: FunctionComponent = () => {
  const faucetState = useCollateralFaucet();
  return <CollateralFaucet faucetState={faucetState} />;
};
