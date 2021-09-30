import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-watcher";
declare const _default: {
    solidity: string;
    settings: {
        optimizer: {
            enabled: boolean;
            runs: number;
        };
    };
    networks: {
        hardhat: {};
        local: {
            url: string;
        };
        matic: {
            url: string;
            accounts: string[];
            chainId: number;
        };
        mumbai: {
            url: string;
            accounts: string[];
            /**
             * @type import('hardhat/config').HardhatUserConfig
             */
            chainId: number;
        };
    };
    watcher: {
        test: {
            tasks: string[];
            files: string[];
        };
    };
    typechain: {
        outDir: string;
        target: string;
        alwaysGenerateOverloads: boolean;
    };
};
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default _default;
