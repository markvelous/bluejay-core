"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printLedgerPosition = exports.printLedgerGlobals = exports.printLedgerCollateralType = exports.formatRad = exports.formatRay = exports.formatWad = exports.formatNumber = exports.increaseTime = exports.incrementTime = exports.mineBlocks = exports.exp = void 0;
const ethers_1 = require("ethers");
const debug_1 = require("../src/debug");
const { info, error } = (0, debug_1.getLogger)("utils");
const exp = (exponent) => {
    return ethers_1.BigNumber.from(10).pow(exponent);
};
exports.exp = exp;
const mineBlocks = async (blocksToMine, provider) => {
    for (let i = 0; i < blocksToMine; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await provider.send("evm_mine", []);
    }
};
exports.mineBlocks = mineBlocks;
const incrementTime = async (ttl, provider) => {
    await provider.send("evm_increaseTime", [ttl]);
    await (0, exports.mineBlocks)(1, provider);
};
exports.incrementTime = incrementTime;
const increaseTime = async (timeToIncrease, provider) => {
    await provider.send("evm_increaseTime", [timeToIncrease]);
    await provider.send("evm_mine", []);
};
exports.increaseTime = increaseTime;
const formatNumber = (decimal) => (num) => {
    try {
        return num.div((0, exports.exp)(decimal - 8)).toNumber() / 10 ** 8;
    }
    catch (_error) {
        try {
            return num.div((0, exports.exp)(decimal)).toNumber();
        }
        catch (_error2) {
            error(`Cannot convert ${num.toString()} with ${decimal} decimals`);
            return NaN;
        }
    }
};
exports.formatNumber = formatNumber;
exports.formatWad = (0, exports.formatNumber)(18);
exports.formatRay = (0, exports.formatNumber)(27);
exports.formatRad = (0, exports.formatNumber)(45);
const printLedgerCollateralType = async (ledger, collateralType) => {
    const data = await ledger.collateralTypes(collateralType);
    const { normalizedDebt, accumulatedRate, safetyPrice, debtCeiling, debtFloor, } = data;
    info(`==== COLLATERAL TYPE (${collateralType}) ====`);
    info(`Normalized Debt: ${(0, exports.formatWad)(normalizedDebt)} WAD`);
    info(`Accumulated Rate: ${(0, exports.formatRay)(accumulatedRate)} RAY`);
    info(`Safety Price: ${(0, exports.formatRay)(safetyPrice)} RAY`);
    info(`Debt Ceiling: ${(0, exports.formatRad)(debtCeiling)} RAD`);
    info(`Debt Floor: ${(0, exports.formatRad)(debtFloor)} RAD`);
};
exports.printLedgerCollateralType = printLedgerCollateralType;
const printLedgerGlobals = async (ledger) => {
    const [totalDebt, totalUnbackedDebt, totalDebtCeiling] = await Promise.all([
        ledger.totalDebt(),
        ledger.totalUnbackedDebt(),
        ledger.totalDebtCeiling(),
    ]);
    info(`==== CORE ENGINE ====`);
    info(`Total Debt: ${(0, exports.formatRad)(totalDebt)} RAD`);
    info(`Total Unbacked Debt: ${(0, exports.formatRad)(totalUnbackedDebt)} RAD`);
    info(`Total Debt Ceiling: ${(0, exports.formatRad)(totalDebtCeiling)} RAD`);
};
exports.printLedgerGlobals = printLedgerGlobals;
const printLedgerPosition = async (ledger, collateralType, address) => {
    const { safetyPrice } = await ledger.collateralTypes(collateralType);
    const collateral = await ledger.collateral(collateralType, address);
    const debt = await ledger.debt(address);
    const position = await ledger.positions(collateralType, address);
    const { lockedCollateral, normalizedDebt, } = position;
    info(`==== POSITION (${address}) ====`);
    info(`Free Collateral: ${(0, exports.formatWad)(collateral)} WAD`);
    info(`Locked Collateral: ${(0, exports.formatWad)(lockedCollateral)} WAD`);
    info(`Normalized Debt: ${(0, exports.formatWad)(normalizedDebt)} WAD`);
    info(`Drawn Debt (stablecoin balance): ${(0, exports.formatRad)(debt)} RAD`);
    info(`Max Debt Before Liquidation: ${(0, exports.formatRad)(lockedCollateral.mul(safetyPrice))} RAD`);
};
exports.printLedgerPosition = printLedgerPosition;
