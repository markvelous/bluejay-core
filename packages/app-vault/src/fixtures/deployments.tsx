import { config } from "../config";
import deployedContracts from "../fixtures/deployment/contracts.json";

export const contracts: { [network: string]: { [contract: string]: string } } = deployedContracts;

export const proxyRegistryAddress = contracts[config.environment].ProxyRegistry;
export const ledgerAddress = contracts[config.environment].ProxyLedger;
export const oracleRelayerAddress = contracts[config.environment].ProxyOracleRelayer;
export const feesEngineAddress = contracts[config.environment].ProxyFeesEngine;
export const savingsAccountAddress = contracts[config.environment].ProxySavingsAccount;

interface Collateral {
  name: string;
  address: string;
  collateralType: string;
}

export const collaterals: Collateral[] = [
  {
    name: "USDT",
    address: contracts[config.environment].SimpleCollateral,
    collateralType: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
];

export const getCollateral = (collateralType: string): Collateral | undefined => {
  return collaterals.find((c) => c.collateralType.toLowerCase() === collateralType.toLowerCase());
};
