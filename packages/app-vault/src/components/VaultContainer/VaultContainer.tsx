import React, { FunctionComponent } from "react";
import { Redirect } from "react-router";
import { useVault } from "../../hooks/useVault";
import { Button } from "../Button/Button";
import { Layout } from "../Layout";

export const VaultContainer: FunctionComponent = () => {
  const vaultState = useVault();
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">Vault</div>
      {vaultState.state === "FETCHING_VAULT" && "Loading..."}
      {vaultState.state === "DEPLOYING_VAULT" && `Deploying: ${vaultState.hash}`}
      {vaultState.state === "UNCONNECTED" && <Button onClick={vaultState.activateBrowserWallet}>Connect</Button>}
      {vaultState.state === "WRONG_NETWORK" && <Button onClick={vaultState.switchNetwork}>Switch Network</Button>}
      {vaultState.state === "VAULT_MISSING" && <Button onClick={vaultState.deployVault}>Deploy Vault</Button>}
      {vaultState.state === "VAULT_FOUND" && <Redirect to={`/vault/summary/${vaultState.vault}`} />}
    </Layout>
  );
};
