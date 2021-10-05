import { useEthers, useContractFunction, ContractCall, useContractCall } from "@usedapp/core";
import SimpleCollateralAbi from "@bluejay/contracts/abi/SimpleCollateral.json";
import { BigNumber, Contract, utils } from "ethers";
import { config } from "../config";
import { collateralFaucetAddress } from "../fixtures/deployments";
import { exp } from "../utils/number";
import { switchNetwork } from "../utils/metamask";

const SUPPORTED_NETWORK = ["local", "development", "staging"];
const hasFaucet = SUPPORTED_NETWORK.includes(config.environment);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const faucetContract = new Contract(collateralFaucetAddress, SimpleCollateralAbi) as any;

// type States = "UNCONNECTED" | "WRONG_NETWORK" | "FETCHING_VAULT" | "VAULT_FOUND" | "VAULT_MISSING" | "DEPLOYING_VAULT";
interface UnconnectedState {
  state: "UNCONNECTED";
  activateBrowserWallet: () => void;
}
interface WrongNetworkState {
  state: "WRONG_NETWORK";
  switchNetwork: () => void;
}
interface UnsupportedFaucetState {
  state: "UNSUPPORTED_FAUCET";
}
interface ErrorState {
  state: "ERROR";
}
interface PendingState {
  state: "PENDING";
  account: string;
  hash: string;
}
interface ReadyState {
  state: "READY";
  account: string;
  balance: BigNumber;
  mintToken: (_amount: number) => void;
}
interface SuccessState {
  state: "SUCCESS";
  account: string;
  hash: string;
}

type VaultState =
  | UnconnectedState
  | WrongNetworkState
  | ErrorState
  | UnsupportedFaucetState
  | ReadyState
  | SuccessState
  | PendingState;

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

export const useCollateralFaucet = (): VaultState => {
  const { account, chainId, activateBrowserWallet } = useEthers();
  const { state: faucetMint, send } = useContractFunction(faucetContract, "mint");
  const balanceState = useTypedContractCall<[BigNumber]>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: new utils.Interface(SimpleCollateralAbi),
    address: collateralFaucetAddress,
    method: "balanceOf",
    args: [account],
  });
  const mintToken = (amount: number): void => {
    if (!account) throw new Error("Account not found");
    send(account, exp(18).mul(amount));
  };

  switch (true) {
    case !hasFaucet:
      return { state: "UNSUPPORTED_FAUCET" };

    case !account:
      return {
        state: "UNCONNECTED",
        activateBrowserWallet,
      };

    case chainId !== config.network.chainId:
      return { state: "WRONG_NETWORK", switchNetwork };

    case !!account && balanceState.state === "RESOLVED":
      if (!account) throw new Error("Account not found");
      if (balanceState.state !== "RESOLVED") throw new Error("Account not found");
      return { state: "READY", account, mintToken, balance: balanceState.result[0] };

    case faucetMint.status == "Success":
      if (!account) throw new Error("Account not found");
      if (!faucetMint.transaction) throw new Error("Deploy transaction not found");
      return { state: "SUCCESS", account, hash: faucetMint.transaction.hash };

    case faucetMint.status == "Mining":
      if (!account) throw new Error("Account not found");
      if (!faucetMint.transaction) throw new Error("Deploy transaction not found");
      return { state: "PENDING", account, hash: faucetMint.transaction.hash };

    default:
      return { state: "ERROR" };
  }
};
