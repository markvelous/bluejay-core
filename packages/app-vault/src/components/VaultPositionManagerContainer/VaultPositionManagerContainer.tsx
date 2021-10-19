import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";

import { getCollateral } from "../../fixtures/deployments";
import { Layout } from "../Layout";
import { bnToNum, toBigNumber } from "../../utils/number";
import { Button } from "../Button/Button";
import { usePositionManager, ReadyManagerStates } from "../../hooks/usePositionManager";
import { BigNumber } from "ethers";
import { useLiquidateVault } from "../../hooks/useLiquidateVault";

interface MintingState {
  collateralInput: string;
  debtInput: string;
  collateralDelta: BigNumber;
  debtDelta: BigNumber;
}

export const ReadyPositionManager: FunctionComponent<{
  vaultAddr: string;
  positionManager: ReadyManagerStates;
  collateral: { name: string; collateralType: string; address: string };
  handleTransferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  handleClosePosition: () => void;
}> = ({ vaultAddr, positionManager, collateral, handleTransferCollateralAndDebt, handleClosePosition }) => {
  const liquidationState = useLiquidateVault({ collateral });
  const [mintingState, setMintingState] = useState<MintingState>({
    collateralInput: "",
    debtInput: "",
    collateralDelta: BigNumber.from(0),
    debtDelta: BigNumber.from(0),
  });
  const updateMintingState = (collateralInput: string, debtInput: string): void => {
    const collateralNum = collateralInput === "-" ? 0 : Number(collateralInput);
    const debtNum = debtInput === "-" ? 0 : Number(debtInput);
    if (isNaN(collateralNum) || isNaN(debtNum)) return;
    const debtDelta = toBigNumber(debtNum, 18);
    const collateralDelta = toBigNumber(collateralNum, 18);
    setMintingState({
      debtDelta,
      debtInput,
      collateralDelta,
      collateralInput,
    });
  };
  const {
    oraclePrice,
    lockedCollateral,
    debt,
    collateralBalance,
    stablecoinBalance,
    positionCollateralizationRatio,
    annualStabilityFee,
    collateralizationRatio,
    isGrantedCollateralAllowance,
    isGrantedStablecoinAllowance,
    isProxyOwner,
  } = positionManager;
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <h1>Position Manager</h1>

        <div className="mt-6">System Info</div>
        <div>
          Oracle Price: {bnToNum(oraclePrice, 27, 2)} MMKT/{collateral.name}{" "}
        </div>
        <div>Stability Fee: {((bnToNum(annualStabilityFee, 27, 4) - 1) * 100).toFixed(2)}%</div>
        <div>Minimum Collateralization Ratio: {bnToNum(collateralizationRatio, 27, 2) * 100}%</div>

        <div className="mt-6">Wallet</div>
        <div>
          {collateral.name} Balance: {bnToNum(collateralBalance, 18, 4)}
        </div>
        <div>MMKT Balance: {bnToNum(stablecoinBalance, 18, 4)}</div>

        <div className="mt-6">Vault</div>
        <div>
          Locked Collateral: {bnToNum(lockedCollateral, 18, 4)} {collateral.name}
        </div>
        <div>Debt: {bnToNum(debt, 18, 4)} MMKT</div>
        <div>Ratio: {bnToNum(positionCollateralizationRatio, 27, 4) * 100}%</div>

        {!isProxyOwner && <div>Not vault owner!</div>}
        {isProxyOwner && !isGrantedCollateralAllowance && (
          <Button
            onClick={() => {
              if (positionManager.state == "READY") positionManager.approveCollateralSpendByProxy();
            }}
          >
            Approve Collateral Spend
          </Button>
        )}
        {isProxyOwner && !isGrantedStablecoinAllowance && (
          <Button
            onClick={() => {
              if (positionManager.state == "READY") positionManager.approveStablecoinSpendByProxy();
            }}
          >
            Approve Stablecoin Spend
          </Button>
        )}
        {isProxyOwner && isGrantedCollateralAllowance && (
          <div>
            <div>Collateral Delta</div>
            <input
              value={mintingState.collateralInput}
              onChange={(e) => updateMintingState(e.target.value, mintingState.debtInput)}
            />
            <div>Debt Delta</div>
            <input
              value={mintingState.debtInput}
              onChange={(e) => updateMintingState(mintingState.collateralInput, e.target.value)}
            />
            <Button
              onClick={() => handleTransferCollateralAndDebt(mintingState.collateralDelta, mintingState.debtDelta)}
            >
              Mint
            </Button>
            <Button onClick={handleClosePosition}>Close Position</Button>
          </div>
        )}
        {!isProxyOwner && liquidationState.state == "READY" && (
          <Button onClick={() => liquidationState.liquidateVault(vaultAddr)}>Liquidate</Button>
        )}
      </div>
    </Layout>
  );
};

export const VaultPositionManagerContainer: FunctionComponent = () => {
  const { vaultAddr, collateralType } = useParams<{ vaultAddr: string; collateralType: string }>();
  const collateral = getCollateral(collateralType);
  const positionManager = usePositionManager({ vaultAddr, collateral });

  if (!collateral) return null;

  const handleTransferCollateralAndDebt = (collateralDelta: BigNumber, debtDelta: BigNumber): void => {
    if (positionManager.state !== "READY" && positionManager.state !== "TRANSFER_SUCCESS") return;
    positionManager.transferCollateralAndDebt(collateralDelta, debtDelta);
  };
  const handleClosePosition = (): void => {
    if (positionManager.state !== "READY" && positionManager.state !== "TRANSFER_SUCCESS") return;
    positionManager.closePosition();
  };
  if (positionManager.state === "UNCONNECTED") {
    return <div>Unconnected!</div>;
  }
  if (positionManager.state === "WRONG_NETWORK") {
    return <div>Wrong network!</div>;
  }
  if (positionManager.state === "PENDING_MULTICALL") {
    return <div>Loading...</div>;
  }
  if (
    positionManager.state === "READY" ||
    positionManager.state === "TRANSFER_SUCCESS" ||
    positionManager.state === "PENDING_TRANSFER" ||
    positionManager.state === "PENDING_APPROVAL"
  ) {
    return (
      <ReadyPositionManager
        vaultAddr={vaultAddr}
        positionManager={positionManager}
        collateral={collateral}
        handleTransferCollateralAndDebt={handleTransferCollateralAndDebt}
        handleClosePosition={handleClosePosition}
      />
    );
  }
  return <div>Error!</div>;
};
