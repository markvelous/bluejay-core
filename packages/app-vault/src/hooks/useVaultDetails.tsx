import { savingsAccountAddress, ledgerAddress, oracleRelayerAddress, feesEngineAddress } from "../fixtures/deployments";
import { utils, BigNumber } from "ethers";
import LedgerAbi from "@bluejayfinance/contracts/abi/Ledger.json";
import OracleRelayerAbi from "@bluejayfinance/contracts/abi/OracleRelayer.json";
import FeesEngineAbi from "@bluejayfinance/contracts/abi/FeesEngine.json";
import SavingsAccountAbi from "@bluejayfinance/contracts/abi/SavingsAccount.json";
import { exp } from "../utils/number";
import { useTypedContractCalls } from "./utils";

export interface CollateralDetails {
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
}

interface ResolvedVaultDetails {
  state: "RESOLVED";
  savingsRate: BigNumber;
  normalizedSavings: BigNumber;
  savings: BigNumber;
  collaterals: {
    [collateralType: string]: CollateralDetails;
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
    {
      abi: new utils.Interface(FeesEngineAbi),
      address: feesEngineAddress,
      method: "globalStabilityFee",
      args: [],
    },
    // TODO global stability fee
    ...collateralStateCalls,
  ]);
  if (states.state === "RESOLVED") {
    const OFFSET_COLLATERALS = 3;
    const [[savingsRate], [normalizedSavings], [globalStabilityFee]] = states.result;
    const collaterals: {
      [collateralType: string]: CollateralDetails;
    } = {};
    collateralTypes.forEach((collateralType, index) => {
      const [lockedCollateral, normalizedDebt] = states.result[index * 4 + OFFSET_COLLATERALS];
      const [totalNormalizedDebt, accumulatedRate, safetyPrice, debtCeiling, debtFloor] =
        states.result[index * 4 + 1 + OFFSET_COLLATERALS];
      const [, collateralizationRatio] = states.result[index * 4 + 2 + OFFSET_COLLATERALS];
      const [collateralStabilityFee] = states.result[index * 4 + 3 + OFFSET_COLLATERALS];
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
