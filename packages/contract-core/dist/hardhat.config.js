"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
const config_1 = require("hardhat/config");
require("@typechain/hardhat");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-watcher");
const config_2 = require("./src/config");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
(0, config_1.task)("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
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
exports.default = {
    solidity: "0.8.4",
    settings: {
        optimizer: {
            enabled: false,
            runs: 1000,
        },
    },
    networks: config_2.config.networks,
    watcher: {
        test: {
            tasks: ["compile", "test"],
            files: ["./contracts", "./test"],
        },
    },
    typechain: {
        outDir: "./src/types",
        target: "ethers-v5",
        alwaysGenerateOverloads: false,
    },
};
