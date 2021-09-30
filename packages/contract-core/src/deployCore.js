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
var deploymentParameter_1 = require("./deploymentParameter");
var cachedDeployments_1 = require("./cachedDeployments");
var utils_1 = require("../test/utils");
var MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
exports.deployCore = function (_a) {
    var network = _a.network, deploymentCache = _a.deploymentCache, transactionCache = _a.transactionCache;
    return __awaiter(void 0, void 0, void 0, function () {
        var transactionOverrides, _b, deployBeaconOrGetInstance, deployBeaconProxyOrGetInsance, deployOrGetInstance, deployUupsOrGetInstance, executeTransaction, collateralType, collateral, oracle, governanceToken, LogicStablecoin, LogicLedger, LogicCollateralJoin, LogicStablecoinJoin, LogicOracleRelayer, LogicSavingsAccount, LogicFeesEngine, LogicSurplusAuction, LogicDebtAuction, LogicAccountingEngine, LogicLiquidationEngine, LogicLiquidationAuction, LogicDiscountCalculator, stablecoin, BeaconLedger, BeaconCollateralJoin, BeaconStablecoinJoin, BeaconOracleRelayer, BeaconSavingsAccount, BeaconFeesEngine, BeaconSurplusAuction, BeaconDebtAuction, BeaconAccountingEngine, BeaconLiquidationEngine, BeaconLiquidationAuction, BeaconDiscountCalculator, ledger, collateralJoin, stablecoinJoin, oracleRelayer, savingsAccount, feesEngine, surplusAuction, debtAuction, accountingEngine, liquidationEngine, liquidationAuction, discountCalculator;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    transactionOverrides = { gasPrice: ethers_1.utils.parseUnits("10", "gwei") };
                    _b = cachedDeployments_1.buildCachedDeployments({
                        network: network,
                        deploymentCachePath: deploymentCache,
                        transactionCachePath: transactionCache,
                        skipDeploymentCache: false,
                        skipTransactionCache: false,
                        transactionOverrides: transactionOverrides
                    }), deployBeaconOrGetInstance = _b.deployBeaconOrGetInstance, deployBeaconProxyOrGetInsance = _b.deployBeaconProxyOrGetInsance, deployOrGetInstance = _b.deployOrGetInstance, deployUupsOrGetInstance = _b.deployUupsOrGetInstance, executeTransaction = _b.executeTransaction;
                    collateralType = "0x0000000000000000000000000000000000000000000000000000000000000001";
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "SimpleCollateral",
                            factory: "SimpleCollateral"
                        })];
                case 1:
                    collateral = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "SimpleOracle",
                            factory: "SimpleOracle"
                        })];
                case 2:
                    oracle = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "SimpleGovernanceToken",
                            factory: "SimpleGovernanceToken",
                            initArgs: []
                        })];
                case 3:
                    governanceToken = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicStablecoin",
                            factory: "Stablecoin",
                            initArgs: ["Bluejay Stablecoin Impl", "Bluejay Stablecoin Impl"]
                        })];
                case 4:
                    LogicStablecoin = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicLedger",
                            factory: "Ledger",
                            initArgs: []
                        })];
                case 5:
                    LogicLedger = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicCollateralJoin",
                            factory: "CollateralJoin",
                            initArgs: [ethers_1.constants.AddressZero, ethers_1.constants.HashZero, collateral.address]
                        })];
                case 6:
                    LogicCollateralJoin = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicStablecoinJoin",
                            factory: "StablecoinJoin",
                            initArgs: [ethers_1.constants.AddressZero, ethers_1.constants.AddressZero]
                        })];
                case 7:
                    LogicStablecoinJoin = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicOracleRelayer",
                            factory: "OracleRelayer",
                            initArgs: [ethers_1.constants.AddressZero]
                        })];
                case 8:
                    LogicOracleRelayer = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicSavingsAccount",
                            factory: "SavingsAccount",
                            initArgs: [ethers_1.constants.AddressZero]
                        })];
                case 9:
                    LogicSavingsAccount = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicFeesEngine",
                            factory: "FeesEngine",
                            initArgs: [ethers_1.constants.AddressZero]
                        })];
                case 10:
                    LogicFeesEngine = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicSurplusAuction",
                            factory: "SurplusAuction",
                            initArgs: [ethers_1.constants.AddressZero, ethers_1.constants.AddressZero]
                        })];
                case 11:
                    LogicSurplusAuction = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicDebtAuction",
                            factory: "DebtAuction",
                            initArgs: [ethers_1.constants.AddressZero, ethers_1.constants.AddressZero]
                        })];
                case 12:
                    LogicDebtAuction = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicAccountingEngine",
                            factory: "AccountingEngine",
                            initArgs: [
                                ethers_1.constants.AddressZero,
                                ethers_1.constants.AddressZero,
                                ethers_1.constants.AddressZero,
                            ]
                        })];
                case 13:
                    LogicAccountingEngine = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicLiquidationEngine",
                            factory: "LiquidationEngine",
                            initArgs: [ethers_1.constants.AddressZero]
                        })];
                case 14:
                    LogicLiquidationEngine = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicLiquidationAuction",
                            factory: "LiquidationAuction",
                            initArgs: [
                                ethers_1.constants.AddressZero,
                                ethers_1.constants.AddressZero,
                                ethers_1.constants.AddressZero,
                                collateralType,
                            ]
                        })];
                case 15:
                    LogicLiquidationAuction = _c.sent();
                    return [4 /*yield*/, deployOrGetInstance({
                            key: "LogicDiscountCalculator",
                            factory: "StairstepExponentialDecrease",
                            initArgs: []
                        })];
                case 16:
                    LogicDiscountCalculator = _c.sent();
                    return [4 /*yield*/, deployUupsOrGetInstance({
                            key: "ProxyStablecoin",
                            factory: "Stablecoin",
                            args: ["Myanmar Kyat Tracker", "MMKT"],
                            implementationAddress: LogicStablecoin.address
                        })];
                case 17:
                    stablecoin = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicLedger.address,
                            key: "BeaconLedger"
                        })];
                case 18:
                    BeaconLedger = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicCollateralJoin.address,
                            key: "BeaconCollateralJoin"
                        })];
                case 19:
                    BeaconCollateralJoin = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicStablecoinJoin.address,
                            key: "BeaconStablecoinJoin"
                        })];
                case 20:
                    BeaconStablecoinJoin = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicOracleRelayer.address,
                            key: "BeaconOracleRelayer"
                        })];
                case 21:
                    BeaconOracleRelayer = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicSavingsAccount.address,
                            key: "BeaconSavingsAccount"
                        })];
                case 22:
                    BeaconSavingsAccount = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicFeesEngine.address,
                            key: "BeaconFeesEngine"
                        })];
                case 23:
                    BeaconFeesEngine = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicSurplusAuction.address,
                            key: "BeaconSurplusAuction"
                        })];
                case 24:
                    BeaconSurplusAuction = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicDebtAuction.address,
                            key: "BeaconDebtAuction"
                        })];
                case 25:
                    BeaconDebtAuction = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicAccountingEngine.address,
                            key: "BeaconAccountingEngine"
                        })];
                case 26:
                    BeaconAccountingEngine = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicLiquidationEngine.address,
                            key: "BeaconLiquidationEngine"
                        })];
                case 27:
                    BeaconLiquidationEngine = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicLiquidationAuction.address,
                            key: "BeaconLiquidationAuction"
                        })];
                case 28:
                    BeaconLiquidationAuction = _c.sent();
                    return [4 /*yield*/, deployBeaconOrGetInstance({
                            address: LogicDiscountCalculator.address,
                            key: "BeaconDiscountCalculator"
                        })];
                case 29:
                    BeaconDiscountCalculator = _c.sent();
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyLedger",
                            factory: "Ledger",
                            args: [],
                            beacon: BeaconLedger.address
                        })];
                case 30:
                    ledger = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyCollateralJoin",
                            factory: "CollateralJoin",
                            args: [ledger.address, collateralType, collateral.address],
                            beacon: BeaconCollateralJoin.address
                        })];
                case 31:
                    collateralJoin = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyStablecoinJoin",
                            factory: "StablecoinJoin",
                            args: [ledger.address, stablecoin.address],
                            beacon: BeaconStablecoinJoin.address
                        })];
                case 32:
                    stablecoinJoin = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyOracleRelayer",
                            factory: "OracleRelayer",
                            args: [ledger.address],
                            beacon: BeaconOracleRelayer.address
                        })];
                case 33:
                    oracleRelayer = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxySavingsAccount",
                            factory: "SavingsAccount",
                            args: [ledger.address],
                            beacon: BeaconSavingsAccount.address
                        })];
                case 34:
                    savingsAccount = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyFeesEngine",
                            factory: "FeesEngine",
                            args: [ledger.address],
                            beacon: BeaconFeesEngine.address
                        })];
                case 35:
                    feesEngine = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxySurplusAuction",
                            factory: "SurplusAuction",
                            args: [ledger.address, governanceToken.address],
                            beacon: BeaconSurplusAuction.address
                        })];
                case 36:
                    surplusAuction = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyDebtAuction",
                            factory: "DebtAuction",
                            args: [ledger.address, governanceToken.address],
                            beacon: BeaconDebtAuction.address
                        })];
                case 37:
                    debtAuction = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyAccountingEngine",
                            factory: "AccountingEngine",
                            args: [ledger.address, surplusAuction.address, debtAuction.address],
                            beacon: BeaconAccountingEngine.address
                        })];
                case 38:
                    accountingEngine = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyLiquidationEngine",
                            factory: "LiquidationEngine",
                            args: [ledger.address],
                            beacon: BeaconLiquidationEngine.address
                        })];
                case 39:
                    liquidationEngine = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyLiquidationAuction",
                            factory: "LiquidationAuction",
                            args: [
                                ledger.address,
                                oracleRelayer.address,
                                liquidationEngine.address,
                                collateralType,
                            ],
                            beacon: BeaconLiquidationAuction.address
                        })];
                case 40:
                    liquidationAuction = (_c.sent()).implementation;
                    return [4 /*yield*/, deployBeaconProxyOrGetInsance({
                            key: "ProxyDiscountCalculator",
                            factory: "StairstepExponentialDecrease",
                            args: [],
                            beacon: BeaconDiscountCalculator.address
                        })];
                case 41:
                    discountCalculator = (_c.sent()).implementation;
                    // Periphery setup
                    return [4 /*yield*/, executeTransaction({
                            contract: oracle,
                            key: "ORACLE_SET_PRICE",
                            method: "setPrice",
                            args: [utils_1.exp(18).mul(1500)]
                        })];
                case 42:
                    // Periphery setup
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: governanceToken,
                            key: "GOVERNANCE_TOKEN_SET_MINTER_DEBT_AUCTION",
                            method: "grantRole",
                            args: [MINTER_ROLE, debtAuction.address]
                        })];
                case 43:
                    _c.sent();
                    // Auth
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_ORACLE_RELAYER",
                            method: "grantAuthorization",
                            args: [oracleRelayer.address]
                        })];
                case 44:
                    // Auth
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_COLLATERAL_JOIN",
                            method: "grantAuthorization",
                            args: [collateralJoin.address]
                        })];
                case 45:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_STABLECOIN_JOIN",
                            method: "grantAuthorization",
                            args: [stablecoinJoin.address]
                        })];
                case 46:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_SAVING_ACCOUNT",
                            method: "grantAuthorization",
                            args: [savingsAccount.address]
                        })];
                case 47:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_FEES_ENGINE",
                            method: "grantAuthorization",
                            args: [feesEngine.address]
                        })];
                case 48:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_ACCOUNTING_ENGINE",
                            method: "grantAuthorization",
                            args: [accountingEngine.address]
                        })];
                case 49:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_LIQUIDATION_ENGINE",
                            method: "grantAuthorization",
                            args: [liquidationEngine.address]
                        })];
                case 50:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_LIQUIDATION_AUCTION",
                            method: "grantAuthorization",
                            args: [liquidationAuction.address]
                        })];
                case 51:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_DEBT_AUCTION",
                            method: "grantAuthorization",
                            args: [debtAuction.address]
                        })];
                case 52:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_AUTH_SURPLUS_AUCTION",
                            method: "grantAuthorization",
                            args: [surplusAuction.address]
                        })];
                case 53:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_AUTH_LIQUIDATION_ENGINE",
                            method: "grantAuthorization",
                            args: [liquidationEngine.address]
                        })];
                case 54:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_AUTH_LIQUIDATION_ENGINE",
                            method: "grantAuthorization",
                            args: [liquidationEngine.address]
                        })];
                case 55:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_AUTH_LIQUIDATION_AUCTION",
                            method: "grantAuthorization",
                            args: [liquidationAuction.address]
                        })];
                case 56:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: surplusAuction,
                            key: "SURPLUS_AUCTION_AUTH_ACCOUNTING_ENGINE",
                            method: "grantAuthorization",
                            args: [accountingEngine.address]
                        })];
                case 57:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: debtAuction,
                            key: "DEBT_AUCTION_AUTH_ACCOUNTING_ENGINE",
                            method: "grantAuthorization",
                            args: [accountingEngine.address]
                        })];
                case 58:
                    _c.sent();
                    // Initializations
                    return [4 /*yield*/, executeTransaction({
                            contract: stablecoin,
                            key: "STABLECOING_GRANT_ROLE_STABLECOIN_JOIN",
                            method: "grantRole",
                            args: [MINTER_ROLE, stablecoinJoin.address]
                        })];
                case 59:
                    // Initializations
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_INITIALIZE_COLLATERAL_TYPE",
                            method: "initializeCollateralType",
                            args: [deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE]
                        })];
                case 60:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_UPDATE_DEBT_CEILING",
                            method: "updateDebtCeiling",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.LEDGER_COLLATERAL_DEBT_CEILING,
                            ]
                        })];
                case 61:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_UPDATE_DEBT_FLOOR",
                            method: "updateDebtFloor",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.LEDGER_COLLATERAL_DEBT_FLOOR,
                            ]
                        })];
                case 62:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: ledger,
                            key: "LEDGER_UPDATE_TOTAL_DEBT_FLOOR",
                            method: "updateTotalDebtCeiling",
                            args: [deploymentParameter_1.deploymentParameters.LEDGER_COLLATERAL_TOTAL_DEBT_CEILING]
                        })];
                case 63:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: oracleRelayer,
                            key: "ORACLE_RELAYER_UPDATE_ORACLE",
                            method: "updateOracle",
                            args: [deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE, oracle.address]
                        })];
                case 64:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: oracleRelayer,
                            key: "ORACLE_RELAYER_UPDATE_COLLATERALIZATION_RATIO",
                            method: "updateCollateralizationRatio",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.ORACLE_RELAYER_COLLATERALIZATION_RATIO,
                            ]
                        })];
                case 65:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: oracleRelayer,
                            key: "ORACLE_RELAYER_UPDATE_COLLATERAL_PRICE",
                            method: "updateCollateralPrice",
                            args: [deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE]
                        })];
                case 66:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: savingsAccount,
                            key: "SAVINGS_ACCOUNT_UPDATE_SAVINGS_RATE",
                            method: "updateSavingsRate",
                            args: [deploymentParameter_1.deploymentParameters.SAVINGS_ACCOUNT_SAVINGS_RATE]
                        })];
                case 67:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: savingsAccount,
                            key: "SAVINGS_ACCOUNT_UPDATE_ACCOUNTING_ENGINE",
                            method: "updateAccountingEngine",
                            args: [accountingEngine.address]
                        })];
                case 68:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: feesEngine,
                            key: "FEES_ENGINE_INITIALIZE_COLLATERAL",
                            method: "initializeCollateral",
                            args: [deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE]
                        })];
                case 69:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: feesEngine,
                            key: "FEES_ENGINE_UPDATE_ACCOUNTING_ENGINE",
                            method: "updateAccountingEngine",
                            args: [accountingEngine.address]
                        })];
                case 70:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: feesEngine,
                            key: "FEES_ENGINE_UPDATE_STABILITY_FEE",
                            method: "updateStabilityFee",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.FEES_ENGINE_STABILITY_FEE,
                            ]
                        })];
                case 71:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: feesEngine,
                            key: "FEES_ENGINE_UPDATE_GLOBAL_STABILITY_FEE",
                            method: "updateGlobalStabilityFee",
                            args: [deploymentParameter_1.deploymentParameters.FEES_ENGINE_GLOBAL_STABILITY_FEE]
                        })];
                case 72:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_UPDATE_DEBT_DELAY",
                            method: "updatePopDebtDelay",
                            args: [deploymentParameter_1.deploymentParameters.ACCOUNTING_ENGINE_DEBT_DELAY]
                        })];
                case 73:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_UPDATE_SURPLUS_AUCTION_LOT_SIZE",
                            method: "updateSurplusAuctionLotSize",
                            args: [deploymentParameter_1.deploymentParameters.ACCOUNTING_ENGINE_SURPLUS_AUCTION_LOT_SIZE]
                        })];
                case 74:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_UPDATE_SURPLUS_BUFFER",
                            method: "updateSurplusBuffer",
                            args: [deploymentParameter_1.deploymentParameters.ACCOUNTING_ENGINE_SURPLUS_BUFFER]
                        })];
                case 75:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_BID",
                            method: "updateIntialDebtAuctionBid",
                            args: [deploymentParameter_1.deploymentParameters.ACCOUNTING_ENGINE_DEBT_AUCTION_BID]
                        })];
                case 76:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: accountingEngine,
                            key: "ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_LOT_SIZE",
                            method: "updateDebtAuctionLotSize",
                            args: [deploymentParameter_1.deploymentParameters.ACCOUNTING_ENGINE_DEBT_AUCTION_LOT_SIZE]
                        })];
                case 77:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_UPDATE_ACCOUNTING_ENGINE",
                            method: "updateAccountingEngine",
                            args: [accountingEngine.address]
                        })];
                case 78:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_UPDATE_GLOBAL_MAX_DEBT_IN_ACTIVE_AUCTION",
                            method: "updateGlobalMaxDebtForActiveAuctions",
                            args: [
                                deploymentParameter_1.deploymentParameters.LIQUIDATION_ENGINE_GLOBAL_MAX_DEBT_IN_ACTIVE_AUCTION,
                            ]
                        })];
                case 79:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_PENALTY",
                            method: "updateLiquidatonPenalty",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.LIQUIDATION_ENGINE_LIQUIDATION_PENALTY,
                            ]
                        })];
                case 80:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_UPDATE_MAX_DEBT_IN_ACTIVE_AUCTION",
                            method: "updateMaxDebtForActiveAuctions",
                            args: [
                                deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE,
                                deploymentParameter_1.deploymentParameters.LIQUIDATION_ENGINE_MAX_DEBT_IN_ACTIVE_AUCTION,
                            ]
                        })];
                case 81:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationEngine,
                            key: "LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_AUCTION",
                            method: "updateLiquidationAuction",
                            args: [deploymentParameter_1.deploymentParameters.COLLATERAL_TYPE, liquidationAuction.address]
                        })];
                case 82:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_STARTING_PRICE_FACTOR",
                            method: "updateStartingPriceFactor",
                            args: [deploymentParameter_1.deploymentParameters.LIQUIDATION_AUCTION_STARTING_PRICE_FACTOR]
                        })];
                case 83:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_MAX_AUCTION_DURATION",
                            method: "updateMaxAuctionDuration",
                            args: [deploymentParameter_1.deploymentParameters.LIQUIDATION_AUCTION_MAX_AUCTION_DURATION]
                        })];
                case 84:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_MAX_PRICE_DISCOUNT",
                            method: "updateMaxPriceDiscount",
                            args: [deploymentParameter_1.deploymentParameters.LIQUIDATION_AUCTION_MAX_PRICE_DISCOUNT]
                        })];
                case 85:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_KEEPER_REWARD_FACTOR",
                            method: "updateKeeperRewardFactor",
                            args: [deploymentParameter_1.deploymentParameters.LIQUIDATION_AUCTION_KEEPER_REWARD_FACTOR]
                        })];
                case 86:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_KEEPER_INCENTIVE",
                            method: "updateKeeperIncentive",
                            args: [deploymentParameter_1.deploymentParameters.LIQUIDATION_AUCTION_KEEPER_INCENTIVE]
                        })];
                case 87:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_ACCOUNTING_ENGINE",
                            method: "updateAccountingEngine",
                            args: [accountingEngine.address]
                        })];
                case 88:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: liquidationAuction,
                            key: "LIQUIDATION_AUCTION_UPDATE_DISCOUNT_CALCULATOR",
                            method: "updateDiscountCalculator",
                            args: [discountCalculator.address]
                        })];
                case 89:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: discountCalculator,
                            key: "DISCOUNT_CALCULATOR_UPDATE_STEP",
                            method: "updateStep",
                            args: [deploymentParameter_1.deploymentParameters.DISCOUNT_CALCULATOR_STEP]
                        })];
                case 90:
                    _c.sent();
                    return [4 /*yield*/, executeTransaction({
                            contract: discountCalculator,
                            key: "DISCOUNT_CALCULATOR_UPDATE_FACTOR_PER_STEP",
                            method: "updateFactorPerStep",
                            args: [deploymentParameter_1.deploymentParameters.DISCOUNT_CALCULATOR_FACTOR_PER_STEP]
                        })];
                case 91:
                    _c.sent();
                    return [2 /*return*/, {
                            collateral: collateral,
                            oracle: oracle,
                            governanceToken: governanceToken,
                            stablecoin: stablecoin,
                            collateralType: collateralType,
                            collateralJoin: collateralJoin,
                            stablecoinJoin: stablecoinJoin,
                            ledger: ledger,
                            savingsAccount: savingsAccount,
                            oracleRelayer: oracleRelayer,
                            feesEngine: feesEngine,
                            surplusAuction: surplusAuction,
                            debtAuction: debtAuction,
                            accountingEngine: accountingEngine,
                            liquidationEngine: liquidationEngine,
                            liquidationAuction: liquidationAuction,
                            discountCalculator: discountCalculator
                        }];
            }
        });
    });
};
