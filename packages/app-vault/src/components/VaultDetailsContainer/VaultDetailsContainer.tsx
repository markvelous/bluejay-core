import React, { FunctionComponent } from "react";
import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import { Layout } from "../Layout";
import { collaterals, getCollateral } from "../../fixtures/deployments";
import { useParams } from "react-router-dom";
import { BigNumber } from "ethers";
import { bnToNum } from "../../utils/number";
import { useVaultDetails, CollateralDetails } from "../../hooks/useVaultDetails";
import { addToken } from "../../utils/metamask";
import { stablecoinAddress } from "../../fixtures/deployments";

const CollateralSection: FunctionComponent<{
  vaultAddr: string;
  collateralDetails: CollateralDetails;
  collateral: { name: string; address: string; collateralType: string };
}> = ({ collateral, collateralDetails, vaultAddr }) => {
  const { debt, lockedCollateral, collateralizationRatio, oraclePrice } = collateralDetails;
  return (
    <div>
      <h3>Collateral Type: {collateral.name}</h3>
      <div>
        <div>
          <div>
            <h4>Debt</h4>
            <div>{bnToNum(debt, 18, 2)} MMKT</div>
          </div>
          <div>
            <h4>Locked Collateral</h4>
            <div>
              {bnToNum(lockedCollateral, 18, 2)} {collateral.name}
            </div>
          </div>
          <div>
            <h4>Collateralization Ratio</h4>
            <div>{bnToNum(collateralizationRatio, 27) * 100}%</div>
          </div>
          <div>
            <h4>Oracle Price</h4>
            <div>{bnToNum(oraclePrice, 27, 4)}</div>
          </div>
          <Link to={`/vault/${vaultAddr}/${collateral.collateralType}`}>
            <Button>Manage Position</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const VaultDetailsContainer: FunctionComponent = () => {
  const { vaultAddr } = useParams<{ vaultAddr: string; stablecoinAddr: string }>();
  const states = useVaultDetails({ proxy: vaultAddr, collateralTypes: collaterals.map((c) => c.collateralType) });
  if (states.state === "RESOLVED") {
    const { savings, collaterals } = states;
    const totalDebt = Object.keys(collaterals).reduce((sum, current) => {
      return sum.add(collaterals[current].debt);
    }, BigNumber.from(0));
    return (
      <Layout>
        <h1 className="pt-6 pb-4">Vault Details</h1>
        <Button
          onClick={() => addToken({ tokenAddress: stablecoinAddress, tokenDecimals: 18, tokenSymbol: "FakeMMKT" })}
        >
          Add MMKT Token
        </Button>
        <div>
          <div>
            <div>
              <h2>Total Savings</h2>
              <div>{bnToNum(savings)} MMKT</div>
            </div>
            <div>
              <h2>Total Debt</h2>
              <div>{bnToNum(totalDebt, 18, 2)} MMKT</div>
            </div>
          </div>
          <div>
            <h2 className="pt-6 pb-4">Collaterals</h2>
            <div>
              {collaterals &&
                Object.keys(collaterals).map((collateralType) => {
                  const collateral = getCollateral(collateralType);
                  if (!collateral) return null;
                  return (
                    <CollateralSection
                      key={collateralType}
                      vaultAddr={vaultAddr}
                      collateral={collateral}
                      collateralDetails={collaterals[collateralType]}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
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
