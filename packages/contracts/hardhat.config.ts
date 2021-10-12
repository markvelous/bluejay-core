/* eslint-disable import/no-extraneous-dependencies */
import { task, types } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-watcher";
import "hardhat-abi-exporter";
import { config } from "./src/config";
import { deployInfrastructure } from "./tasks/deployInfrastructure";
import { poke } from "./tasks/poke";

task(
  "deployInfrastructure",
  "Deploy entire infrastructure",
  async (args: any, hre) => {
    await deployInfrastructure(args, hre);
  }
)
  .addParam(
    "deploymentCache",
    "Cache for deployed contracts",
    undefined,
    types.string
  )
  .addParam(
    "transactionCache",
    "Cache for executed transactions",
    undefined,
    types.string
  );

task("poke", "Use mega poke the infrastructure", async (args: any, hre) => {
  await poke(args, hre);
}).addParam(
  "pokerAddress",
  "Address of poker contract",
  undefined,
  types.string
);

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
};
