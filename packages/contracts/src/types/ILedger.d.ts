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

interface ILedgerInterface extends ethers.utils.Interface {
  functions: {
    "collateralTypes(bytes32)": FunctionFragment;
    "modifyPositionCollateralization(bytes32,address,address,address,int256,int256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "collateralTypes",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "modifyPositionCollateralization",
    values: [BytesLike, string, string, string, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "collateralTypes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "modifyPositionCollateralization",
    data: BytesLike
  ): Result;

  events: {};
}

export class ILedger extends BaseContract {
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

  interface: ILedgerInterface;

  functions: {
    collateralTypes(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        normalizedDebt: BigNumber;
        accumulatedRate: BigNumber;
        safetyPrice: BigNumber;
        debtCeiling: BigNumber;
        debtFloor: BigNumber;
      }
    >;

    modifyPositionCollateralization(
      collateralType: BytesLike,
      position: string,
      collateralSource: string,
      debtDestination: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  collateralTypes(
    collateralType: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      normalizedDebt: BigNumber;
      accumulatedRate: BigNumber;
      safetyPrice: BigNumber;
      debtCeiling: BigNumber;
      debtFloor: BigNumber;
    }
  >;

  modifyPositionCollateralization(
    collateralType: BytesLike,
    position: string,
    collateralSource: string,
    debtDestination: string,
    collateralDelta: BigNumberish,
    normalizedDebtDelta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    collateralTypes(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        normalizedDebt: BigNumber;
        accumulatedRate: BigNumber;
        safetyPrice: BigNumber;
        debtCeiling: BigNumber;
        debtFloor: BigNumber;
      }
    >;

    modifyPositionCollateralization(
      collateralType: BytesLike,
      position: string,
      collateralSource: string,
      debtDestination: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    collateralTypes(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    modifyPositionCollateralization(
      collateralType: BytesLike,
      position: string,
      collateralSource: string,
      debtDestination: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    collateralTypes(
      collateralType: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    modifyPositionCollateralization(
      collateralType: BytesLike,
      position: string,
      collateralSource: string,
      debtDestination: string,
      collateralDelta: BigNumberish,
      normalizedDebtDelta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}