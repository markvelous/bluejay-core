/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  AccountingEngineLike,
  AccountingEngineLikeInterface,
} from "../AccountingEngineLike";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "settleUnbackedDebtFromAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalDebtOnAuction",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class AccountingEngineLike__factory {
  static readonly abi = _abi;
  static createInterface(): AccountingEngineLikeInterface {
    return new utils.Interface(_abi) as AccountingEngineLikeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AccountingEngineLike {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AccountingEngineLike;
  }
}