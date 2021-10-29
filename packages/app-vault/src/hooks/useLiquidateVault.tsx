import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";
import { useContractFunction } from "@usedapp/core";
import { constants, Contract } from "ethers";
import { useUserContext } from "../context/UserContext";
import { liquidationEngineAddress, proxyHelperAddress, stablecoinJoinAddress } from "../fixtures/deployments";
import { cleanErrorMessage } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProxyHelperContract = new Contract(proxyHelperAddress, ProxyHelperAbi) as any;

type NotReadyState = {
  state: "NOT_READY";
};

type PendingLiquidationState = {
  state: "PENDING";
};

type LiquidationSuccessState = {
  state: "SUCCESS";
  liquidateVault: (_vault: string) => void;
};

type ReadyState = {
  state: "READY";
  liquidateVault: (_vault: string) => void;
};

type ErrorState = {
  state: "ERROR";
  errorMessage?: string;
  liquidateVault: (_vault: string) => void;
};

type NoProxyState = {
  state: "NO_PROXY";
  deployVault: () => void;
};

type DeployingProxyState = {
  state: "DEPLOYING_PROXY";
};

export type LiquidationState =
  | NotReadyState
  | PendingLiquidationState
  | LiquidationSuccessState
  | ReadyState
  | NoProxyState
  | DeployingProxyState
  | ErrorState;

export const useLiquidateVault = ({
  collateral: { collateralType } = {
    address: constants.AddressZero,
    collateralType: constants.HashZero,
    name: "",
  },
}: {
  collateral?: { name: string; address: string; collateralType: string };
}): LiquidationState => {
  const userContext = useUserContext();
  const proxyContract = new Contract(
    userContext.state === "READY" ? userContext.proxyAddress : constants.AddressZero,
    DSProxyAbi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  const { state: liquidationState, send: sendLiquidation } = useContractFunction(
    proxyContract,
    "execute(address,bytes)"
  );
  if (userContext.state == "PROXY_UNDEPLOYED") return { state: "NO_PROXY", deployVault: userContext.deployVault };
  if (userContext.state == "DEPLOYING_PROXY") return { state: "DEPLOYING_PROXY" };
  if (userContext.state != "READY") return { state: "NOT_READY" };

  const liquidateVault = async (vaultToLiquidate: string): Promise<void> => {
    const tx = await ProxyHelperContract.populateTransaction.liquidatePosition(
      collateralType,
      vaultToLiquidate,
      liquidationEngineAddress,
      stablecoinJoinAddress
    );
    sendLiquidation(proxyHelperAddress, tx.data);
  };

  if (liquidationState.status === "Mining") {
    return { state: "PENDING" };
  }

  if (liquidationState.status === "Success") {
    return { state: "SUCCESS", liquidateVault };
  }

  if (liquidationState.status === "Fail" || liquidationState.status == "Exception") {
    return { state: "ERROR", liquidateVault, errorMessage: cleanErrorMessage(liquidationState.errorMessage) };
  }

  return { state: "READY", liquidateVault };
};
