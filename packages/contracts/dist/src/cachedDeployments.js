"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCachedDeployments = void 0;
const hardhat_1 = require("hardhat");
const fs_1 = require("fs");
const debug_1 = require("./debug");
const { info } = (0, debug_1.getLogger)("cachedDeployments");
const buildDeploymentCache = (network, cache, save = true) => {
    if (!(0, fs_1.existsSync)(cache))
        (0, fs_1.writeFileSync)(cache, "{}");
    const deployments = JSON.parse((0, fs_1.readFileSync)(cache).toString());
    if (!deployments[network])
        deployments[network] = {};
    return {
        isDeployed: (key) => !!deployments[network][key],
        deployedAddress: (key) => deployments[network][key],
        updateDeployment: (key, address) => {
            deployments[network][key] = address;
            if (save)
                (0, fs_1.writeFileSync)(cache, JSON.stringify(deployments, null, 2));
        },
    };
};
const buildTransactionCache = (network, cache, save = true) => {
    if (!(0, fs_1.existsSync)(cache))
        (0, fs_1.writeFileSync)(cache, "{}");
    const transactions = JSON.parse((0, fs_1.readFileSync)(cache).toString());
    if (!transactions[network])
        transactions[network] = {};
    return {
        isExecuted: (key) => !!transactions[network][key],
        setExecution: (key) => {
            transactions[network][key] = true;
            if (save)
                (0, fs_1.writeFileSync)(cache, JSON.stringify(transactions, null, 2));
        },
    };
};
const getInitializerData = (ImplFactory, args) => {
    const fragment = ImplFactory.interface.getFunction("initialize");
    return ImplFactory.interface.encodeFunctionData(fragment, args);
};
const buildCachedDeployments = ({ deploymentCachePath, transactionCachePath, network, skipDeploymentCache, skipTransactionCache, saveCache = true, transactionOverrides = {}, }) => {
    const deploymentCache = buildDeploymentCache(network, deploymentCachePath, saveCache);
    const { deployedAddress, updateDeployment } = deploymentCache;
    const transactionCache = buildTransactionCache(network, transactionCachePath, saveCache);
    const { isExecuted, setExecution } = transactionCache;
    const deployUupsOrGetInstance = async ({ key, implementationAddress, factory, args = [], }) => {
        const ProxyFactory = await hardhat_1.ethers.getContractFactory("ERC1967Proxy");
        const ImplementationFactory = await hardhat_1.ethers.getContractFactory(factory);
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
        const proxy = await ProxyFactory.deploy(implementationAddress, initilizeData, transactionOverrides);
        await proxy.deployed();
        updateDeployment(key, proxy.address);
        info(`${key} deployed at ${proxy.address}`);
        const implementation = ImplementationFactory.attach(proxy.address);
        return {
            proxy,
            implementation,
        };
    };
    const deployOrGetInstance = async ({ key, factory, args = [], initArgs, }) => {
        const Factory = await hardhat_1.ethers.getContractFactory(factory);
        const cachedAddr = deployedAddress(key);
        if (cachedAddr && !skipDeploymentCache) {
            info(`${key} loaded from cache at ${cachedAddr}`);
            return Factory.attach(cachedAddr);
        }
        const deployedContract = await Factory.deploy(...args, transactionOverrides);
        await deployedContract.deployed();
        updateDeployment(key, deployedContract.address);
        info(`${key} deployed at ${deployedContract.address}`);
        if (initArgs) {
            await deployedContract.initialize(...initArgs, transactionOverrides);
        }
        return deployedContract;
    };
    const deployBeaconOrGetInstance = async ({ address, key, }) => {
        const Beacon = await hardhat_1.ethers.getContractFactory("UpgradeableBeacon");
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
    const deployBeaconProxyOrGetInsance = async ({ beacon, key, factory, args, }) => {
        const ProxyFactory = await hardhat_1.ethers.getContractFactory("BeaconProxy");
        const ImplementationFactory = await hardhat_1.ethers.getContractFactory(factory);
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
        const proxy = await ProxyFactory.deploy(beacon, initilizeData, transactionOverrides);
        await proxy.deployed();
        updateDeployment(key, proxy.address);
        info(`${key} deployed at ${proxy.address}`);
        return {
            proxy,
            implementation: ImplementationFactory.attach(proxy.address),
        };
    };
    const executeTransaction = async ({ contract, method, key, args = [], }) => {
        const hasExecuted = isExecuted(key);
        if (!hasExecuted || skipTransactionCache) {
            const receipt = await contract[method](...args, transactionOverrides);
            const tx = await receipt.wait();
            setExecution(key);
            info(`Executed ${key}: ${tx.transactionHash}`);
        }
        else {
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
exports.buildCachedDeployments = buildCachedDeployments;
