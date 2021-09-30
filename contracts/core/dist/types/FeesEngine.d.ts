/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface FeesEngineInterface extends ethers.utils.Interface {
  functions: {
    "accountingEngine()": FunctionFragment;
    "authorizedAccounts(address)": FunctionFragment;
    "collateralTypes(bytes32)": FunctionFragment;
    "globalStabilityFee()": FunctionFragment;
    "grantAuthorization(address)": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "initializeCollateral(bytes32)": FunctionFragment;
    "ledger()": FunctionFragment;
    "revokeAuthorization(address)": FunctionFragment;
    "updateAccountingEngine(address)": FunctionFragment;
    "updateAccumulatedRate(bytes32)": FunctionFragment;
    "updateGlobalStabilityFee(uint256)": FunctionFragment;
    "updateStabilityFee(bytes32,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "accountingEngine",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "authorizedAccounts",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "collateralTypes",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "globalStabilityFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "grantAuthorization",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "initialize", values: [string]): string;
  encodeFunctionData(
    functionFragment: "initializeCollateral",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "ledger", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "revokeAuthorization",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAccountingEngine",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAccumulatedRate",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updateGlobalStabilityFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateStabilityFee",
    values: [BytesLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "accountingEngine",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "authorizedAccounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "collateralTypes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "globalStabilityFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "grantAuthorization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initializeCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ledger", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "revokeAuthorization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateAccountingEngine",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateAccumulatedRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateGlobalStabilityFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateStabilityFee",
    data: BytesLike
  ): Result;

  events: {
    "GrantAuthorization(address)": EventFragment;
    "RevokeAuthorization(address)": EventFragment;
    "UpdateAccumulatedRate(bytes32,uint256,int256,uint256)": EventFragment;
    "UpdateParameter(bytes32,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "GrantAuthorization"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RevokeAuthorization"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdateAccumulatedRate"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdateParameter"): EventFragment;
}

export type GrantAuthorizationEvent = TypedEvent<
  [string] & { account: string }
>;

export type RevokeAuthorizationEvent = TypedEvent<
  [string] & { account: string }
>;

export type UpdateAccumulatedRateEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber] & {
    collateralType: string;
    timestamp: BigNumber;
    accumulatedRateDelta: BigNumber;
    nextAccumulatedRate: BigNumber;
  }
>;

export type UpdateParameter_bytes32_uint256_Event = TypedEvent<
  [string, BigNumber] & { parameter: string; data: BigNumber }
>;

export type UpdateParameter_bytes32_address_Event = TypedEvent<
  [string, string] & { parameter: string; data: string }
>;

export type UpdateParameter_bytes32_bytes32_uint256_Event = TypedEvent<
  [string, string, BigNumber] & {
    parameter: string;
    collateralType: string;
    data: BigNumber;
  }
>;

export class FeesEngine extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: FeesEngineInterface;

  functions: {
    accountingEngine(overrides?: CallOverrides): Promise<[string]>;

    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    collateralTypes(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        stabilityFee: BigNumber;
        lastUpdated: BigNumber;
      }
    >;

    globalStabilityFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initialize(
      ledger_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initializeCollateral(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ledger(overrides?: CallOverrides): Promise<[string]>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateAccountingEngine(
      data: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateAccumulatedRate(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateGlobalStabilityFee(
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateStabilityFee(
      collateralType: BytesLike,
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  accountingEngine(overrides?: CallOverrides): Promise<string>;

  authorizedAccounts(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  collateralTypes(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { stabilityFee: BigNumber; lastUpdated: BigNumber }
  >;

  globalStabilityFee(overrides?: CallOverrides): Promise<BigNumber>;

  grantAuthorization(
    user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initialize(
    ledger_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initializeCollateral(
    collateralType: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ledger(overrides?: CallOverrides): Promise<string>;

  revokeAuthorization(
    user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateAccountingEngine(
    data: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateAccumulatedRate(
    collateralType: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateGlobalStabilityFee(
    data: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateStabilityFee(
    collateralType: BytesLike,
    data: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    accountingEngine(overrides?: CallOverrides): Promise<string>;

    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    collateralTypes(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        stabilityFee: BigNumber;
        lastUpdated: BigNumber;
      }
    >;

    globalStabilityFee(overrides?: CallOverrides): Promise<BigNumber>;

    grantAuthorization(user: string, overrides?: CallOverrides): Promise<void>;

    initialize(ledger_: string, overrides?: CallOverrides): Promise<void>;

    initializeCollateral(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    ledger(overrides?: CallOverrides): Promise<string>;

    revokeAuthorization(user: string, overrides?: CallOverrides): Promise<void>;

    updateAccountingEngine(
      data: string,
      overrides?: CallOverrides
    ): Promise<void>;

    updateAccumulatedRate(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateGlobalStabilityFee(
      data: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateStabilityFee(
      collateralType: BytesLike,
      data: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "GrantAuthorization(address)"(
      account?: string | null
    ): TypedEventFilter<[string], { account: string }>;

    GrantAuthorization(
      account?: string | null
    ): TypedEventFilter<[string], { account: string }>;

    "RevokeAuthorization(address)"(
      account?: string | null
    ): TypedEventFilter<[string], { account: string }>;

    RevokeAuthorization(
      account?: string | null
    ): TypedEventFilter<[string], { account: string }>;

    "UpdateAccumulatedRate(bytes32,uint256,int256,uint256)"(
      collateralType?: BytesLike | null,
      timestamp?: null,
      accumulatedRateDelta?: null,
      nextAccumulatedRate?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        collateralType: string;
        timestamp: BigNumber;
        accumulatedRateDelta: BigNumber;
        nextAccumulatedRate: BigNumber;
      }
    >;

    UpdateAccumulatedRate(
      collateralType?: BytesLike | null,
      timestamp?: null,
      accumulatedRateDelta?: null,
      nextAccumulatedRate?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber],
      {
        collateralType: string;
        timestamp: BigNumber;
        accumulatedRateDelta: BigNumber;
        nextAccumulatedRate: BigNumber;
      }
    >;

    "UpdateParameter(bytes32,uint256)"(
      parameter?: BytesLike | null,
      data?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { parameter: string; data: BigNumber }
    >;

    "UpdateParameter(bytes32,address)"(
      parameter?: BytesLike | null,
      data?: null
    ): TypedEventFilter<[string, string], { parameter: string; data: string }>;

    "UpdateParameter(bytes32,bytes32,uint256)"(
      parameter?: BytesLike | null,
      collateralType?: BytesLike | null,
      data?: null
    ): TypedEventFilter<
      [string, string, BigNumber],
      { parameter: string; collateralType: string; data: BigNumber }
    >;
  };

  estimateGas: {
    accountingEngine(overrides?: CallOverrides): Promise<BigNumber>;

    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    collateralTypes(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    globalStabilityFee(overrides?: CallOverrides): Promise<BigNumber>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initialize(
      ledger_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initializeCollateral(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ledger(overrides?: CallOverrides): Promise<BigNumber>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateAccountingEngine(
      data: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateAccumulatedRate(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateGlobalStabilityFee(
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateStabilityFee(
      collateralType: BytesLike,
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    accountingEngine(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    collateralTypes(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    globalStabilityFee(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      ledger_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initializeCollateral(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ledger(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateAccountingEngine(
      data: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateAccumulatedRate(
      collateralType: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateGlobalStabilityFee(
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateStabilityFee(
      collateralType: BytesLike,
      data: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
