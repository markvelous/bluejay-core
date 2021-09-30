import { Contract } from "ethers";
export declare const buildCachedDeployments: ({ deploymentCachePath, transactionCachePath, network, skipDeploymentCache, skipTransactionCache, transactionOverrides, }: {
    deploymentCachePath: string;
    transactionCachePath: string;
    network: string;
    skipDeploymentCache?: boolean | undefined;
    skipTransactionCache?: boolean | undefined;
    transactionOverrides: any;
}) => {
    deploymentCache: {
        isDeployed: (key: string) => boolean;
        deployedAddress: (key: string) => string | undefined;
        updateDeployment: (key: string, address: string) => void;
    };
    transactionCache: {
        isExecuted: (key: string) => boolean;
        setExecution: (key: string) => void;
    };
    deployOrGetInstance: ({ key, factory, args, initArgs, }: {
        key: string;
        factory: string;
        args?: any[] | undefined;
        initArgs?: any[] | undefined;
    }) => Promise<Contract>;
    deployUupsOrGetInstance: ({ key, implementationAddress, factory, args, }: {
        key: string;
        implementationAddress: string;
        factory: string;
        args?: any[] | undefined;
    }) => Promise<{
        proxy: import("./types").ERC1967Proxy;
        implementation: Contract;
    }>;
    deployBeaconProxyOrGetInsance: ({ beacon, key, factory, args, }: {
        beacon: string;
        key: string;
        factory: string;
        args?: any[] | undefined;
    }) => Promise<{
        proxy: import("./types").BeaconProxy;
        implementation: Contract;
    }>;
    deployBeaconOrGetInstance: ({ address, key, }: {
        address: string;
        key: string;
    }) => Promise<import("./types").UpgradeableBeacon>;
    executeTransaction: ({ contract, method, key, args, }: {
        contract: Contract;
        method: string;
        key: string;
        args?: any[] | undefined;
    }) => Promise<void>;
};
