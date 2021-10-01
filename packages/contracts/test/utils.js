"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var debug_1 = require("../src/debug");
var _a = debug_1.getLogger("utils"), info = _a.info, error = _a.error;
exports.exp = function (exponent) {
    return ethers_1.BigNumber.from(10).pow(exponent);
};
exports.mineBlocks = function (blocksToMine, provider) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < blocksToMine)) return [3 /*break*/, 4];
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, provider.send("evm_mine", [])];
            case 2:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                _a.label = 3;
            case 3:
                i += 1;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.incrementTime = function (ttl, provider) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, provider.send("evm_increaseTime", [ttl])];
            case 1:
                _a.sent();
                return [4 /*yield*/, exports.mineBlocks(1, provider)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.increaseTime = function (timeToIncrease, provider) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, provider.send("evm_increaseTime", [timeToIncrease])];
            case 1:
                _a.sent();
                return [4 /*yield*/, provider.send("evm_mine", [])];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.formatNumber = function (decimal) {
    return function (num) {
        try {
            return num.div(exports.exp(decimal - 8)).toNumber() / Math.pow(10, 8);
        }
        catch (_error) {
            try {
                return num.div(exports.exp(decimal)).toNumber();
            }
            catch (_error2) {
                error("Cannot convert " + num.toString() + " with " + decimal + " decimals");
                return NaN;
            }
        }
    };
};
exports.formatWad = exports.formatNumber(18);
exports.formatRay = exports.formatNumber(27);
exports.formatRad = exports.formatNumber(45);
exports.printLedgerCollateralType = function (ledger, collateralType) { return __awaiter(void 0, void 0, void 0, function () {
    var data, normalizedDebt, accumulatedRate, safetyPrice, debtCeiling, debtFloor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ledger.collateralTypes(collateralType)];
            case 1:
                data = _a.sent();
                normalizedDebt = data.normalizedDebt, accumulatedRate = data.accumulatedRate, safetyPrice = data.safetyPrice, debtCeiling = data.debtCeiling, debtFloor = data.debtFloor;
                info("==== COLLATERAL TYPE (" + collateralType + ") ====");
                info("Normalized Debt: " + exports.formatWad(normalizedDebt) + " WAD");
                info("Accumulated Rate: " + exports.formatRay(accumulatedRate) + " RAY");
                info("Safety Price: " + exports.formatRay(safetyPrice) + " RAY");
                info("Debt Ceiling: " + exports.formatRad(debtCeiling) + " RAD");
                info("Debt Floor: " + exports.formatRad(debtFloor) + " RAD");
                return [2 /*return*/];
        }
    });
}); };
exports.printLedgerGlobals = function (ledger) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalDebt, totalUnbackedDebt, totalDebtCeiling;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    ledger.totalDebt(),
                    ledger.totalUnbackedDebt(),
                    ledger.totalDebtCeiling(),
                ])];
            case 1:
                _a = _b.sent(), totalDebt = _a[0], totalUnbackedDebt = _a[1], totalDebtCeiling = _a[2];
                info("==== CORE ENGINE ====");
                info("Total Debt: " + exports.formatRad(totalDebt) + " RAD");
                info("Total Unbacked Debt: " + exports.formatRad(totalUnbackedDebt) + " RAD");
                info("Total Debt Ceiling: " + exports.formatRad(totalDebtCeiling) + " RAD");
                return [2 /*return*/];
        }
    });
}); };
exports.printLedgerPosition = function (ledger, collateralType, address) { return __awaiter(void 0, void 0, void 0, function () {
    var safetyPrice, collateral, debt, position, lockedCollateral, normalizedDebt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ledger.collateralTypes(collateralType)];
            case 1:
                safetyPrice = (_a.sent()).safetyPrice;
                return [4 /*yield*/, ledger.collateral(collateralType, address)];
            case 2:
                collateral = _a.sent();
                return [4 /*yield*/, ledger.debt(address)];
            case 3:
                debt = _a.sent();
                return [4 /*yield*/, ledger.positions(collateralType, address)];
            case 4:
                position = _a.sent();
                lockedCollateral = position.lockedCollateral, normalizedDebt = position.normalizedDebt;
                info("==== POSITION (" + address + ") ====");
                info("Free Collateral: " + exports.formatWad(collateral) + " WAD");
                info("Locked Collateral: " + exports.formatWad(lockedCollateral) + " WAD");
                info("Normalized Debt: " + exports.formatWad(normalizedDebt) + " WAD");
                info("Drawn Debt (stablecoin balance): " + exports.formatRad(debt) + " RAD");
                info("Max Debt Before Liquidation: " + exports.formatRad(lockedCollateral.mul(safetyPrice)) + " RAD");
                return [2 /*return*/];
        }
    });
}); };
