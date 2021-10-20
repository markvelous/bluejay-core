import React, { FunctionComponent } from "react";
import { Button } from "../../components/Button/Button";
import { Layout } from "../../components/Layout";
import { useUserContext } from "../../context/UserContext";
import { Hero } from "./Hero";

export const Home: FunctionComponent = () => {
  const user = useUserContext();
  console.log(user);
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <Hero />
        {user.state === "UNCONNECTED" && <Button onClick={user.activateBrowserWallet}>Connect</Button>}
        {user.state === "READY" && <div>{user.walletAddress}</div>}
      </div>
    </Layout>
  );
};
