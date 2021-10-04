import { config } from "../config";
import deployedContracts from "../fixtures/deployment/contracts.json";

export const contracts: { [network: string]: { [contract: string]: string } } = deployedContracts;
export const proxyRegistryAddress = contracts[config.environment].ProxyRegistry;
export const collaterals = [
  {
    name: "USDT",
    address: contracts[config.environment].SimpleCollateral,
  },
];
