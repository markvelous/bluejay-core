import React, { FunctionComponent } from "react";
import { useParams } from "react-router-dom";
import { useEthers, useContractFunction } from "@usedapp/core";
import DSProxyAbi from "@bluejay/contracts/abi/DSProxy.json";
import LedgerAbi from "@bluejay/contracts/abi/Ledger.json";
import OracleRelayerAbi from "@bluejay/contracts/abi/OracleRelayer.json";
import FeesEngineAbi from "@bluejay/contracts/abi/FeesEngine.json";
import ProxyHelperAbi from "@bluejay/contracts/abi/ProxyHelper.json";
import TokenAbi from "@bluejay/contracts/abi/IERC20.json";

import { Contract, BigNumber, utils, constants } from "ethers";

import {
  getCollateral,
  ledgerAddress,
  oracleRelayerAddress,
  feesEngineAddress,
  proxyHelperAddress,
  stablecoinJoinAddress,
  collateralJoinAddress,
} from "../../fixtures/deployments";
import { Layout } from "../Layout";
import { config } from "../../config";
import { switchNetwork } from "../../utils/metamask";
import { useTypedContractCalls } from "../../hooks/utils";
import { exp } from "../../utils/number";
import { Button } from "../Button/Button";
import { useContractFunctionCustom } from "../../hooks/useContractFunctionCustom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

interface StateWithQueryResults {
  proxyOwner: string;
  isProxyOwner: boolean;
  isGrantedAllowance: boolean;
  account: string;
  debt: BigNumber;
  lockedCollateral: BigNumber;
  normalizedDebt: BigNumber;
  accumulatedRate: BigNumber;
  safetyPrice: BigNumber;
  debtCeiling: BigNumber;
  debtFloor: BigNumber;
  stabilityFee: BigNumber;
  collateralizationRatio: BigNumber;
  globalStabilityFee: BigNumber;
  collateralBalance: BigNumber;
  collateralAllowance: BigNumber;
}

interface UnconnectedState {
  state: "UNCONNECTED";
  activateBrowserWallet: () => void;
}
interface WrongNetworkState {
  state: "WRONG_NETWORK";
  switchNetwork: () => void;
}
interface ErrorState {
  state: "ERROR";
}
interface PendingMulticallState {
  state: "PENDING_MULTICALL";
}
interface ReadyState extends StateWithQueryResults {
  state: "READY";
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  approveCollateralSpendByProxy: () => void;
}
interface PendingApprovalState extends StateWithQueryResults {
  state: "PENDING_APPROVAL";
}
interface PendingTransferState extends StateWithQueryResults {
  state: "PENDING_TRANSFER";
}
interface SuccessfulTransferState extends StateWithQueryResults {
  state: "TRANSFER_SUCCESS";
  transferCollateralAndDebt: (_collateralDelta: BigNumber, _debtDelta: BigNumber) => void;
  approveCollateralSpendByProxy: () => void;
}
type ManagerState =
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
  const { state: grantAllowanceState, send: sendGrantAllowance } = useContractFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Contract(collateralAddress, TokenAbi) as any,
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
      abi: new utils.Interface(FeesEngineAbi),
      address: feesEngineAddress,
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
      abi: new utils.Interface(TokenAbi),
      address: collateralAddress,
      method: "balanceOf",
      args: [account],
    },
    {
      abi: new utils.Interface(TokenAbi),
      address: collateralAddress,
      method: "allowance",
      args: [account, vaultAddr],
    },
  ]);

  const approveCollateralSpendByProxy = (): void => {
    sendGrantAllowance(vaultAddr, constants.MaxUint256);
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
    [stabilityFee],
    [globalStabilityFee],
    [collateralBalance],
    [collateralAllowance],
  ] = queries.result;
  const debt = normalizedDebt.mul(accumulatedRate).div(exp(27));
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
    stabilityFee,
    collateralizationRatio,
    globalStabilityFee,
    collateralBalance,
    collateralAllowance,
    isProxyOwner: proxyOwner.toLowerCase() === account.toLowerCase(),
    isGrantedAllowance: collateralAllowance.gt(exp(27)),
  };

  if (grantAllowanceState.status === "Mining") {
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
    };
  }
  if (grantAllowanceState.status === "Fail" || transferCollateralAndDebtState.status === "Fail") {
    return { state: "ERROR" };
  }
  return {
    ...queryResult,
    state: "READY",
    transferCollateralAndDebt,
    approveCollateralSpendByProxy,
  };
};

export const VaultPositionManagerContainer: FunctionComponent = () => {
  const { vaultAddr, collateralType } = useParams<{ vaultAddr: string; collateralType: string }>();
  const collateral = getCollateral(collateralType);
  const positionManagerState = usePositionManager({ vaultAddr, collateral });
  if (!collateral) return null;

  const mint = (): void => {
    if (positionManagerState.state !== "READY") return;
    positionManagerState.transferCollateralAndDebt(exp(18).mul(1000), exp(18).mul(100000));
  };
  return (
    <Layout>
      <div className="pt-10 bg-blue-600 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <h1>Position Manager</h1>
        <div>Vault: {vaultAddr}</div>
        <div>Collateral: {collateral.name}</div>
        <Button
          onClick={() => {
            if (positionManagerState.state == "READY") positionManagerState.approveCollateralSpendByProxy();
          }}
        >
          Approve
        </Button>
        <Button onClick={mint}>Mint</Button>
      </div>
    </Layout>
  );
};
