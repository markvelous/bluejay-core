import DSProxyAbi from "@bluejayfinance/contracts/abi/DSProxy.json";
import ProxyHelperAbi from "@bluejayfinance/contracts/abi/ProxyHelper.json";

import { Contract, constants } from "ethers";

import { proxyHelperAddress, stablecoinJoinAddress, liquidationEngineAddress } from "../fixtures/deployments";
import { useContractFunctionCustom } from "./useContractFunctionCustom";
import { useVault } from "./useVault";

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
  liquidateVault: (_vault: string) => void;
};

type LiquidationState = NotReadyState | PendingLiquidationState | LiquidationSuccessState | ReadyState | ErrorState;

export const useLiquidateVault = ({
  collateral: { collateralType } = {
    address: constants.AddressZero,
    collateralType: constants.HashZero,
    name: "",
  },
}: {
  collateral?: { name: string; address: string; collateralType: string };
}): LiquidationState => {
  const vaultState = useVault();
  const proxyContract = new Contract(
    vaultState.state === "VAULT_FOUND" ? vaultState.vault : constants.AddressZero,
    DSProxyAbi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  const { state: liquidationState, send: sendLiquidation } = useContractFunctionCustom(
    proxyContract,
    "execute(address,bytes)"
  );

  if (vaultState.state != "VAULT_FOUND") return { state: "NOT_READY" };
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
    return { state: "ERROR", liquidateVault };
  }

  return { state: "READY", liquidateVault };
};
