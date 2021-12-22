import React, { FunctionComponent } from "react";
import { Content, Layout } from "../Layout";
import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import illustration from "./illustration-transparent.png";
import { useUserContext } from "../../context/UserContext";
import { deployments } from "./deployments";

export const ControlPanelContainer: FunctionComponent = () => {
  const userContext = useUserContext();
  return (
    <Layout>
      <Content>
        <div
          className="text-white rounded-lg bg-blue-600 h-80 w-full p-6"
          style={{ backgroundImage: `url(${illustration})`, backgroundSize: 1000, backgroundPosition: "center" }}
        >
          <h1 className="font-bold text-3xl pt-14">Bluejay Explorer</h1>
          <div className="pt-6 pb-6 lg:w-3/5">
            There should be a search bar here, a panel showing APY, Deposit & Index, and a swap panel.
          </div>
          <div>
            {userContext.state === "READY" && (
              <>
                <Link className="mr-3" to={`/control-panel`}>
                  <Button btnSize="lg">Control Panel</Button>
                </Link>
              </>
            )}
            {userContext.state === "UNCONNECTED" && (
              <Button btnSize="lg" onClick={userContext.activateBrowserWallet}>
                Connect Wallet
              </Button>
            )}
            {userContext.state === "WRONG_NETWORK" && (
              <Button btnSize="lg" onClick={userContext.switchNetwork}>
                Switch to Polygon
              </Button>
            )}
          </div>
        </div>
        <h1>Addresses</h1>
        <div>BLU Token: {deployments.contracts.BluejayToken.address}</div>
        <div>DAI Token: {deployments.contracts.MockReserveToken.address}</div>
        <div>Uniswap (BLU/DAI): {deployments.contracts.IUniswapV2Pair.address}</div>
        <div>Bond Depository (DAI): {deployments.contracts.BondDepositoryImpl.address}</div>
      </Content>
    </Layout>
  );
};
