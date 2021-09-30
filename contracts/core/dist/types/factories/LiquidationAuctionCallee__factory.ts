/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  LiquidationAuctionCallee,
  LiquidationAuctionCalleeInterface,
} from "../LiquidationAuctionCallee";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
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
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "liquidationCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class LiquidationAuctionCallee__factory {
  static readonly abi = _abi;
  static createInterface(): LiquidationAuctionCalleeInterface {
    return new utils.Interface(_abi) as LiquidationAuctionCalleeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LiquidationAuctionCallee {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as LiquidationAuctionCallee;
  }
}
