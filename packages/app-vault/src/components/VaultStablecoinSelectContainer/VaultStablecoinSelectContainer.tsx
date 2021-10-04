import React, { FunctionComponent } from "react";
import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import { Layout } from "../Layout";
import { collaterals } from "../../fixtures/deployments";
import { useParams } from "react-router-dom";

export const VaultStablecoinSelectContainer: FunctionComponent = () => {
  const { vaultAddr } = useParams<{ vaultAddr: string }>();
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <div>Vault Addr: {vaultAddr}</div>
        <div>Collaterals:</div>
        {collaterals.map((collateral, key) => (
          <Button key={key}>
            <Link to={`/vault/${vaultAddr}/${collateral.address}`}>{collateral.name}</Link>
          </Button>
        ))}
      </div>
    </Layout>
  );
};
