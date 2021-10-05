import React, { FunctionComponent } from "react";
import { Button } from "../Button/Button";
import { Link } from "react-router-dom";
import { Layout } from "../Layout";
import {
  collaterals,
  getCollateral,
  savingsAccountAddress,
  ledgerAddress,
  oracleRelayerAddress,
  feesEngineAddress,
} from "../../fixtures/deployments";
import { useParams } from "react-router-dom";
import { useContractCalls, ContractCall } from "@usedapp/core";
import { utils, BigNumber } from "ethers";
import LedgerAbi from "@bluejay/contracts/abi/Ledger.json";
import OracleRelayerAbi from "@bluejay/contracts/abi/OracleRelayer.json";
import FeesEngineAbi from "@bluejay/contracts/abi/FeesEngine.json";
import SavingsAccountAbi from "@bluejay/contracts/abi/SavingsAccount.json";
import { bnToNum, exp } from "../../utils/number";

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

interface ResolvedVaultDetails {
  state: "RESOLVED";
  savingsRate: BigNumber;
  normalizedSavings: BigNumber;
  savings: BigNumber;
  collaterals: {
    [collateralType: string]: {
      debt: BigNumber;
      lockedCollateral: BigNumber;
      normalizedDebt: BigNumber;
      totalNormalizedDebt: BigNumber;
      accumulatedRate: BigNumber;
      safetyPrice: BigNumber;
      debtCeiling: BigNumber;
      debtFloor: BigNumber;
      collateralizationRatio: BigNumber;
      oraclePrice: BigNumber;
      stabilityFee: BigNumber;
      globalStabilityFee: BigNumber;
      collateralStabilityFee: BigNumber;
    };
  };
}
interface UnresolvedVaultDetails {
  state: "UNRESOLVED";
}

export const useVaultDetails = ({
  proxy,
  collateralTypes,
}: {
  proxy: string;
  collateralTypes: string[];
}): UnresolvedVaultDetails | ResolvedVaultDetails => {
  const collateralStateCalls = collateralTypes.reduce((acc, collateralType) => {
    return [
      ...acc,
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
      {
        abi: new utils.Interface(OracleRelayerAbi),
        address: oracleRelayerAddress,
        method: "collateralTypes",
        args: [collateralType],
      },
      {
        abi: new utils.Interface(FeesEngineAbi),
        address: feesEngineAddress,
        method: "globalStabilityFee",
        args: [],
      },
      {
        abi: new utils.Interface(FeesEngineAbi),
        address: feesEngineAddress,
        method: "collateralTypes",
        args: [collateralType],
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [] as { abi: utils.Interface; address: string; method: string; args: any[] }[]);
  const states = useTypedContractCalls<BigNumber[][]>([
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
    // TODO global stability fee
    ...collateralStateCalls,
  ]);
  if (states.state === "RESOLVED") {
    const OFFSET_COLLATERALS = 2;
    const [[savingsRate], [normalizedSavings]] = states.result;
    const collaterals: {
      [collateralType: string]: {
        debt: BigNumber;
        lockedCollateral: BigNumber;
        normalizedDebt: BigNumber;
        totalNormalizedDebt: BigNumber;
        accumulatedRate: BigNumber;
        safetyPrice: BigNumber;
        debtCeiling: BigNumber;
        debtFloor: BigNumber;
        collateralizationRatio: BigNumber;
        oraclePrice: BigNumber;
        stabilityFee: BigNumber;
        globalStabilityFee: BigNumber;
        collateralStabilityFee: BigNumber;
      };
    } = {};
    collateralTypes.forEach((collateralType, index) => {
      const [lockedCollateral, normalizedDebt] = states.result[index * 5 + OFFSET_COLLATERALS];
      const [totalNormalizedDebt, accumulatedRate, safetyPrice, debtCeiling, debtFloor] =
        states.result[index * 5 + 1 + OFFSET_COLLATERALS];
      const [, collateralizationRatio] = states.result[index * 5 + 2 + OFFSET_COLLATERALS];
      const [globalStabilityFee] = states.result[index * 5 + 3 + OFFSET_COLLATERALS];
      const [collateralStabilityFee] = states.result[index * 5 + 4 + OFFSET_COLLATERALS];
      const debt = normalizedDebt.mul(accumulatedRate).div(exp(27));
      const oraclePrice = safetyPrice.mul(collateralizationRatio).div(exp(27));
      const stabilityFee = collateralStabilityFee.add(globalStabilityFee);
      collaterals[collateralType] = {
        debt,
        stabilityFee,
        globalStabilityFee,
        collateralStabilityFee,
        collateralizationRatio,
        lockedCollateral,
        normalizedDebt,
        totalNormalizedDebt,
        accumulatedRate,
        safetyPrice,
        debtCeiling,
        debtFloor,
        oraclePrice,
      };
    });
    const savings = normalizedSavings.mul(savingsRate).div(exp(27));
    return {
      state: "RESOLVED",
      savingsRate,
      normalizedSavings,
      savings,
      collaterals,
    };
  }
  return { state: "UNRESOLVED" };
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
        <div>
          <div>
            <div>
              <h2>Total Savings</h2>
              <div>{savings.toString()}</div>
            </div>
            <div>
              <h2>Total Debt</h2>
              <div>{totalDebt.toString()}</div>
            </div>
          </div>
          <div>
            <h2 className="pt-6 pb-4">Collaterals</h2>
            <div>
              {collaterals &&
                Object.keys(collaterals).map((collateralType) => {
                  const { debt, lockedCollateral, collateralizationRatio, oraclePrice } = collaterals[collateralType];
                  return (
                    <div key={collateralType}>
                      <h3>Collateral Type: {getCollateral(collateralType)?.name}</h3>
                      <div>
                        <div>
                          <div>
                            <h4>Debt</h4>
                            <div>{debt.toString()}</div>
                          </div>
                          <div>
                            <h4>Locked Collateral</h4>
                            <div>{lockedCollateral.toString()}</div>
                          </div>
                          <div>
                            <h4>Collateralization Ratio</h4>
                            <div>{bnToNum(collateralizationRatio, 27) * 100}%</div>
                          </div>
                          <div>
                            <h4>Oracle Price</h4>
                            <div>{bnToNum(oraclePrice, 27, 4)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
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
