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

interface StablecoinJoinInterface extends ethers.utils.Interface {
  functions: {
    "authorizedAccounts(address)": FunctionFragment;
    "deposit(address,uint256)": FunctionFragment;
    "grantAuthorization(address)": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "ledger()": FunctionFragment;
    "live()": FunctionFragment;
    "revokeAuthorization(address)": FunctionFragment;
    "shutdown()": FunctionFragment;
    "stablecoin()": FunctionFragment;
    "withdraw(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "authorizedAccounts",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "grantAuthorization",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "ledger", values?: undefined): string;
  encodeFunctionData(functionFragment: "live", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "revokeAuthorization",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "shutdown", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "stablecoin",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "authorizedAccounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "grantAuthorization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ledger", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "live", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "revokeAuthorization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "shutdown", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stablecoin", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "Deposit(address,uint256)": EventFragment;
    "GrantAuthorization(address)": EventFragment;
    "RevokeAuthorization(address)": EventFragment;
    "Withdraw(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Deposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "GrantAuthorization"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RevokeAuthorization"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export type DepositEvent = TypedEvent<
  [string, BigNumber] & { user: string; amount: BigNumber }
>;

export type GrantAuthorizationEvent = TypedEvent<
  [string] & { account: string }
>;

export type RevokeAuthorizationEvent = TypedEvent<
  [string] & { account: string }
>;

export type WithdrawEvent = TypedEvent<
  [string, BigNumber] & { user: string; amount: BigNumber }
>;

export class StablecoinJoin extends BaseContract {
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

  interface: StablecoinJoinInterface;

  functions: {
    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    deposit(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initialize(
      ledger_: string,
      stablecoin_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ledger(overrides?: CallOverrides): Promise<[string]>;

    live(overrides?: CallOverrides): Promise<[BigNumber]>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shutdown(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stablecoin(overrides?: CallOverrides): Promise<[string]>;

    withdraw(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  authorizedAccounts(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  deposit(
    user: string,
    wad: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  grantAuthorization(
    user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initialize(
    ledger_: string,
    stablecoin_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ledger(overrides?: CallOverrides): Promise<string>;

  live(overrides?: CallOverrides): Promise<BigNumber>;

  revokeAuthorization(
    user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shutdown(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stablecoin(overrides?: CallOverrides): Promise<string>;

  withdraw(
    user: string,
    wad: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      user: string,
      wad: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    grantAuthorization(user: string, overrides?: CallOverrides): Promise<void>;

    initialize(
      ledger_: string,
      stablecoin_: string,
      overrides?: CallOverrides
    ): Promise<void>;

    ledger(overrides?: CallOverrides): Promise<string>;

    live(overrides?: CallOverrides): Promise<BigNumber>;

    revokeAuthorization(user: string, overrides?: CallOverrides): Promise<void>;

    shutdown(overrides?: CallOverrides): Promise<void>;

    stablecoin(overrides?: CallOverrides): Promise<string>;

    withdraw(
      user: string,
      wad: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Deposit(address,uint256)"(
      user?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;

    Deposit(
      user?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;

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

    "Withdraw(address,uint256)"(
      user?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;

    Withdraw(
      user?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initialize(
      ledger_: string,
      stablecoin_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ledger(overrides?: CallOverrides): Promise<BigNumber>;

    live(overrides?: CallOverrides): Promise<BigNumber>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shutdown(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stablecoin(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    authorizedAccounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    grantAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      ledger_: string,
      stablecoin_: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ledger(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    live(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    revokeAuthorization(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shutdown(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stablecoin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      user: string,
      wad: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
