/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { ILedger, ILedgerInterface } from "../ILedger";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "collateralType",
        type: "bytes32",
      },
    ],
    name: "collateralTypes",
    outputs: [
      {
        internalType: "uint256",
        name: "normalizedDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "accumulatedRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "safetyPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "debtCeiling",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "debtFloor",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "collateralType",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "position",
        type: "address",
      },
      {
        internalType: "address",
        name: "collateralSource",
        type: "address",
      },
      {
        internalType: "address",
        name: "debtDestination",
        type: "address",
      },
      {
        internalType: "int256",
        name: "collateralDelta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "normalizedDebtDelta",
        type: "int256",
      },
    ],
    name: "modifyPositionCollateralization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ILedger__factory {
  static readonly abi = _abi;
  static createInterface(): ILedgerInterface {
    return new utils.Interface(_abi) as ILedgerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILedger {
    return new Contract(address, _abi, signerOrProvider) as ILedger;
  }
}
