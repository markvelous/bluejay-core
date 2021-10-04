import { config } from "../config";
import deployedContracts from "../fixtures/deployment/contracts.json";

export const contracts: { [network: string]: { [contract: string]: string } } = deployedContracts;

export const proxyRegistryAddress = contracts[config.environment].ProxyRegistry;
export const ledgerAddress = contracts[config.environment].ProxyLedger;
export const savingsAccountAddress = contracts[config.environment].ProxySavingsAccount;

export const collaterals = [
  {
    name: "USDT",
    address: contracts[config.environment].SimpleCollateral,
    collateralType: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
];
