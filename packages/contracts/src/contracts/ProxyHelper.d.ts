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

interface ProxyHelperInterface extends ethers.utils.Interface {
  functions: {
    "exitCollateral(address,uint256)": FunctionFragment;
    "exitStablecoin(address,uint256)": FunctionFragment;
    "joinCollateral(address,uint256)": FunctionFragment;
    "joinStablecoin(address,uint256)": FunctionFragment;
    "transferCollateralAndDebt(bytes32,address,address,address,int256,int256)": FunctionFragment;
    "transferSavings(address,address,int256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "exitCollateral",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exitStablecoin",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "joinCollateral",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "joinStablecoin",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferCollateralAndDebt",
    values: [BytesLike, string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferSavings",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "exitCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exitStablecoin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "joinCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "joinStablecoin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferCollateralAndDebt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferSavings",
    data: BytesLike
  ): Result;

  events: {};
}

export class ProxyHelper extends BaseContract {
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

  interface: ProxyHelperInterface;

  functions: {
    exitCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    exitStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    joinCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    joinStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferCollateralAndDebt(
      collateralType: BytesLike,
      ledgerAddr: string,
      stablecoinJoinAddr: string,
      collateralJoinAddr: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferSavings(
      savingsAccountAddr: string,
      stablecoinJoinAddr: string,
      debtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  exitCollateral(
    collateralJoinAddr: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  exitStablecoin(
    stablecoinJoinAddr: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  joinCollateral(
    collateralJoinAddr: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  joinStablecoin(
    stablecoinJoinAddr: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferCollateralAndDebt(
    collateralType: BytesLike,
    ledgerAddr: string,
    stablecoinJoinAddr: string,
    collateralJoinAddr: string,
    collateralDelta: BigNumberish,
    normalizedDebtDelta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferSavings(
    savingsAccountAddr: string,
    stablecoinJoinAddr: string,
    debtDelta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    exitCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    exitStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    joinCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    joinStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    transferCollateralAndDebt(
      collateralType: BytesLike,
      ledgerAddr: string,
      stablecoinJoinAddr: string,
      collateralJoinAddr: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    transferSavings(
      savingsAccountAddr: string,
      stablecoinJoinAddr: string,
      debtDelta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    exitCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    exitStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    joinCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    joinStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferCollateralAndDebt(
      collateralType: BytesLike,
      ledgerAddr: string,
      stablecoinJoinAddr: string,
      collateralJoinAddr: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferSavings(
      savingsAccountAddr: string,
      stablecoinJoinAddr: string,
      debtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    exitCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    exitStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    joinCollateral(
      collateralJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    joinStablecoin(
      stablecoinJoinAddr: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferCollateralAndDebt(
      collateralType: BytesLike,
      ledgerAddr: string,
      stablecoinJoinAddr: string,
      collateralJoinAddr: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferSavings(
      savingsAccountAddr: string,
      stablecoinJoinAddr: string,
      debtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}