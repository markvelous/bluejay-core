/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { OracleLike, OracleLikeInterface } from "../OracleLike";

const _abi = [
  {
    inputs: [],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class OracleLike__factory {
  static readonly abi = _abi;
  static createInterface(): OracleLikeInterface {
    return new utils.Interface(_abi) as OracleLikeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OracleLike {
    return new Contract(address, _abi, signerOrProvider) as OracleLike;
  }
}
