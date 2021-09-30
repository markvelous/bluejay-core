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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var hardhat_1 = require("hardhat");
var fs_1 = require("fs");
var debug_1 = require("./debug");
var info = debug_1.getLogger("cachedDeployments").info;
var buildDeploymentCache = function (network, cache) {
    if (!fs_1.existsSync(cache))
        fs_1.writeFileSync(cache, "{}");
    var deployments = JSON.parse(fs_1.readFileSync(cache).toString());
    if (!deployments[network])
        deployments[network] = {};
    return {
        isDeployed: function (key) { return !!deployments[network][key]; },
        deployedAddress: function (key) {
            return deployments[network][key];
        },
        updateDeployment: function (key, address) {
            deployments[network][key] = address;
            fs_1.writeFileSync(cache, JSON.stringify(deployments, null, 2));
        }
    };
};
var buildTransactionCache = function (network, cache) {
    if (!fs_1.existsSync(cache))
        fs_1.writeFileSync(cache, "{}");
    var transactions = JSON.parse(fs_1.readFileSync(cache).toString());
    if (!transactions[network])
        transactions[network] = {};
    return {
        isExecuted: function (key) { return !!transactions[network][key]; },
        setExecution: function (key) {
            transactions[network][key] = true;
            fs_1.writeFileSync(cache, JSON.stringify(transactions, null, 2));
        }
    };
};
var getInitializerData = function (ImplFactory, args) {
    var fragment = ImplFactory.interface.getFunction("initialize");
    return ImplFactory.interface.encodeFunctionData(fragment, args);
};
exports.buildCachedDeployments = function (_a) {
    var deploymentCachePath = _a.deploymentCachePath, transactionCachePath = _a.transactionCachePath, network = _a.network, skipDeploymentCache = _a.skipDeploymentCache, skipTransactionCache = _a.skipTransactionCache, _b = _a.transactionOverrides, transactionOverrides = _b === void 0 ? {} : _b;
    var deploymentCache = buildDeploymentCache(network, deploymentCachePath);
    var deployedAddress = deploymentCache.deployedAddress, updateDeployment = deploymentCache.updateDeployment;
    var transactionCache = buildTransactionCache(network, transactionCachePath);
    var isExecuted = transactionCache.isExecuted, setExecution = transactionCache.setExecution;
    var deployUupsOrGetInstance = function (_a) {
        var key = _a.key, implementationAddress = _a.implementationAddress, factory = _a.factory, _b = _a.args, args = _b === void 0 ? [] : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var ProxyFactory, ImplementationFactory, cachedAddr, initilizeData, proxy, implementation;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, hardhat_1.ethers.getContractFactory("ERC1967Proxy")];
                    case 1:
                        ProxyFactory = _c.sent();
                        return [4 /*yield*/, hardhat_1.ethers.getContractFactory(factory)];
                    case 2:
                        ImplementationFactory = _c.sent();
                        cachedAddr = deployedAddress(key);
                        if (cachedAddr && !skipDeploymentCache) {
                            info(key + " loaded from cache at " + cachedAddr);
                            return [2 /*return*/, {
                                    proxy: ProxyFactory.attach(cachedAddr),
                                    implementation: ImplementationFactory.attach(cachedAddr)
                                }];
                        }
                        initilizeData = args
                            ? getInitializerData(ImplementationFactory, args)
                            : "0x";
                        return [4 /*yield*/, ProxyFactory.deploy(implementationAddress, initilizeData, transactionOverrides)];
                    case 3:
                        proxy = _c.sent();
                        return [4 /*yield*/, proxy.deployed()];
                    case 4:
                        _c.sent();
                        updateDeployment(key, proxy.address);
                        info(key + " deployed at " + proxy.address);
                        implementation = ImplementationFactory.attach(proxy.address);
                        return [2 /*return*/, {
                                proxy: proxy,
                                implementation: implementation
                            }];
                }
            });
        });
    };
    var deployOrGetInstance = function (_a) {
        var key = _a.key, factory = _a.factory, _b = _a.args, args = _b === void 0 ? [] : _b, initArgs = _a.initArgs;
        return __awaiter(void 0, void 0, void 0, function () {
            var Factory, cachedAddr, deployedContract;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, hardhat_1.ethers.getContractFactory(factory)];
                    case 1:
                        Factory = _c.sent();
                        cachedAddr = deployedAddress(key);
                        if (cachedAddr && !skipDeploymentCache) {
                            info(key + " loaded from cache at " + cachedAddr);
                            return [2 /*return*/, Factory.attach(cachedAddr)];
                        }
                        return [4 /*yield*/, Factory.deploy.apply(Factory, __spreadArrays(args, [transactionOverrides]))];
                    case 2:
                        deployedContract = _c.sent();
                        return [4 /*yield*/, deployedContract.deployed()];
                    case 3:
                        _c.sent();
                        updateDeployment(key, deployedContract.address);
                        info(key + " deployed at " + deployedContract.address);
                        if (!initArgs) return [3 /*break*/, 5];
                        return [4 /*yield*/, deployedContract.initialize.apply(deployedContract, __spreadArrays(initArgs, [transactionOverrides]))];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [2 /*return*/, deployedContract];
                }
            });
        });
    };
    var deployBeaconOrGetInstance = function (_a) {
        var address = _a.address, key = _a.key;
        return __awaiter(void 0, void 0, void 0, function () {
            var Beacon, cachedAddr, beacon;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, hardhat_1.ethers.getContractFactory("UpgradeableBeacon")];
                    case 1:
                        Beacon = _b.sent();
                        cachedAddr = deployedAddress(key);
                        if (cachedAddr && !skipDeploymentCache) {
                            info(key + " loaded from cache at " + cachedAddr);
                            return [2 /*return*/, Beacon.attach(cachedAddr)];
                        }
                        return [4 /*yield*/, Beacon.deploy(address, transactionOverrides)];
                    case 2:
                        beacon = _b.sent();
                        return [4 /*yield*/, beacon.deployed()];
                    case 3:
                        _b.sent();
                        updateDeployment(key, beacon.address);
                        info(key + " deployed at " + beacon.address);
                        return [2 /*return*/, beacon];
                }
            });
        });
    };
    var deployBeaconProxyOrGetInsance = function (_a) {
        var beacon = _a.beacon, key = _a.key, factory = _a.factory, args = _a.args;
        return __awaiter(void 0, void 0, void 0, function () {
            var ProxyFactory, ImplementationFactory, cachedAddr, initilizeData, proxy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, hardhat_1.ethers.getContractFactory("BeaconProxy")];
                    case 1:
                        ProxyFactory = _b.sent();
                        return [4 /*yield*/, hardhat_1.ethers.getContractFactory(factory)];
                    case 2:
                        ImplementationFactory = _b.sent();
                        cachedAddr = deployedAddress(key);
                        if (cachedAddr && !skipDeploymentCache) {
                            info(key + " loaded from cache at " + cachedAddr);
                            return [2 /*return*/, {
                                    proxy: ProxyFactory.attach(cachedAddr),
                                    implementation: ImplementationFactory.attach(cachedAddr)
                                }];
                        }
                        initilizeData = args
                            ? getInitializerData(ImplementationFactory, args)
                            : "0x";
                        return [4 /*yield*/, ProxyFactory.deploy(beacon, initilizeData, transactionOverrides)];
                    case 3:
                        proxy = _b.sent();
                        return [4 /*yield*/, proxy.deployed()];
                    case 4:
                        _b.sent();
                        updateDeployment(key, proxy.address);
                        info(key + " deployed at " + proxy.address);
                        return [2 /*return*/, {
                                proxy: proxy,
                                implementation: ImplementationFactory.attach(proxy.address)
                            }];
                }
            });
        });
    };
    var executeTransaction = function (_a) {
        var contract = _a.contract, method = _a.method, key = _a.key, _b = _a.args, args = _b === void 0 ? [] : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var hasExecuted, receipt, tx;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        hasExecuted = isExecuted(key);
                        if (!(!hasExecuted || skipTransactionCache)) return [3 /*break*/, 3];
                        return [4 /*yield*/, contract[method].apply(contract, __spreadArrays(args, [transactionOverrides]))];
                    case 1:
                        receipt = _c.sent();
                        return [4 /*yield*/, receipt.wait()];
                    case 2:
                        tx = _c.sent();
                        setExecution(key);
                        info("Executed " + key + ": " + tx.transactionHash);
                        return [3 /*break*/, 4];
                    case 3:
                        info("Skipping " + key + " on " + contract.address);
                        _c.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return {
        deploymentCache: deploymentCache,
        transactionCache: transactionCache,
        deployOrGetInstance: deployOrGetInstance,
        deployUupsOrGetInstance: deployUupsOrGetInstance,
        deployBeaconProxyOrGetInsance: deployBeaconProxyOrGetInsance,
        deployBeaconOrGetInstance: deployBeaconOrGetInstance,
        executeTransaction: executeTransaction
    };
};
