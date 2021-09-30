/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  DiscountCalculator,
  DiscountCalculatorInterface,
} from "../DiscountCalculator";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "discountPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class DiscountCalculator__factory {
  static readonly abi = _abi;
  static createInterface(): DiscountCalculatorInterface {
    return new utils.Interface(_abi) as DiscountCalculatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DiscountCalculator {
    return new Contract(address, _abi, signerOrProvider) as DiscountCalculator;
  }
}
