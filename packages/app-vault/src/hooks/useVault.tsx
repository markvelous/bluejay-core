import { useEthers, useContractCall, ContractCall, useContractFunction } from "@usedapp/core";
import ProxyRegistryAbi from "@bluejay/contracts/abi/ProxyRegistry.json";
import { Contract, utils } from "ethers";
import { config } from "../config";
import { proxyRegistryAddress } from "../fixtures/deployments";
import { switchNetwork } from "../utils/metamask";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyRegistryContract = new Contract(proxyRegistryAddress, ProxyRegistryAbi) as any;

// type States = "UNCONNECTED" | "WRONG_NETWORK" | "FETCHING_VAULT" | "VAULT_FOUND" | "VAULT_MISSING" | "DEPLOYING_VAULT";
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
interface FetchingVaultState {
  state: "FETCHING_VAULT";
  account: string;
}

interface VaultFoundState {
  state: "VAULT_FOUND";
  account: string;
  vault: string;
}

interface VaultMissingState {
  state: "VAULT_MISSING";
  deployVault: () => void;
  account: string;
}
interface DeployingVaultState {
  state: "DEPLOYING_VAULT";
  hash: string;
  account: string;
}
type VaultState =
  | UnconnectedState
  | WrongNetworkState
  | FetchingVaultState
  | VaultFoundState
  | VaultMissingState
  | ErrorState
  | DeployingVaultState;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedContractCall<T extends any[]> =
  | {
      state: "RESOLVED";
      result: T;
    }
  | {
      state: "UNRESOLVED";
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useTypedContractCall = <T extends any[]>(call: ContractCall): TypedContractCall<T> => {
  const results = useContractCall(call);

  if (!results) {
    return { state: "UNRESOLVED" };
  } else {
    return { state: "RESOLVED", result: results as T };
  }
};

export const useVault = (): VaultState => {
  const { account, chainId, activateBrowserWallet } = useEthers();
  const { state: deployingState, send } = useContractFunction(proxyRegistryContract, "build()");
  const proxyState = useTypedContractCall<[string]>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: new utils.Interface(ProxyRegistryAbi),
    address: proxyRegistryAddress,
    method: "proxies",
    args: [account],
  });
  const deployVault = (): Promise<void> => send();

  switch (true) {
    case !account:
      return {
        state: "UNCONNECTED",
        activateBrowserWallet,
      };
    case chainId !== config.network.chainId:
      return { state: "WRONG_NETWORK", switchNetwork };
    case proxyState.state === "UNRESOLVED" && account:
      if (!account) throw new Error("Account not found");
      return { state: "FETCHING_VAULT", account };
    case deployingState.status == "Mining":
      if (!account) throw new Error("Account not found");
      if (!deployingState.transaction) throw new Error("Deploy transaction not found");
      return { state: "DEPLOYING_VAULT", account, hash: deployingState.transaction.hash };
    case proxyState.state === "RESOLVED" && proxyState.result[0] === "0x0000000000000000000000000000000000000000":
      if (!account) throw new Error("Account not found");
      return { state: "VAULT_MISSING", account, deployVault };
    case proxyState.state === "RESOLVED" && proxyState.result[0] != "0x0000000000000000000000000000000000000000":
      if (!account) throw new Error("Account not found");
      if (proxyState.state !== "RESOLVED") throw new Error("ProxyState not resolved");
      return { state: "VAULT_FOUND", account, vault: proxyState.result[0] };
    default:
      return { state: "ERROR" };
  }
};
