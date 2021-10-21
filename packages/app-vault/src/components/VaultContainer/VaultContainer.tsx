import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { Button } from "../Button/Button";
import { Content, Layout } from "../Layout";

export const VaultContainer: FunctionComponent = () => {
  const userContext = useUserContext();
  return (
    <Layout>
      <Content>
        <div className="text-center mt-28 flex flex-col items-center text-gray-800">
          <h1 className="text-3xl text-blue-600">Create Bluejay Vault</h1>
          <div className="mt-16 max-w-3xl">
            In order to start minting stablecoins (eg. MMKT), you need to create a vault to manage your locked
            collaterals and stablecoin debts. Only one vault is required across the entire Bluejay ecosystem.
          </div>
          <div className="mt-12">
            {userContext.state === "WRONG_NETWORK" && (
              <Button scheme="secondary" btnSize="lg" onClick={userContext.switchNetwork}>
                Switch to Polygon
              </Button>
            )}
            {userContext.state === "UNCONNECTED" && (
              <Button scheme="secondary" btnSize="lg" onClick={userContext.activateBrowserWallet}>
                Connect Wallet
              </Button>
            )}
            {userContext.state === "PROXY_UNDEPLOYED" && (
              <Button scheme="secondary" btnSize="lg" onClick={userContext.deployVault}>
                Create Vault
              </Button>
            )}
            {userContext.state === "DEPLOYING_PROXY" && (
              <Button scheme="secondary" btnSize="lg">
                Deploying Vault...
              </Button>
            )}
            {userContext.state === "READY" && (
              <Link to={`/vault/summary/${userContext.proxyAddress}`}>
                <Button scheme="secondary" btnSize="lg">
                  Visit Vault
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};
