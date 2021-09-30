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
      name: "AccessControlUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControlUpgradeable__factory>;
    getContractFactory(
      name: "IAccessControlUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControlUpgradeable__factory>;
    getContractFactory(
      name: "IBeaconUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBeaconUpgradeable__factory>;
    getContractFactory(
      name: "ERC1967UpgradeUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967UpgradeUpgradeable__factory>;
    getContractFactory(
      name: "UUPSUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UUPSUpgradeable__factory>;
    getContractFactory(
      name: "ERC20Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Upgradeable__factory>;
    getContractFactory(
      name: "ERC20PermitUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20PermitUpgradeable__factory>;
    getContractFactory(
      name: "IERC20PermitUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20PermitUpgradeable__factory>;
    getContractFactory(
      name: "ERC20BurnableUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20BurnableUpgradeable__factory>;
    getContractFactory(
      name: "IERC20MetadataUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20MetadataUpgradeable__factory>;
    getContractFactory(
      name: "IERC20Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Upgradeable__factory>;
    getContractFactory(
      name: "ERC165Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165Upgradeable__factory>;
    getContractFactory(
      name: "IERC165Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165Upgradeable__factory>;
    getContractFactory(
      name: "AccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControl__factory>;
    getContractFactory(
      name: "IAccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControl__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "BeaconProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BeaconProxy__factory>;
    getContractFactory(
      name: "IBeacon",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBeacon__factory>;
    getContractFactory(
      name: "UpgradeableBeacon",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UpgradeableBeacon__factory>;
    getContractFactory(
      name: "ERC1967Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967Proxy__factory>;
    getContractFactory(
      name: "ERC1967Upgrade",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967Upgrade__factory>;
    getContractFactory(
      name: "Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Proxy__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "ERC20Burnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Burnable__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "AccountingEngine",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccountingEngine__factory>;
    getContractFactory(
      name: "DebtAuctionLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DebtAuctionLike__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "SurplusAuctionLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SurplusAuctionLike__factory>;
    getContractFactory(
      name: "CollateralJoin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.CollateralJoin__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "TokenLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokenLike__factory>;
    getContractFactory(
      name: "AccountingEngineLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccountingEngineLike__factory>;
    getContractFactory(
      name: "DebtAuction",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DebtAuction__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "TokenLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokenLike__factory>;
    getContractFactory(
      name: "DiscountCalculator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DiscountCalculator__factory>;
    getContractFactory(
      name: "StairstepExponentialDecrease",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.StairstepExponentialDecrease__factory>;
    getContractFactory(
      name: "FeesEngine",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FeesEngine__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "Ledger",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ledger__factory>;
    getContractFactory(
      name: "DiscountCalculatorLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DiscountCalculatorLike__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "LiquidationAuction",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LiquidationAuction__factory>;
    getContractFactory(
      name: "LiquidationAuctionCallee",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LiquidationAuctionCallee__factory>;
    getContractFactory(
      name: "LiquidationEngineLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LiquidationEngineLike__factory>;
    getContractFactory(
      name: "OracleLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OracleLike__factory>;
    getContractFactory(
      name: "OracleRelayerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OracleRelayerLike__factory>;
    getContractFactory(
      name: "AccountingEngineLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccountingEngineLike__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "LiquidationAuctionLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LiquidationAuctionLike__factory>;
    getContractFactory(
      name: "LiquidationEngine",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LiquidationEngine__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "OracleLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OracleLike__factory>;
    getContractFactory(
      name: "OracleRelayer",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OracleRelayer__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "SavingsAccount",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SavingsAccount__factory>;
    getContractFactory(
      name: "Stablecoin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Stablecoin__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "StablecoinJoin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.StablecoinJoin__factory>;
    getContractFactory(
      name: "TokenLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokenLike__factory>;
    getContractFactory(
      name: "LedgerLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.LedgerLike__factory>;
    getContractFactory(
      name: "SurplusAuction",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SurplusAuction__factory>;
    getContractFactory(
      name: "TokenLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokenLike__factory>;
    getContractFactory(
      name: "SimpleCollateral",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SimpleCollateral__factory>;
    getContractFactory(
      name: "SimpleGovernanceToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SimpleGovernanceToken__factory>;
    getContractFactory(
      name: "OracleLike",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OracleLike__factory>;
    getContractFactory(
      name: "SimpleOracle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SimpleOracle__factory>;

    getContractAt(
      name: "AccessControlUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControlUpgradeable>;
    getContractAt(
      name: "IAccessControlUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControlUpgradeable>;
    getContractAt(
      name: "IBeaconUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBeaconUpgradeable>;
    getContractAt(
      name: "ERC1967UpgradeUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967UpgradeUpgradeable>;
    getContractAt(
      name: "UUPSUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UUPSUpgradeable>;
    getContractAt(
      name: "ERC20Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Upgradeable>;
    getContractAt(
      name: "ERC20PermitUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20PermitUpgradeable>;
    getContractAt(
      name: "IERC20PermitUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20PermitUpgradeable>;
    getContractAt(
      name: "ERC20BurnableUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20BurnableUpgradeable>;
    getContractAt(
      name: "IERC20MetadataUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20MetadataUpgradeable>;
    getContractAt(
      name: "IERC20Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Upgradeable>;
    getContractAt(
      name: "ERC165Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165Upgradeable>;
    getContractAt(
      name: "IERC165Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165Upgradeable>;
    getContractAt(
      name: "AccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControl>;
    getContractAt(
      name: "IAccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControl>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "BeaconProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.BeaconProxy>;
    getContractAt(
      name: "IBeacon",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBeacon>;
    getContractAt(
      name: "UpgradeableBeacon",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UpgradeableBeacon>;
    getContractAt(
      name: "ERC1967Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967Proxy>;
    getContractAt(
      name: "ERC1967Upgrade",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967Upgrade>;
    getContractAt(
      name: "Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Proxy>;
    getContractAt(
      name: "ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "ERC20Burnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Burnable>;
    getContractAt(
      name: "IERC20Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165>;
    getContractAt(
      name: "IERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "AccountingEngine",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccountingEngine>;
    getContractAt(
      name: "DebtAuctionLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DebtAuctionLike>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "SurplusAuctionLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SurplusAuctionLike>;
    getContractAt(
      name: "CollateralJoin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.CollateralJoin>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "TokenLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokenLike>;
    getContractAt(
      name: "AccountingEngineLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccountingEngineLike>;
    getContractAt(
      name: "DebtAuction",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DebtAuction>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "TokenLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokenLike>;
    getContractAt(
      name: "DiscountCalculator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DiscountCalculator>;
    getContractAt(
      name: "StairstepExponentialDecrease",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.StairstepExponentialDecrease>;
    getContractAt(
      name: "FeesEngine",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.FeesEngine>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "Ledger",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ledger>;
    getContractAt(
      name: "DiscountCalculatorLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.DiscountCalculatorLike>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "LiquidationAuction",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LiquidationAuction>;
    getContractAt(
      name: "LiquidationAuctionCallee",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LiquidationAuctionCallee>;
    getContractAt(
      name: "LiquidationEngineLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LiquidationEngineLike>;
    getContractAt(
      name: "OracleLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OracleLike>;
    getContractAt(
      name: "OracleRelayerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OracleRelayerLike>;
    getContractAt(
      name: "AccountingEngineLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccountingEngineLike>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "LiquidationAuctionLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LiquidationAuctionLike>;
    getContractAt(
      name: "LiquidationEngine",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LiquidationEngine>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "OracleLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OracleLike>;
    getContractAt(
      name: "OracleRelayer",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OracleRelayer>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "SavingsAccount",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SavingsAccount>;
    getContractAt(
      name: "Stablecoin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Stablecoin>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "StablecoinJoin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.StablecoinJoin>;
    getContractAt(
      name: "TokenLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokenLike>;
    getContractAt(
      name: "LedgerLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.LedgerLike>;
    getContractAt(
      name: "SurplusAuction",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SurplusAuction>;
    getContractAt(
      name: "TokenLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokenLike>;
    getContractAt(
      name: "SimpleCollateral",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SimpleCollateral>;
    getContractAt(
      name: "SimpleGovernanceToken",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SimpleGovernanceToken>;
    getContractAt(
      name: "OracleLike",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OracleLike>;
    getContractAt(
      name: "SimpleOracle",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SimpleOracle>;

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
