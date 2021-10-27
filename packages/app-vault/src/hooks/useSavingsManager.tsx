import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import HelperAbi from "@bluejayfinance/contracts/abi/Helper.json";
import TokenAbi from "@bluejayfinance/contracts/abi/IERC20.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";
import SavingsAccountAbi from "@bluejayfinance/contracts/abi/SavingsAccount.json";
import { useContractFunction } from "@usedapp/core";
import { BigNumber, constants, Contract, utils } from "ethers";
import {
  helperAddress,
  proxyHelperAddress,
  savingsAccountAddress,
  stablecoinAddress,
  stablecoinJoinAddress,
} from "../fixtures/deployments";
import { exp } from "../utils/number";
import { useTypedContractCalls } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

export interface StateWithQueryResults {
  proxyOwner: string;
  isProxyOwner: boolean;
  isGrantedStablecoinAllowance: boolean;
  normalizedSavings: BigNumber;
  accumulatedSavingsRate: BigNumber;
  annualSavingsRate: BigNumber;
  savings: BigNumber;
  walletStablecoinBalance: BigNumber;
}
export interface ErrorState {
  state: "ERROR";
}
export interface PendingMulticallState {
  state: "PENDING_MULTICALL";
}
export interface ReadyState extends StateWithQueryResults {
  state: "READY";
  approveStablecoinSpendByProxy: () => void;
  transferSavings: (_debtDelta: BigNumber) => void;
}
export interface PendingApprovalState extends StateWithQueryResults {
  state: "PENDING_APPROVAL";
}
export interface PendingTransferState extends StateWithQueryResults {
  state: "PENDING_TRANSFER";
}
export interface SuccessfulTransferState extends StateWithQueryResults {
  state: "TRANSFER_SUCCESS";
  approveStablecoinSpendByProxy: () => void;
  transferSavings: (_debtDelta: BigNumber) => void;
}

export type ReadyManagerStates = ReadyState | PendingApprovalState | PendingTransferState | SuccessfulTransferState;
export type ManagerState =
  | ErrorState
  | ReadyState
  | PendingApprovalState
  | PendingTransferState
  | SuccessfulTransferState
  | PendingMulticallState;

export const hasQueryResults = (state: ManagerState): state is ReadyManagerStates => {
  return ["READY", "PENDING_APPROVAL", "PENDING_TRANSFER", "TRANSFER_SUCCESS"].includes(state.state);
};

export const useSavingsManager = ({ vaultAddr, userAddr }: { vaultAddr: string; userAddr: string }): ManagerState => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxyContract = new Contract(vaultAddr, DSProxyAbi) as any;

  const { state: transferSavingsState, send: sendTransferSavings } = useContractFunction(
    proxyContract,
    "execute(address,bytes)"
  );
  const { state: approvalForStablecoinState, send: sendApprovalForStablecoin } = useContractFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Contract(stablecoinAddress, TokenAbi) as any,
    "approve"
  );
  const queries = useTypedContractCalls<[[string], [BigNumber], [BigNumber], [BigNumber], [BigNumber], [BigNumber]]>([
    {
      abi: new utils.Interface(DSProxyAbi),
      address: vaultAddr,
      method: "owner",
      args: [],
    },
    {
      abi: new utils.Interface(SavingsAccountAbi),
      address: savingsAccountAddress,
      method: "savings",
      args: [vaultAddr],
    },
    {
      abi: new utils.Interface(SavingsAccountAbi),
      address: savingsAccountAddress,
      method: "updateAccumulatedRate",
      args: [],
    },
    {
      abi: new utils.Interface(HelperAbi),
      address: helperAddress,
      method: "getSavingsRate",
      args: [savingsAccountAddress, 365 * 24 * 60 * 60],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "allowance",
      args: [userAddr, vaultAddr],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "balanceOf",
      args: [userAddr],
    },
  ]);

  const approveStablecoinSpendByProxy = (): void => {
    sendApprovalForStablecoin(vaultAddr, constants.MaxUint256);
  };
  const transferSavings = async (debtDelta: BigNumber): Promise<void> => {
    const tx = await ProxyHelperContract.populateTransaction.transferSavings(
      savingsAccountAddress,
      stablecoinJoinAddress,
      debtDelta
    );
    sendTransferSavings(proxyHelperAddress, tx.data);
  };

  const multicallResolved = queries.state == "RESOLVED" && queries.result.every((r) => !!r);

  if (queries.state != "RESOLVED" || !multicallResolved) {
    return { state: "PENDING_MULTICALL" };
  }

  const [
    [proxyOwner],
    [normalizedSavings],
    [accumulatedSavingsRate],
    [annualSavingsRate],
    [stablecoinAllowance],
    [walletStablecoinBalance],
  ] = queries.result;
  const savings = normalizedSavings.mul(accumulatedSavingsRate).div(exp(27));
  const queryResult = {
    proxyOwner,
    isProxyOwner: proxyOwner.toLowerCase() === userAddr.toLowerCase(),
    isGrantedStablecoinAllowance: stablecoinAllowance.gt(exp(27)),
    normalizedSavings,
    accumulatedSavingsRate,
    annualSavingsRate,
    savings,
    walletStablecoinBalance,
  };

  if (approvalForStablecoinState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_APPROVAL",
    };
  }

  if (transferSavingsState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_TRANSFER",
    };
  }

  if (transferSavingsState.status === "Success") {
    return {
      ...queryResult,
      state: "TRANSFER_SUCCESS",
      approveStablecoinSpendByProxy,
      transferSavings,
    };
  }

  return {
    ...queryResult,
    state: "READY",
    approveStablecoinSpendByProxy,
    transferSavings,
  };
};
