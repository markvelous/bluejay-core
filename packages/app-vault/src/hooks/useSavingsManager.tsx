import { useEthers, useContractFunction } from "@usedapp/core";
import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import HelperAbi from "@bluejayfinance/contracts/abi/Helper.json";
import SavingsAccountAbi from "@bluejayfinance/contracts/abi/SavingsAccount.json";
import TokenAbi from "@bluejayfinance/contracts/abi/IERC20.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";

import { Contract, BigNumber, utils, constants } from "ethers";

import {
  helperAddress,
  stablecoinAddress,
  stablecoinJoinAddress,
  savingsAccountAddress,
  proxyHelperAddress,
} from "../fixtures/deployments";
import { config } from "../config";
import { switchNetwork } from "../utils/metamask";
import { useTypedContractCalls } from "./utils";
import { exp } from "../utils/number";
import { useContractFunctionCustom } from "./useContractFunctionCustom";

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
}

export interface UnconnectedState {
  state: "UNCONNECTED";
  activateBrowserWallet: () => void;
}
export interface WrongNetworkState {
  state: "WRONG_NETWORK";
  switchNetwork: () => void;
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
  | UnconnectedState
  | WrongNetworkState
  | ErrorState
  | ReadyState
  | PendingApprovalState
  | PendingTransferState
  | SuccessfulTransferState
  | PendingMulticallState;

export const useSavingsManager = ({ vaultAddr }: { vaultAddr: string }): ManagerState => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxyContract = new Contract(vaultAddr, DSProxyAbi) as any;

  const { account, chainId, activateBrowserWallet } = useEthers();
  const { state: transferSavingsState, send: sendTransferSavings } = useContractFunctionCustom(
    proxyContract,
    "execute(address,bytes)"
  );
  const { state: approvalForStablecoinState, send: sendApprovalForStablecoin } = useContractFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Contract(stablecoinAddress, TokenAbi) as any,
    "approve"
  );
  const queries = useTypedContractCalls<[[string], [BigNumber], [BigNumber], [BigNumber], [BigNumber]]>([
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
      args: [account, vaultAddr],
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

  if (!account) {
    return {
      state: "UNCONNECTED",
      activateBrowserWallet,
    };
  }

  if (chainId !== config.network.chainId) {
    return { state: "WRONG_NETWORK", switchNetwork };
  }

  if (queries.state != "RESOLVED" || !multicallResolved || !account) {
    return { state: "PENDING_MULTICALL" };
  }

  const [[proxyOwner], [normalizedSavings], [accumulatedSavingsRate], [annualSavingsRate], [stablecoinAllowance]] =
    queries.result;
  const savings = normalizedSavings.mul(accumulatedSavingsRate).div(exp(27));
  const queryResult = {
    proxyOwner,
    isProxyOwner: proxyOwner.toLowerCase() === account.toLowerCase(),
    isGrantedStablecoinAllowance: stablecoinAllowance.gt(exp(27)),
    normalizedSavings,
    accumulatedSavingsRate,
    annualSavingsRate,
    savings,
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
