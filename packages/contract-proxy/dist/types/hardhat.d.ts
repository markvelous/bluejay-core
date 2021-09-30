/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "DSAuth",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSAuth__factory>;
    getContractFactory(
      name: "DSAuthEvents",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSAuthEvents__factory>;
    getContractFactory(
      name: "DSAuthority",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSAuthority__factory>;
    getContractFactory(
      name: "DSNote",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSNote__factory>;
    getContractFactory(
      name: "DSProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSProxy__factory>;
    getContractFactory(
      name: "DSProxyCache",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSProxyCache__factory>;
    getContractFactory(
      name: "DSProxyFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DSProxyFactory__factory>;
    getContractFactory(
      name: "ProxyRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ProxyRegistry__factory>;

    getContractAt(
      name: "DSAuth",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSAuth>;
    getContractAt(
      name: "DSAuthEvents",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSAuthEvents>;
    getContractAt(
      name: "DSAuthority",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSAuthority>;
    getContractAt(
      name: "DSNote",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSNote>;
    getContractAt(
      name: "DSProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSProxy>;
    getContractAt(
      name: "DSProxyCache",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSProxyCache>;
    getContractAt(
      name: "DSProxyFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DSProxyFactory>;
    getContractAt(
      name: "ProxyRegistry",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ProxyRegistry>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
