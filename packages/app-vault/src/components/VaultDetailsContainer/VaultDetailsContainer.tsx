import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { Content, Layout } from "../Layout";
import { collaterals, getCollateral, Collateral } from "../../fixtures/deployments";
import { useParams } from "react-router-dom";
import { bnToNum } from "../../utils/number";
import { useVaultDetails, CollateralDetails } from "../../hooks/useVaultDetails";

const CollateralSection: FunctionComponent<{
  vaultAddr: string;
  collateralDetails: CollateralDetails;
  collateral: Collateral;
}> = ({ collateral, collateralDetails, vaultAddr }) => {
  const { debt, lockedCollateral, collateralizationRatio, oraclePrice, annualStabilityFee } = collateralDetails;
  return (
    <Link to={`/vault/position/${vaultAddr}/${collateral.name}`}>
      <div className="bg-white rounded-md p-2 w-60">
        <img src={collateral.logo} className="w-20 m-auto my-6" />
        <h3 className="text-xl text-blue-600 my-6">{collateral.name}</h3>
        <div className="text-left">
          <div className="text-blue-600 text-xs font-bold mt-3">Oracle Price:</div>
          <div className="text-blue-600 text-sm">
            {bnToNum(oraclePrice, 27)} MMKT/{collateral.name}
          </div>

          <div className="text-blue-600 text-xs font-bold mt-3">Stability Fee:</div>
          <div className="text-blue-600 text-sm">{((bnToNum(annualStabilityFee, 27, 4) - 1) * 100).toFixed(2)}%</div>

          <div className="text-blue-600 text-xs font-bold mt-3">Required Collaterals:</div>
          <div className="text-blue-600 text-sm">{bnToNum(collateralizationRatio, 27) * 100}%</div>

          <div className="text-blue-600 text-xs font-bold mt-3">Locked Collaterals:</div>
          <div className="text-blue-600 text-sm">
            {bnToNum(lockedCollateral, 18, 2)} {collateral.name}
          </div>

          <div className="text-blue-600 text-xs font-bold mt-3">Outstanding Debt:</div>
          <div className="text-blue-600 text-sm">{bnToNum(debt, 18, 2)} MMKT</div>
        </div>
      </div>
    </Link>
  );
};

export const VaultDetailsContainer: FunctionComponent = () => {
  const { vaultAddr } = useParams<{ vaultAddr: string; stablecoinAddr: string }>();
  const states = useVaultDetails({ proxy: vaultAddr, collateralTypes: collaterals.map((c) => c.collateralType) });
  if (states.state === "RESOLVED") {
    const { collaterals } = states;
    return (
      <Layout>
        <Content>
          <div className="text-center mt-28 flex flex-col items-center text-gray-800">
            <h2 className="text-blue-600 text-3xl">Select Collateral</h2>
            <div className="my-8">Select the collateral you to mint or repay the stablecoin</div>
            <div className="grid grid-cols-4 gap-4">
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
        </Content>
      </Layout>
    );
  }
  return null;
};
