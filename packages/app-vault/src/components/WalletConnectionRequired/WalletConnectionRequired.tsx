import React, { FunctionComponent } from "react";
import { Content, Layout } from "../Layout";
import { Button } from "../Button/Button";
import { useUserContext, hasWalletAddress } from "../../context/UserContext";

export const WalletConnectionRequired: FunctionComponent = () => {
  const userContext = useUserContext();

  return (
    <Layout>
      <Content>
        <div className="text-center mt-28 flex flex-col items-center text-gray-800">
          {userContext.state === "UNCONNECTED" && (
            <h2 className="my-16 text-blue-600 text-2xl">Please connect wallet</h2>
          )}
          {userContext.state === "WRONG_NETWORK" && (
            <h2 className="my-16 text-blue-600 text-2xl">Please switch wallet's network</h2>
          )}
          {userContext.state === "UNCONNECTED" && (
            <Button onClick={userContext.activateBrowserWallet}>Connect wallet</Button>
          )}
          {userContext.state === "WRONG_NETWORK" && <Button onClick={userContext.switchNetwork}>Switch Network</Button>}
          {hasWalletAddress(userContext) && (
            <h2 className="my-16 text-red-600 text-2xl">Error: You should not be seeing this message</h2>
          )}
        </div>
      </Content>
    </Layout>
  );
};
