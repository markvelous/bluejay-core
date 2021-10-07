import { useEthers, useContractFunction } from "@usedapp/core";
import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import LedgerAbi from "@bluejayfinance/contracts/abi/Ledger.json";
import OracleRelayerAbi from "@bluejayfinance/contracts/abi/OracleRelayer.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";
import TokenAbi from "@bluejayfinance/contracts/abi/IERC20.json";
import HelperAbi from "@bluejayfinance/contracts/abi/Helper.json";

import { Contract, BigNumber, utils, constants } from "ethers";

import {
  ledgerAddress,
  oracleRelayerAddress,
  feesEngineAddress,
  proxyHelperAddress,
  stablecoinJoinAddress,
  collateralJoinAddress,
  helperAddress,
  stablecoinAddress,
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
  isGrantedCollateralAllowance: boolean;
  isGrantedStablecoinAllowance: boolean;
  account: string;
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
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
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
  approveCollateralSpendByProxy: () => void;
  approveStablecoinSpendByProxy: () => void;
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

export const usePositionManager = ({
  vaultAddr,
  collateral: { address: collateralAddress, collateralType } = {
    address: constants.AddressZero,
    collateralType: constants.HashZero,
    name: "",
  },
}: {
  vaultAddr: string;
  collateral?: { name: string; address: string; collateralType: string };
}): ManagerState => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxyContract = new Contract(vaultAddr, DSProxyAbi) as any;

  const { account, chainId, activateBrowserWallet } = useEthers();
  const { state: transferCollateralAndDebtState, send: sendTransferCollateralAndDebt } = useContractFunctionCustom(
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
      args: [account],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "balanceOf",
      args: [account],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: collateralAddress,
      method: "allowance",
      args: [account, vaultAddr],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: stablecoinAddress,
      method: "allowance",
      args: [account, vaultAddr],
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
  const positionCollateralizationRatio = lockedCollateral.mul(oraclePrice).div(debt);
  const queryResult = {
    proxyOwner,
    account,
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
    isProxyOwner: proxyOwner.toLowerCase() === account.toLowerCase(),
    isGrantedCollateralAllowance: collateralAllowance.gt(exp(27)),
    isGrantedStablecoinAllowance: stablecoinAllowance.gt(exp(27)),
  };

  if (approvalForCollateralState.status === "Mining" || approvalForStablecoinState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_APPROVAL",
    };
  }
  if (transferCollateralAndDebtState.status === "Mining") {
    return {
      ...queryResult,
      state: "PENDING_TRANSFER",
    };
  }
  if (transferCollateralAndDebtState.status === "Success") {
    return {
      ...queryResult,
      state: "TRANSFER_SUCCESS",
      transferCollateralAndDebt,
      approveCollateralSpendByProxy,
      approveStablecoinSpendByProxy,
    };
  }
  if (
    approvalForCollateralState.status === "Fail" ||
    transferCollateralAndDebtState.status === "Fail" ||
    approvalForStablecoinState.status === "Fail"
  ) {
    return { state: "ERROR" };
  }
  return {
    ...queryResult,
    state: "READY",
    transferCollateralAndDebt,
    approveCollateralSpendByProxy,
    approveStablecoinSpendByProxy,
  };
};
