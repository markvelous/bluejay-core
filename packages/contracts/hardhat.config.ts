/* eslint-disable import/no-extraneous-dependencies */
import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-watcher";
import "hardhat-deploy";
import "hardhat-abi-exporter";
import { config } from "./src/config";

task("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  // eslint-disable-next-line no-console
  accounts.forEach((account) => console.log(account.address));
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// eslint-disable-next-line import/no-default-export
export default {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: false,
      runs: 1000,
    },
  },
  networks: config.networks,
  watcher: {
    test: {
      tasks: ["compile", "test"],
      files: ["./contracts", "./test"],
    },
  },
  typechain: {
    outDir: "./src/contracts",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
  abiExporter: {
    path: "./abi",
    flat: true,
    spacing: 2,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    dao: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
  },
};
