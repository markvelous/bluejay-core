import React, { FunctionComponent, useState } from "react";
import { useCollateralFaucet, VaultState } from "../../hooks/useCollateralFaucet";
import { Button } from "../Button/Button";
import { Content, Layout } from "../Layout";
import { addToken } from "../../utils/metamask";
import { collateralFaucetAddress } from "../../fixtures/deployments";
import { bnToNum } from "../../utils/number";
import { BasicAlert, BasicSuccess, BasicWarning } from "../Feedback";

export const CollateralFaucet: FunctionComponent<{ faucetState: VaultState }> = ({ faucetState }) => {
  // added mintAmt and mintAmtChangeHanlder
  const [mintAmt, setMintAmt] = useState(1000);

  const mintAmtChangehandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMintAmt(parseFloat(event.target.value));
  };
  return (
    <Layout>
      <Content>
        <div className="text-blue-600 text-3xl">Faucet</div>
        {/*match mt-6 USDT button from Vault Position*/}
        <div className="mt-6">
          {faucetState.state === "SUCCESS" && <BasicSuccess title="Transaction successful" />}
          {faucetState.state === "PENDING" && `Deploying: ${faucetState.hash}`}
          {faucetState.state === "UNCONNECTED" && (
            <Button scheme="secondary" btnSize="lg" onClick={faucetState.activateBrowserWallet}>
              Connect
            </Button>
          )}
          {faucetState.state === "WRONG_NETWORK" && (
            <Button scheme="secondary" btnSize="lg" onClick={faucetState.switchNetwork}>
              Switch Network
            </Button>
          )}
          {(faucetState.state === "READY" || faucetState.state === "SUCCESS") && (
            <div className="my-6 w-96">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>MINT (Fake USD)</div>
                  <div className="text-sm text-gray-400">Wallet Balance: {bnToNum(faucetState.balance)} Fake USD</div>
                </div>
                <input
                  className="shadow-md rounded-lg mb-2 text-blue-900 w-full"
                  type="number"
                  placeholder="1000"
                  onChange={mintAmtChangehandler}
                />
                <Button scheme="secondary" btnSize="lg" onClick={() => faucetState.mintToken(mintAmt)}>
                  Mint Token
                </Button>
              </div>
            </div>
          )}
          {faucetState.state === "UNSUPPORTED_FAUCET" && <BasicWarning title="Faucet not available on this network" />}
          {(faucetState.state === "READY" || faucetState.state === "SUCCESS" || faucetState.state === "PENDING") && (
            // wrapped div with p-4
            <div className="mt-6">
              <Button
                scheme="secondary"
                btnSize="lg"
                onClick={() =>
                  addToken({ tokenAddress: collateralFaucetAddress, tokenDecimals: 18, tokenSymbol: "FakeUSD" })
                }
              >
                Add Fake USD Token
              </Button>
            </div>
          )}
          {faucetState.state === "ERROR" && <BasicAlert title="There was an unexpected error" />}
        </div>
      </Content>
    </Layout>
  );
};

export const CollateralFaucetContainer: FunctionComponent = () => {
  const faucetState = useCollateralFaucet();
  return <CollateralFaucet faucetState={faucetState} />;
};
