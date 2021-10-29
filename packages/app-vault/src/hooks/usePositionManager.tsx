import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import HelperAbi from "@bluejayfinance/contracts/abi/Helper.json";
import TokenAbi from "@bluejayfinance/contracts/abi/IERC20.json";
import LedgerAbi from "@bluejayfinance/contracts/abi/Ledger.json";
import OracleRelayerAbi from "@bluejayfinance/contracts/abi/OracleRelayer.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";
import { useContractFunction } from "@usedapp/core";
import { BigNumber, constants, Contract, utils } from "ethers";
import {
  collateralJoinAddress,
  feesEngineAddress,
  helperAddress,
  ledgerAddress,
  oracleRelayerAddress,
  proxyHelperAddress,
  stablecoinAddress,
  stablecoinJoinAddress,
} from "../fixtures/deployments";
import { exp } from "../utils/number";
import { cleanErrorMessage, useTypedContractCalls } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

export interface StateWithQueryResults {
  proxyOwner: string;
  isProxyOwner: boolean;
  isGrantedCollateralAllowance: boolean;
  isGrantedStablecoinAllowance: boolean;
  debt: BigNumber;
  lockedCollateral: BigNumber;
  normalizedDebt: BigNumber;
  accumulatedRate: BigNumber;
  safetyPrice: BigNumber;
  debtCeiling: BigNumber;
  debtFloor: BigNumber;
  collateralizationRatio: BigNumber;
  collateralBalance: BigNumber;
  collateralAllowance: BigNumber;
  annualStabilityFee: BigNumber;
  stablecoinBalance: BigNumber;
  oraclePrice: BigNumber;
  stablecoinAllowance: BigNumber;
  positionCollateralizationRatio: BigNumber;
}

export interface PendingMulticallState {
  state: "PENDING_MULTICALL";
}
export interface ReadyState extends StateWithQueryResults {
  state: "READY";
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  closePosition: () => void;
  approveCollateralSpendByProxy: () => void;
  approveStablecoinSpendByProxy: () => void;
}

export interface ErrorState extends StateWithQueryResults {
  state: "ERROR_READY";
  errorMessage?: string;
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  closePosition: () => void;
  approveCollateralSpendByProxy: () => void;
  approveStablecoinSpendByProxy: () => void;
}
export interface PendingApprovalState extends StateWithQueryResults {
  state: "PENDING_APPROVAL";
}
export interface PendingTransferState extends StateWithQueryResults {
  state: "PENDING_TRANSFER";
}
export interface SuccessfulTransferState extends StateWithQueryResults {
  state: "TRANSFER_SUCCESS";
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  closePosition: () => void;
  approveCollateralSpendByProxy: () => void;
  approveStablecoinSpendByProxy: () => void;
}
export type ReadyManagerStates =
  | ReadyState
  | PendingApprovalState
  | PendingTransferState
  | SuccessfulTransferState
  | ErrorState;
export type ManagerState =
  | ErrorState
  | ReadyState
  | PendingApprovalState
  | PendingTransferState
  | SuccessfulTransferState
  | PendingMulticallState;

export const usePositionManager = ({
  userAddr,
  vaultAddr,
  collateral: { address: collateralAddress, collateralType } = {
    address: constants.AddressZero,
    collateralType: constants.HashZero,
    name: "",
  },
}: {
  userAddr: string;
  vaultAddr: string;
  collateral?: { name: string; address: string; collateralType: string };
}): ManagerState => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxyContract = new Contract(vaultAddr, DSProxyAbi) as any;

  const { state: transferCollateralAndDebtState, send: sendTransferCollateralAndDebt } = useContractFunction(
    proxyContract,
    "execute(address,bytes)"
  );
  const { state: closePositionState, send: sendClosePosition } = useContractFunction(
    proxyContract,
    "execute(address,bytes)"
  );
  const { state: approvalForCollateralState, send: sendApprovalForCollateral } = useContractFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Contract(collateralAddress, TokenAbi) as any,
    "approve"
  );
  const { state: approvalForStablecoinState, send: sendApprovalForStablecoin } = useContractFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Contract(stablecoinAddress, TokenAbi) as any,
    "approve"
  );
  const queries = useTypedContractCalls<
    [
      [string],
      [BigNumber, BigNumber],
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber],
      [string, BigNumber],
      [BigNumber, BigNumber],
      [BigNumber],
      [BigNumber],
      [BigNumber],
      [BigNumber]
    ]
  >([
    {
      abi: new utils.Interface(DSProxyAbi),
      address: vaultAddr,
      method: "owner",
      args: [],
    },
    {
      abi: new utils.Interface(LedgerAbi),
      address: ledgerAddress,
      method: "positions",
      args: [collateralType, vaultAddr],
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
      abi: new utils.Interface(TokenAbi),
      address: collateralAddress,
      method: "balanceOf",
      args: [userAddr],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "balanceOf",
      args: [userAddr],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: collateralAddress,
      method: "allowance",
      args: [userAddr, vaultAddr],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "allowance",
      args: [userAddr, vaultAddr],
    },
    {
      abi: new utils.Interface(HelperAbi),
      address: helperAddress,
      method: "getStabilityFee",
      args: [feesEngineAddress, collateralType, 365 * 24 * 60 * 60],
    },
  ]);

  const approveCollateralSpendByProxy = (): void => {
    sendApprovalForCollateral(vaultAddr, constants.MaxUint256);
  };

  const approveStablecoinSpendByProxy = (): void => {
    sendApprovalForStablecoin(vaultAddr, constants.MaxUint256);
  };

  const transferCollateralAndDebt = async (collateralDelta: BigNumber, debtDelta: BigNumber): Promise<void> => {
    const tx = await ProxyHelperContract.populateTransaction.transferCollateralAndDebt(
      collateralType,
      ledgerAddress,
      stablecoinJoinAddress,
      collateralJoinAddress,
      collateralDelta,
      debtDelta
    );
    sendTransferCollateralAndDebt(proxyHelperAddress, tx.data);
  };

  const closePosition = async (): Promise<void> => {
    const tx = await ProxyHelperContract.populateTransaction.closePosition(
      collateralType,
      ledgerAddress,
      stablecoinJoinAddress,
      collateralJoinAddress
    );
    sendClosePosition(proxyHelperAddress, tx.data);
  };

  const multicallResolved = queries.state == "RESOLVED" && queries.result.every((r) => !!r);

  if (queries.state != "RESOLVED" || !multicallResolved) {
    return { state: "PENDING_MULTICALL" };
  }

  const [
    [proxyOwner],
    [lockedCollateral, normalizedDebt],
    [, accumulatedRate, safetyPrice, debtCeiling, debtFloor],
    [, collateralizationRatio],
    [collateralBalance],
    [stablecoinBalance],
    [collateralAllowance],
    [stablecoinAllowance],
    [annualStabilityFee],
  ] = queries.result;
  const debt = normalizedDebt.mul(accumulatedRate).div(exp(27));
  const oraclePrice = safetyPrice.mul(collateralizationRatio).div(exp(27));
  const positionCollateralizationRatio = debt.gt(0) ? lockedCollateral.mul(oraclePrice).div(debt) : BigNumber.from(0);
  const queryResult = {
    proxyOwner,
    debt,
    lockedCollateral,
    normalizedDebt,
    accumulatedRate,
    safetyPrice,
    debtCeiling,
    debtFloor,
    collateralizationRatio,
    collateralBalance,
    stablecoinBalance,
    collateralAllowance,
    stablecoinAllowance,
    annualStabilityFee,
    positionCollateralizationRatio,
    oraclePrice,
    isProxyOwner: proxyOwner.toLowerCase() === userAddr.toLowerCase(),
    isGrantedCollateralAllowance: collateralAllowance.gt(exp(27)),
    isGrantedStablecoinAllowance: stablecoinAllowance.gt(exp(27)),
  };

  if (approvalForCollateralState.status === "Mining" || approvalForStablecoinState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_APPROVAL",
    };
  }
  if (transferCollateralAndDebtState.status === "Mining" || closePositionState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_TRANSFER",
    };
  }
  if (transferCollateralAndDebtState.status === "Success") {
    return {
      ...queryResult,
      state: "TRANSFER_SUCCESS",
      closePosition,
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }
  if (approvalForCollateralState.status === "Fail" || approvalForCollateralState.status === "Exception") {
    return {
      state: "ERROR_READY",
      errorMessage: cleanErrorMessage(approvalForCollateralState.errorMessage),
      ...queryResult,
      closePosition,
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }
  if (transferCollateralAndDebtState.status === "Fail" || transferCollateralAndDebtState.status === "Exception") {
    return {
      state: "ERROR_READY",
      errorMessage: cleanErrorMessage(transferCollateralAndDebtState.errorMessage),
      ...queryResult,
      closePosition,
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }
  if (closePositionState.status === "Fail" || closePositionState.status === "Exception") {
    return {
      state: "ERROR_READY",
      errorMessage: cleanErrorMessage(closePositionState.errorMessage),
      ...queryResult,
      closePosition,
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }

  if (approvalForStablecoinState.status === "Fail" || approvalForStablecoinState.status === "Exception") {
    return {
      state: "ERROR_READY",
      errorMessage: cleanErrorMessage(approvalForStablecoinState.errorMessage),
      ...queryResult,
      closePosition,
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }
  return {
    ...queryResult,
    state: "READY",
    closePosition,
    transferCollateralAndDebt,
    approveCollateralSpendByProxy,
    approveStablecoinSpendByProxy,
  };
};
