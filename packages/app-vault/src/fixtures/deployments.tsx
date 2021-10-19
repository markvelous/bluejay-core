import { config } from "../config";
import deployedContracts from "../fixtures/deployment/contracts.json";

export const contracts: { [network: string]: { [contract: string]: string } } = deployedContracts;

export const proxyRegistryAddress = contracts[config.environment].ProxyRegistry;
export const proxyHelperAddress = contracts[config.environment].ProxyHelper;
export const ledgerAddress = contracts[config.environment]["[MMKT]ProxyLedger"];
export const oracleRelayerAddress = contracts[config.environment]["[MMKT]ProxyOracleRelayer"];
export const feesEngineAddress = contracts[config.environment]["[MMKT]ProxyFeesEngine"];
export const savingsAccountAddress = contracts[config.environment]["[MMKT]ProxySavingsAccount"];
export const collateralFaucetAddress = contracts[config.environment]["Collateral[USDT]"];
export const stablecoinJoinAddress = contracts[config.environment]["[MMKT]ProxyStablecoinJoin"];
export const stablecoinAddress = contracts[config.environment]["[MMKT]ProxyStablecoin"];
export const collateralJoinAddress = contracts[config.environment]["[MMKT][USDT]ProxyCollateralJoin"];
export const liquidationEngineAddress = contracts[config.environment]["[MMKT]ProxyLiquidationEngine"];
export const helperAddress = contracts[config.environment].Helper;

export const getLiquidationAuctionAddress = (key: string): string =>
  contracts[config.environment][`[MMKT][${key}]ProxyLiquidationAuction`];

interface Collateral {
  name: string;
  address: string;
  collateralType: string;
}

export const collaterals: Collateral[] = [
  {
    name: "USDT",
    address: contracts[config.environment]["Collateral[USDT]"],
    collateralType: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
];

export const getCollateral = (collateralType: string): Collateral | undefined => {
  return collaterals.find((c) => c.collateralType.toLowerCase() === collateralType.toLowerCase());
};
