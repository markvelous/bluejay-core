import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract, ContractFactory, ContractTransaction } from "ethers";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { getLogger } from "./debug";

const { info } = getLogger("cachedDeployments");

const buildDeploymentCache = (
  network: string,
  cache: string,
  save: boolean = true
) => {
  if (!existsSync(cache)) writeFileSync(cache, "{}");
  const deployments: { [network: string]: { [key: string]: string } } =
    JSON.parse(readFileSync(cache).toString());
  if (!deployments[network]) deployments[network] = {};
  return {
    isDeployed: (key: string) => !!deployments[network][key],
    deployedAddress: (key: string): string | undefined =>
      deployments[network][key],
    updateDeployment: (key: string, address: string) => {
      deployments[network][key] = address;
      if (save) writeFileSync(cache, JSON.stringify(deployments, null, 2));
    },
  };
};

const buildTransactionCache = (
  network: string,
  cache: string,
  save: boolean = true
) => {
  if (!existsSync(cache)) writeFileSync(cache, "{}");
  const transactions: { [network: string]: { [key: string]: boolean } } =
    JSON.parse(readFileSync(cache).toString());
  if (!transactions[network]) transactions[network] = {};
  return {
    isExecuted: (key: string) => !!transactions[network][key],
    setExecution: (key: string) => {
      transactions[network][key] = true;
      if (save) writeFileSync(cache, JSON.stringify(transactions, null, 2));
    },
  };
};

const getInitializerData = (
  ImplFactory: ContractFactory,
  args: unknown[]
): string => {
  const fragment = ImplFactory.interface.getFunction("initialize");
  return ImplFactory.interface.encodeFunctionData(fragment, args);
};

export const buildCachedDeployments = ({
  hre,
  deploymentCachePath,
  transactionCachePath,
  network,
  skipDeploymentCache,
  skipTransactionCache,
  saveCache = true,
  transactionOverrides = {},
}: {
  hre: HardhatRuntimeEnvironment;
  deploymentCachePath: string;
  transactionCachePath: string;
  network: string;
  saveCache?: boolean;
  skipDeploymentCache?: boolean;
  skipTransactionCache?: boolean;
  transactionOverrides: any;
}) => {
  const { ethers } = hre;
  const deploymentCache = buildDeploymentCache(
    network,
    deploymentCachePath,
    saveCache
  );
  const { deployedAddress, updateDeployment } = deploymentCache;

  const transactionCache = buildTransactionCache(
    network,
    transactionCachePath,
    saveCache
  );
  const { isExecuted, setExecution } = transactionCache;

  const deployUupsOrGetInstance = async ({
    key,
    implementationAddress,
    factory,
    args = [],
  }: {
    key: string;
    implementationAddress: string;
    factory: string;
    args?: any[];
  }) => {
    const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy");
    const ImplementationFactory = await ethers.getContractFactory(factory);
    const cachedAddr = deployedAddress(key);
    if (cachedAddr && !skipDeploymentCache) {
      info(`${key} loaded from cache at ${cachedAddr}`);
      return {
        proxy: ProxyFactory.attach(cachedAddr),
        implementation: ImplementationFactory.attach(cachedAddr),
      };
    }

    const initilizeData = args
      ? getInitializerData(ImplementationFactory, args)
      : "0x";
    const proxy = await ProxyFactory.deploy(
      implementationAddress,
      initilizeData,
      transactionOverrides
    );
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
    key,
    factory,
    args = [],
    initArgs,
  }: {
    key: string;
    factory: string;
    args?: any[];
    initArgs?: any[];
  }) => {
    const Factory = await ethers.getContractFactory(factory);
    const cachedAddr = deployedAddress(key);
    if (cachedAddr && !skipDeploymentCache) {
      info(`${key} loaded from cache at ${cachedAddr}`);
      return Factory.attach(cachedAddr);
    }
    const deployedContract = await Factory.deploy(
      ...args,
      transactionOverrides
    );
    await deployedContract.deployed();
    updateDeployment(key, deployedContract.address);
    info(`${key} deployed at ${deployedContract.address}`);
    if (initArgs) {
      await deployedContract.initialize(...initArgs, transactionOverrides);
    }
    return deployedContract;
  };

  const deployBeaconOrGetInstance = async ({
    address,
    key,
  }: {
    address: string;
    key: string;
  }) => {
    const Beacon = await ethers.getContractFactory("UpgradeableBeacon");
    const cachedAddr = deployedAddress(key);
    if (cachedAddr && !skipDeploymentCache) {
      info(`${key} loaded from cache at ${cachedAddr}`);
      return Beacon.attach(cachedAddr);
    }
    const beacon = await Beacon.deploy(address, transactionOverrides);
    await beacon.deployed();
    updateDeployment(key, beacon.address);
    info(`${key} deployed at ${beacon.address}`);
    return beacon;
  };

  const deployBeaconProxyOrGetInsance = async ({
    beacon,
    key,
    factory,

    args,
  }: {
    beacon: string;
    key: string;
    factory: string;
    args?: any[];
  }) => {
    const ProxyFactory = await ethers.getContractFactory("BeaconProxy");
    const ImplementationFactory = await ethers.getContractFactory(factory);
    const cachedAddr = deployedAddress(key);
    if (cachedAddr && !skipDeploymentCache) {
      info(`${key} loaded from cache at ${cachedAddr}`);
      return {
        proxy: ProxyFactory.attach(cachedAddr),
        implementation: ImplementationFactory.attach(cachedAddr),
      };
    }
    const initilizeData = args
      ? getInitializerData(ImplementationFactory, args)
      : "0x";
    const proxy = await ProxyFactory.deploy(
      beacon,
      initilizeData,
      transactionOverrides
    );
    await proxy.deployed();
    updateDeployment(key, proxy.address);
    info(`${key} deployed at ${proxy.address}`);
    return {
      proxy,
      implementation: ImplementationFactory.attach(proxy.address),
    };
  };

  const executeTransaction = async ({
    contract,
    method,
    key,
    args = [],
  }: {
    contract: Contract;
    method: string;
    key: string;
    args?: any[];
  }) => {
    const hasExecuted = isExecuted(key);
    if (!hasExecuted || skipTransactionCache) {
      const receipt: ContractTransaction = await contract[method](
        ...args,
        transactionOverrides
      );
      const tx = await receipt.wait();
      setExecution(key);
      info(`Executed ${key}: ${tx.transactionHash}`);
    } else {
      info(`Skipping ${key} on ${contract.address}`);
    }
  };

  return {
    deploymentCache,
    transactionCache,
    deployOrGetInstance,
    deployUupsOrGetInstance,
    deployBeaconProxyOrGetInsance,
    deployBeaconOrGetInstance,
    executeTransaction,
  };
};
