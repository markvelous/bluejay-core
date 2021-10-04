/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { LedgerLike, LedgerLikeInterface } from "../LedgerLike";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    name: "modifyCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class LedgerLike__factory {
  static readonly abi = _abi;
  static createInterface(): LedgerLikeInterface {
    return new utils.Interface(_abi) as LedgerLikeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LedgerLike {
    return new Contract(address, _abi, signerOrProvider) as LedgerLike;
  }
}