import React, { FunctionComponent } from "react";
import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import { Layout } from "../Layout";
import { collaterals, savingsAccountAddress } from "../../fixtures/deployments";
import { useParams } from "react-router-dom";
import { useContractCalls, ContractCall } from "@usedapp/core";
import { utils, BigNumber } from "ethers";
import { ledgerAddress } from "../../fixtures/deployments";
import LedgerAbi from "@bluejay/contracts/abi/Ledger.json";
import SavingsAccountAbi from "@bluejay/contracts/abi/SavingsAccount.json";
import { exp } from "../../utils/number";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedContractCalls<T extends any[][]> =
  | {
      state: "RESOLVED";
      result: T;
    }
  | {
      state: "UNRESOLVED";
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useTypedContractCalls = <T extends any[][]>(calls: ContractCall[]): TypedContractCalls<T> => {
  const results = useContractCalls(calls);

  if (results.every((r) => !r)) {
    return { state: "UNRESOLVED" };
  } else {
    return { state: "RESOLVED", result: results as T };
  }
};

export const useVaultDetails = ({ proxy, collateralType }: { proxy: string; collateralType: string }) => {
  const states = useTypedContractCalls<
    [[BigNumber], [BigNumber], [BigNumber, BigNumber], [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]]
  >([
    {
      abi: new utils.Interface(SavingsAccountAbi),
      address: savingsAccountAddress,
      method: "updateAccumulatedRate",
      args: [],
    },
    {
      abi: new utils.Interface(SavingsAccountAbi),
      address: savingsAccountAddress,
      method: "savings",
      args: [proxy],
    },
    {
      abi: new utils.Interface(LedgerAbi),
      address: ledgerAddress,
      method: "positions",
      args: [collateralType, proxy],
    },
    {
      abi: new utils.Interface(LedgerAbi),
      address: ledgerAddress,
      method: "collateralTypes",
      args: [collateralType],
    },
  ]);
  if (states.state === "RESOLVED") {
    const [
      [savingsRate],
      [normalizedSavings],
      [lockedCollateral, normalizedDebt],
      [totalNormalizedDebt, accumulatedRate, safetyPrice, debtCeiling, debtFloor],
    ] = states.result;
    const debt = normalizedDebt.mul(accumulatedRate).div(exp(27));
    const savings = normalizedSavings.mul(savingsRate).div(exp(27));
    return {
      states: "RESOLVED",
      debt,
      savingsRate,
      normalizedSavings,
      lockedCollateral,
      normalizedDebt,
      accumulatedRate,
      totalNormalizedDebt,
      safetyPrice,
      debtCeiling,
      debtFloor,
      savings,
    };
  }
  return { state: "UNRESOLVED" };
};

export const VaultDetailsContainer: FunctionComponent = () => {
  const { vaultAddr, stablecoinAddr } = useParams<{ vaultAddr: string; stablecoinAddr: string }>();
  const states = useVaultDetails({ proxy: vaultAddr, collateralType: collaterals[0].collateralType });
  console.log(states, stablecoinAddr);
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
