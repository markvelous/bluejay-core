/* eslint-disable import/no-extraneous-dependencies */
import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-watcher";
import { config } from "./src/config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  // eslint-disable-next-line no-console
  accounts.forEach((account) => console.log(account.address));
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

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
    outDir: "./dist/types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
};
