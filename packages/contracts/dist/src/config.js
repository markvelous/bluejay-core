"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const generateNetworks = () => {
    if (!process.env.ALCHEMY_KEY)
        throw new Error(`ALCHEMY_KEY not set in config`);
    if (!process.env.MATIC_ACCOUNT_1)
        throw new Error(`MATIC_ACCOUNT_1 not set in config`);
    if (!process.env.MUMBAI_ACCOUNT_1)
        throw new Error(`MUMBAI_ACCOUNT_1 not set in config`);
    return {
        hardhat: {},
        local: {
            url: `http://127.0.0.1:8545/`,
        },
        matic: {
            url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [process.env.MATIC_ACCOUNT_1],
            chainId: 137,
        },
        mumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [process.env.MUMBAI_ACCOUNT_1],
            chainId: 80001,
        },
    };
};
const generateConfig = () => ({
    networks: generateNetworks(),
});
exports.config = generateConfig();
