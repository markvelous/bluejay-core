import React, { FunctionComponent } from "react";
import { Button } from "../Button/Button";
import { Content, Layout } from "../Layout";
import { Link } from "react-router-dom";
import illustration from "./illustration-transparent.png";
import { useUserContext } from "../../context/UserContext";

export const HomeContainer: FunctionComponent = () => {
  const userContext = useUserContext();
  return (
    <Layout>
      <Content>
        <div
          className="text-white rounded-lg bg-blue-600 h-80 w-full p-6"
          style={{ backgroundImage: `url(${illustration})`, backgroundSize: 1000, backgroundPosition: "center" }}
        >
          <h1 className="font-bold text-3xl pt-14">Mint Stablecoins</h1>
          <div className="pt-6 pb-6 lg:w-3/5">
            Deposit your crypto asset (eg. USDT) as collateral to start minting soft-pegged local currencies such as
            Myanmar Kyat Tracker (MMKT).
          </div>
          <div>
            {userContext.state === "READY" && (
              <>
                <Link className="mr-3" to={`/vault/summary/${userContext.proxyAddress}`}>
                  <Button btnSize="lg">Mint Stablecoin</Button>
                </Link>
                <Link to={`/vault/savings/${userContext.proxyAddress}`}>
                  <Button btnSize="lg" scheme="secondary">
                    Save Stablecoin
                  </Button>
                </Link>
              </>
            )}
            {userContext.state === "PROXY_UNDEPLOYED" && (
              <Link to={`/vault`}>
                <Button btnSize="lg">Open A Vault</Button>
              </Link>
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

        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-blue-600 text-3xl">How It Works</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-6xl">💎</div>
              <h3 className="text-blue-600 text-2xl mb-4 mt-8">Deposit Collateral</h3>
              <div>User crypto assets (eg. USDT) as collateral to mint MMKT.</div>
            </div>
            <div className="text-center">
              <div className="text-6xl">🪙</div>
              <h3 className="text-blue-600 text-2xl mb-4 mt-8">Mint Stablecoins</h3>
              <div>Mint local stablecoins (eg. MMKT). Each stablecoin is backed by more assets than it's value.</div>
            </div>
            <div className="text-center">
              <div className="text-6xl">💹</div>
              <h3 className="text-blue-600 text-2xl mb-4 mt-8">Send, Save &amp; Farm</h3>
              <div>
                Use the stablecoins to buy other assets, get risk-free savings or farm for BLU tokens by providing
                liquidity.
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};
