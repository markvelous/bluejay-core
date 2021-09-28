import hre, { network, ethers } from "hardhat";
import { getProxyFactory } from "@openzeppelin/hardhat-upgrades/dist/utils/factories";
import { constants, ContractFactory } from "ethers";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { getLogger, enableAllLog } from "../src/debug";

const { info, error } = getLogger("deployCore");

const CACHE_PATH = `${__dirname}/core-cache.json`;

const buildDeploymentCache = (net: string) => {
  if (!existsSync(CACHE_PATH)) writeFileSync(CACHE_PATH, "{}");
  const deployments: { [net: string]: { [key: string]: string } } = JSON.parse(
    readFileSync(CACHE_PATH).toString()
  );
  if (!deployments[net]) deployments[net] = {};
  return {
    isDeployed: (key: string) => !!deployments[net][key],
    deployedAddress: (key: string): string | undefined => deployments[net][key],
    updateDeployment: (key: string, address: string) => {
      deployments[net][key] = address;
      writeFileSync(CACHE_PATH, JSON.stringify(deployments, null, 2));
    },
  };
};

function getInitializerData(
  ImplFactory: ContractFactory,
  args: unknown[]
): string {
  const fragment = ImplFactory.interface.getFunction("initialize");
  return ImplFactory.interface.encodeFunctionData(fragment, args);
}

const deployUupsOrGetInstance = async ({
  deploymentCache,
  skipCache,
  key,
  implementationAddress,
  factory,
  args = [],
}: {
  deploymentCache: ReturnType<typeof buildDeploymentCache>;
  skipCache?: boolean;
  key: string;
  implementationAddress: string;
  factory: string;
  args?: any[];
}) => {
  const { deployedAddress, updateDeployment } = deploymentCache;
  const ProxyFactory = await getProxyFactory(
    hre,
    (
      await hre.ethers.getSigners()
    )[0]
  );
  const ImplementationFactory = await ethers.getContractFactory(factory);
  const cachedAddr = deployedAddress(key);
  if (cachedAddr && !skipCache) {
    info(`${key} loaded from cache at ${cachedAddr}`);
    return {
      proxy: ProxyFactory.attach(cachedAddr),
      implementation: ImplementationFactory.attach(cachedAddr),
    };
  }

  const initilizeData = args
    ? getInitializerData(ImplementationFactory, args)
    : "0x";
  const proxy = await ProxyFactory.deploy(implementationAddress, initilizeData);
  await proxy.deployed();
  updateDeployment(key, proxy.address);
  info(`${key} deployed at ${proxy.address}`);
  const implementation = ImplementationFactory.attach(proxy.address);
  return {
    proxy,
    implementation,
  };
};

const deployOrGetInstance = async ({
  deploymentCache,
  skipCache,
  key,
  factory,
  args = [],
  initArgs,
}: {
  deploymentCache: ReturnType<typeof buildDeploymentCache>;
  skipCache?: boolean;
  key: string;
  factory: string;
  args?: any[];
  initArgs?: any[];
}) => {
  const { deployedAddress, updateDeployment } = deploymentCache;
  const Factory = await ethers.getContractFactory(factory);
  const cachedAddr = deployedAddress(key);
  if (cachedAddr && !skipCache) {
    info(`${key} loaded from cache at ${cachedAddr}`);
    return Factory.attach(cachedAddr);
  }
  const deployedContract = await Factory.deploy(...args);
  await deployedContract.deployed();
  updateDeployment(key, deployedContract.address);
  info(`${key} deployed at ${deployedContract.address}`);
  if (initArgs) {
    await deployedContract.initialize(...initArgs);
  }
  return deployedContract;
};

const deployBeaconOrGetInstance = async ({
  address,
  key,
  deploymentCache,
  skipCache,
}: {
  address: string;
  key: string;
  deploymentCache: ReturnType<typeof buildDeploymentCache>;
  skipCache?: boolean;
}) => {
  const { deployedAddress, updateDeployment } = deploymentCache;
  const Beacon = await ethers.getContractFactory("UpgradeableBeacon");
  const cachedAddr = deployedAddress(key);
  if (cachedAddr && !skipCache) {
    info(`${key} loaded from cache at ${cachedAddr}`);
    return Beacon.attach(cachedAddr);
  }
  const beacon = await Beacon.deploy(address);
  await beacon.deployed();
  updateDeployment(key, beacon.address);
  info(`${key} deployed at ${beacon.address}`);
  return beacon;
};

const deployBeaconProxyOrGetInsance = async ({
  beacon,
  key,
  factory,
  deploymentCache,
  skipCache,
  args,
}: {
  beacon: string;
  key: string;
  factory: string;
  deploymentCache: ReturnType<typeof buildDeploymentCache>;
  skipCache?: boolean;
  args?: any[];
}) => {
  const { deployedAddress, updateDeployment } = deploymentCache;
  const ProxyFactory = await ethers.getContractFactory("BeaconProxy");
  const ImplementationFactory = await ethers.getContractFactory(factory);
  const cachedAddr = deployedAddress(key);
  if (cachedAddr && !skipCache) {
    info(`${key} loaded from cache at ${cachedAddr}`);
    return {
      proxy: ProxyFactory.attach(cachedAddr),
      implementation: ImplementationFactory.attach(cachedAddr),
    };
  }
  const initilizeData = args
    ? getInitializerData(ImplementationFactory, args)
    : "0x";
  const proxy = await ProxyFactory.deploy(beacon, initilizeData);
  await proxy.deployed();
  updateDeployment(key, proxy.address);
  info(`${key} deployed at ${proxy.address}`);
  return {
    proxy,
    implementation: ImplementationFactory.attach(proxy.address),
  };
};

export const deployCore = async () => {
  const skipCache = true;
  const deploymentCache = buildDeploymentCache(network.name);
  const collateralType =
    "0x0000000000000000000000000000000000000000000000000000000000000001";

  // Test Fixtures
  const collateral = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "SimpleCollateral",
    factory: "SimpleCollateral",
  });
  const oracle = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "SimpleOracle",
    factory: "SimpleOracle",
  });
  const governanceToken = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "SimpleGovernanceToken",
    factory: "SimpleGovernanceToken",
    initArgs: [],
  });

  // Deploy implementations
  const LogicStablecoin = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicStablecoin",
    factory: "Stablecoin",
    initArgs: ["Bluejay Stablecoin Impl", "Bluejay Stablecoin Impl"],
  });
  const LogicLedger = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicLedger",
    factory: "Ledger",
    initArgs: [],
  });
  const LogicCollateralJoin = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicCollateralJoin",
    factory: "CollateralJoin",
    initArgs: [constants.AddressZero, constants.HashZero, collateral.address],
  });
  const LogicStablecoinJoin = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicStablecoinJoin",
    factory: "StablecoinJoin",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicOracleRelayer = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicOracleRelayer",
    factory: "OracleRelayer",
    initArgs: [constants.AddressZero],
  });
  const LogicSavingsAccount = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicSavingsAccount",
    factory: "SavingsAccount",
    initArgs: [constants.AddressZero],
  });
  const LogicFeesEngine = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicFeesEngine",
    factory: "FeesEngine",
    initArgs: [constants.AddressZero],
  });
  const LogicSurplusAuction = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicSurplusAuction",
    factory: "SurplusAuction",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicDebtAuction = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicDebtAuction",
    factory: "DebtAuction",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicAccountingEngine = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicAccountingEngine",
    factory: "AccountingEngine",
    initArgs: [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
    ],
  });
  const LogicLiquidationEngine = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicLiquidationEngine",
    factory: "LiquidationEngine",
    initArgs: [constants.AddressZero],
  });
  const LogicLiquidationAuction = await deployOrGetInstance({
    deploymentCache,
    skipCache,
    key: "LogicLiquidationAuction",
    factory: "LiquidationAuction",
    initArgs: [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      collateralType,
    ],
  });

  // Deploy uups
  const { implementation: stablecoin } = await deployUupsOrGetInstance({
    deploymentCache,
    skipCache,
    key: "ProxyStablecoin",
    factory: "Stablecoin",
    args: ["Myanmar Kyat Tracker", "MMKT"],
    implementationAddress: LogicStablecoin.address,
  });

  // Deploy beacons
  const BeaconLedger = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicLedger.address,
    key: "BeaconLedger",
    skipCache,
  });
  const BeaconCollateralJoin = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicCollateralJoin.address,
    key: "BeaconCollateralJoin",
    skipCache,
  });
  const BeaconStablecoinJoin = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicStablecoinJoin.address,
    key: "BeaconStablecoinJoin",
    skipCache,
  });
  const BeaconOracleRelayer = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicOracleRelayer.address,
    key: "BeaconOracleRelayer",
    skipCache,
  });
  const BeaconSavingsAccount = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicSavingsAccount.address,
    key: "BeaconSavingsAccount",
    skipCache,
  });
  const BeaconFeesEngine = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicFeesEngine.address,
    key: "BeaconFeesEngine",
    skipCache,
  });
  const BeaconSurplusAuction = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicSurplusAuction.address,
    key: "BeaconSurplusAuction",
    skipCache,
  });
  const BeaconDebtAuction = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicDebtAuction.address,
    key: "BeaconDebtAuction",
    skipCache,
  });
  const BeaconAccountingEngine = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicAccountingEngine.address,
    key: "BeaconAccountingEngine",
    skipCache,
  });
  const BeaconLiquidationEngine = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicLiquidationEngine.address,
    key: "BeaconLiquidationEngine",
    skipCache,
  });
  const BeaconLiquidationAuction = await deployBeaconOrGetInstance({
    deploymentCache,
    address: LogicLiquidationAuction.address,
    key: "BeaconLiquidationAuction",
    skipCache,
  });

  // Deploy beacon proxy
  const { implementation: ledger } = await deployBeaconProxyOrGetInsance({
    deploymentCache,
    skipCache,
    key: "ProxyLedger",
    factory: "Ledger",
    args: [],
    beacon: BeaconLedger.address,
  });
  const { implementation: collateralJoin } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxyCollateralJoin",
      factory: "CollateralJoin",
      args: [ledger.address, collateralType, collateral.address],
      beacon: BeaconCollateralJoin.address,
    });
  const { implementation: stablecoinJoin } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxyStablecoinJoin",
      factory: "StablecoinJoin",
      args: [ledger.address, stablecoin.address],
      beacon: BeaconStablecoinJoin.address,
    });
  const { implementation: oracleRelayer } = await deployBeaconProxyOrGetInsance(
    {
      deploymentCache,
      skipCache,
      key: "ProxyOracleRelayer",
      factory: "OracleRelayer",
      args: [ledger.address],
      beacon: BeaconOracleRelayer.address,
    }
  );
  const { implementation: savingsAccount } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxySavingsAccount",
      factory: "SavingsAccount",
      args: [ledger.address],
      beacon: BeaconSavingsAccount.address,
    });
  const { implementation: feesEngine } = await deployBeaconProxyOrGetInsance({
    deploymentCache,
    skipCache,
    key: "ProxyFeesEngine",
    factory: "FeesEngine",
    args: [ledger.address],
    beacon: BeaconFeesEngine.address,
  });
  const { implementation: surplusAuction } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxySurplusAuction",
      factory: "SurplusAuction",
      args: [ledger.address, governanceToken.address],
      beacon: BeaconSurplusAuction.address,
    });
  const { implementation: debtAuction } = await deployBeaconProxyOrGetInsance({
    deploymentCache,
    skipCache,
    key: "ProxyDebtAuction",
    factory: "DebtAuction",
    args: [ledger.address, governanceToken.address],
    beacon: BeaconDebtAuction.address,
  });
  const { implementation: accountingEngine } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxyAccountingEngine",
      factory: "AccountingEngine",
      args: [ledger.address, surplusAuction.address, debtAuction.address],
      beacon: BeaconAccountingEngine.address,
    });
  const { implementation: liquidationEngine } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxyLiquidationEngine",
      factory: "LiquidationEngine",
      args: [ledger.address],
      beacon: BeaconLiquidationEngine.address,
    });
  const { implementation: liquidationAuction } =
    await deployBeaconProxyOrGetInsance({
      deploymentCache,
      skipCache,
      key: "ProxyLiquidationAuction",
      factory: "LiquidationAuction",
      args: [
        ledger.address,
        oracleRelayer.address,
        liquidationEngine.address,
        collateralType,
      ],
      beacon: BeaconLiquidationAuction.address,
    });

  return {
    collateral,
    oracle,
    governanceToken,
    stablecoin,
    collateralType,
    collateralJoin,
    stablecoinJoin,
    ledger,
    savingsAccount,
    oracleRelayer,
    feesEngine,
    surplusAuction,
    debtAuction,
    accountingEngine,
    liquidationEngine,
    liquidationAuction,
  };
};

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
deployCore()
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
