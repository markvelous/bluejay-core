import { useContractCalls, useContractCall, ContractCall } from "@usedapp/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedContractCalls<T extends any[][]> =
  | {
      state: "RESOLVED";
      result: T;
    }
  | {
      state: "UNRESOLVED";
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTypedContractCalls = <T extends any[][]>(calls: ContractCall[]): TypedContractCalls<T> => {
  const results = useContractCalls(calls);

  if (results.every((r) => !r)) {
    return { state: "UNRESOLVED" };
  } else {
    return { state: "RESOLVED", result: results as T };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedContractCall<T extends any[]> =
  | {
      state: "RESOLVED";
      result: T;
    }
  | {
      state: "UNRESOLVED";
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTypedContractCall = <T extends any[]>(call: ContractCall): TypedContractCall<T> => {
  const results = useContractCall(call);

  if (!results) {
    return { state: "UNRESOLVED" };
  } else {
    return { state: "RESOLVED", result: results as T };
  }
};

export const cleanErrorMessage = (message?: string): string | undefined => {
  if (!message) return message;
  const regex = /(Error: VM Exception while processing transaction: reverted with reason string ')+(.*)('$)+/;
  const res = regex.exec(message);
  return res?.length === 4 ? res[2] : message;
};
