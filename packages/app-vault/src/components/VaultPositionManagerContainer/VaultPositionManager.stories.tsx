import React from "react";
import { VaultPositionManager } from "./VaultPositionManagerContainer";
import { action } from "@storybook/addon-actions";
import { collaterals } from "../../fixtures/deployments";
import { LiquidationState } from "../../hooks/useLiquidateVault";
import { ManagerState } from "../../hooks/usePositionManager";
import { BigNumber } from "ethers";
import { withKnobs, number, boolean } from "@storybook/addon-knobs";
import { exp } from "../../utils/number";

export default {
  title: "VaultPositionManager",
  component: VaultPositionManager,
  decorators: [withKnobs],
  parameters: {
    info: { inline: true, header: false },
  },
};

const vaultAddr = "0xabcd";
const collateral = collaterals[0];
const liquidateVault: LiquidationState = {
  state: "READY",
  liquidateVault: action("liquidateVault"),
};

export const VaultPositionManagerReady: React.FunctionComponent = () => {
  const queryStates = {
    proxyOwner: "0xabcd",
    isProxyOwner: boolean("isProxyOwner", true),
    isGrantedCollateralAllowance: boolean("isGrantedCollateralAllowance", true),
    isGrantedStablecoinAllowance: boolean("isGrantedStablecoinAllowance", true),
    debt: BigNumber.from(exp(18).mul(number("debt", 1000000))),
    lockedCollateral: BigNumber.from(exp(18).mul(number("lockedCollateral", 1000))),
    debtFloor: BigNumber.from(exp(45).mul(number("debtFloor", 1000000))),
    collateralizationRatio: BigNumber.from(exp(25).mul(number("collateralizationRatio", 125))),
    collateralBalance: BigNumber.from(exp(18).mul(number("collateralBalance", 250))),
    annualStabilityFee: BigNumber.from(exp(25).mul(number("annualStabilityFee", 108))),
    stablecoinBalance: BigNumber.from(exp(18).mul(number("stablecoinBalance", 800000))),
    oraclePrice: BigNumber.from(exp(27).mul(number("oraclePrice", 2000))),
    positionCollateralizationRatio: BigNumber.from(exp(25).mul(number("positionCollateralizationRatio", 200))),
    normalizedDebt: BigNumber.from("0"),
    accumulatedRate: BigNumber.from("0"),
    safetyPrice: BigNumber.from("0"),
    debtCeiling: BigNumber.from("0"),
    collateralAllowance: BigNumber.from("0"),
    stablecoinAllowance: BigNumber.from("0"),
  };
  const positionManager: ManagerState = {
    state: "READY",
    transferCollateralAndDebt: action("transferCollateralAndDebt"),
    closePosition: action("closePosition"),
    approveCollateralSpendByProxy: action("approveCollateralSpendByProxy"),
    approveStablecoinSpendByProxy: action("approveStablecoinSpendByProxy"),
    ...queryStates,
  };
  return (
    <div>
      <h1 className="storybook-title">Ready</h1>
      <VaultPositionManager
        vaultAddr={vaultAddr}
        collateral={collateral}
        liquidateVault={liquidateVault}
        positionManager={positionManager}
      />
    </div>
  );
};

export const VaultPositionManagerReadyWithError: React.FunctionComponent = () => {
  const queryStates = {
    proxyOwner: "0xabcd",
    isProxyOwner: boolean("isProxyOwner", true),
    isGrantedCollateralAllowance: boolean("isGrantedCollateralAllowance", true),
    isGrantedStablecoinAllowance: boolean("isGrantedStablecoinAllowance", true),
    debt: BigNumber.from(exp(18).mul(number("debt", 1000000))),
    lockedCollateral: BigNumber.from(exp(18).mul(number("lockedCollateral", 1000))),
    debtFloor: BigNumber.from(exp(45).mul(number("debtFloor", 1000000))),
    collateralizationRatio: BigNumber.from(exp(25).mul(number("collateralizationRatio", 125))),
    collateralBalance: BigNumber.from(exp(18).mul(number("collateralBalance", 250))),
    annualStabilityFee: BigNumber.from(exp(25).mul(number("annualStabilityFee", 108))),
    stablecoinBalance: BigNumber.from(exp(18).mul(number("stablecoinBalance", 800000))),
    oraclePrice: BigNumber.from(exp(27).mul(number("oraclePrice", 2000))),
    positionCollateralizationRatio: BigNumber.from(exp(25).mul(number("positionCollateralizationRatio", 200))),
    normalizedDebt: BigNumber.from("0"),
    accumulatedRate: BigNumber.from("0"),
    safetyPrice: BigNumber.from("0"),
    debtCeiling: BigNumber.from("0"),
    collateralAllowance: BigNumber.from("0"),
    stablecoinAllowance: BigNumber.from("0"),
  };
  const positionManager: ManagerState = {
    state: "ERROR_READY",
    errorMessage: "Error Message",
    transferCollateralAndDebt: action("transferCollateralAndDebt"),
    closePosition: action("closePosition"),
    approveCollateralSpendByProxy: action("approveCollateralSpendByProxy"),
    approveStablecoinSpendByProxy: action("approveStablecoinSpendByProxy"),
    ...queryStates,
  };
  return (
    <div>
      <h1 className="storybook-title">Ready with Errors</h1>
      <VaultPositionManager
        vaultAddr={vaultAddr}
        collateral={collateral}
        liquidateVault={liquidateVault}
        positionManager={positionManager}
      />
    </div>
  );
};

export const VaultPositionManagerPendingTransfer: React.FunctionComponent = () => {
  const queryStates = {
    proxyOwner: "0xabcd",
    isProxyOwner: boolean("isProxyOwner", true),
    isGrantedCollateralAllowance: boolean("isGrantedCollateralAllowance", true),
    isGrantedStablecoinAllowance: boolean("isGrantedStablecoinAllowance", true),
    debt: BigNumber.from(exp(18).mul(number("debt", 1000000))),
    lockedCollateral: BigNumber.from(exp(18).mul(number("lockedCollateral", 1000))),
    debtFloor: BigNumber.from(exp(45).mul(number("debtFloor", 1000000))),
    collateralizationRatio: BigNumber.from(exp(25).mul(number("collateralizationRatio", 125))),
    collateralBalance: BigNumber.from(exp(18).mul(number("collateralBalance", 250))),
    annualStabilityFee: BigNumber.from(exp(25).mul(number("annualStabilityFee", 108))),
    stablecoinBalance: BigNumber.from(exp(18).mul(number("stablecoinBalance", 800000))),
    oraclePrice: BigNumber.from(exp(27).mul(number("oraclePrice", 2000))),
    positionCollateralizationRatio: BigNumber.from(exp(25).mul(number("positionCollateralizationRatio", 200))),
    normalizedDebt: BigNumber.from("0"),
    accumulatedRate: BigNumber.from("0"),
    safetyPrice: BigNumber.from("0"),
    debtCeiling: BigNumber.from("0"),
    collateralAllowance: BigNumber.from("0"),
    stablecoinAllowance: BigNumber.from("0"),
  };
  const positionManager: ManagerState = {
    state: "PENDING_TRANSFER",
    ...queryStates,
  };
  return (
    <div>
      <h1 className="storybook-title">Pending transfers</h1>
      <VaultPositionManager
        vaultAddr={vaultAddr}
        collateral={collateral}
        liquidateVault={liquidateVault}
        positionManager={positionManager}
      />
    </div>
  );
};

export const VaultPositionManagerLoading: React.FunctionComponent = () => {
  const positionManager: ManagerState = {
    state: "PENDING_MULTICALL",
  };
  return (
    <div>
      <h1 className="storybook-title">Loading</h1>
      <VaultPositionManager
        vaultAddr={vaultAddr}
        collateral={collateral}
        liquidateVault={liquidateVault}
        positionManager={positionManager}
      />
    </div>
  );
};

export const VaultPositionManagerInvalidCollateral: React.FunctionComponent = () => {
  const positionManager: ManagerState = {
    state: "PENDING_MULTICALL",
  };
  return (
    <div>
      <h1 className="storybook-title">Invalid Collateral</h1>
      <VaultPositionManager vaultAddr={vaultAddr} liquidateVault={liquidateVault} positionManager={positionManager} />
    </div>
  );
};
