import { network, ethers } from "hardhat";
import { constants, utils } from "ethers";
import { getLogger, enableAllLog } from "../src/debug";
import { buildCachedDeployments } from "../src/cachedDeployments";

const { error } = getLogger("deployCore");

const CACHE_PATH = `${__dirname}/core-cache.json`;

export const deployCore = async () => {
  const {
    deployBeaconOrGetInstance,
    deployBeaconProxyOrGetInsance,
    deployOrGetInstance,
    deployUupsOrGetInstance,
  } = buildCachedDeployments({
    network: network.name,
    cache: CACHE_PATH,
    skipCache: true,
    transactionOverrides: { gasPrice: utils.parseUnits("10", "gwei") },
  });
  const collateralType =
    "0x0000000000000000000000000000000000000000000000000000000000000001";

  // Test Fixtures
  const collateral = await deployOrGetInstance({
    key: "SimpleCollateral",
    factory: "SimpleCollateral",
  });
  const oracle = await deployOrGetInstance({
    key: "SimpleOracle",
    factory: "SimpleOracle",
  });
  const governanceToken = await deployOrGetInstance({
    key: "SimpleGovernanceToken",
    factory: "SimpleGovernanceToken",
    initArgs: [],
  });

  // Deploy implementations
  const LogicStablecoin = await deployOrGetInstance({
    key: "LogicStablecoin",
    factory: "Stablecoin",
    initArgs: ["Bluejay Stablecoin Impl", "Bluejay Stablecoin Impl"],
  });
  const LogicLedger = await deployOrGetInstance({
    key: "LogicLedger",
    factory: "Ledger",
    initArgs: [],
  });
  const LogicCollateralJoin = await deployOrGetInstance({
    key: "LogicCollateralJoin",
    factory: "CollateralJoin",
    initArgs: [constants.AddressZero, constants.HashZero, collateral.address],
  });
  const LogicStablecoinJoin = await deployOrGetInstance({
    key: "LogicStablecoinJoin",
    factory: "StablecoinJoin",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicOracleRelayer = await deployOrGetInstance({
    key: "LogicOracleRelayer",
    factory: "OracleRelayer",
    initArgs: [constants.AddressZero],
  });
  const LogicSavingsAccount = await deployOrGetInstance({
    key: "LogicSavingsAccount",
    factory: "SavingsAccount",
    initArgs: [constants.AddressZero],
  });
  const LogicFeesEngine = await deployOrGetInstance({
    key: "LogicFeesEngine",
    factory: "FeesEngine",
    initArgs: [constants.AddressZero],
  });
  const LogicSurplusAuction = await deployOrGetInstance({
    key: "LogicSurplusAuction",
    factory: "SurplusAuction",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicDebtAuction = await deployOrGetInstance({
    key: "LogicDebtAuction",
    factory: "DebtAuction",
    initArgs: [constants.AddressZero, constants.AddressZero],
  });
  const LogicAccountingEngine = await deployOrGetInstance({
    key: "LogicAccountingEngine",
    factory: "AccountingEngine",
    initArgs: [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
    ],
  });
  const LogicLiquidationEngine = await deployOrGetInstance({
    key: "LogicLiquidationEngine",
    factory: "LiquidationEngine",
    initArgs: [constants.AddressZero],
  });
  const LogicLiquidationAuction = await deployOrGetInstance({
    key: "LogicLiquidationAuction",
    factory: "LiquidationAuction",
    initArgs: [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      collateralType,
    ],
  });
  const LogicDiscountCalculator = await deployOrGetInstance({
    key: "LogicDiscountCalculator",
    factory: "StairstepExponentialDecrease",
    initArgs: [],
  });

  // Deploy uups
  const { implementation: stablecoin } = await deployUupsOrGetInstance({
    key: "ProxyStablecoin",
    factory: "Stablecoin",
    args: ["Myanmar Kyat Tracker", "MMKT"],
    implementationAddress: LogicStablecoin.address,
  });

  // Deploy beacons
  const BeaconLedger = await deployBeaconOrGetInstance({
    address: LogicLedger.address,
    key: "BeaconLedger",
  });
  const BeaconCollateralJoin = await deployBeaconOrGetInstance({
    address: LogicCollateralJoin.address,
    key: "BeaconCollateralJoin",
  });
  const BeaconStablecoinJoin = await deployBeaconOrGetInstance({
    address: LogicStablecoinJoin.address,
    key: "BeaconStablecoinJoin",
  });
  const BeaconOracleRelayer = await deployBeaconOrGetInstance({
    address: LogicOracleRelayer.address,
    key: "BeaconOracleRelayer",
  });
  const BeaconSavingsAccount = await deployBeaconOrGetInstance({
    address: LogicSavingsAccount.address,
    key: "BeaconSavingsAccount",
  });
  const BeaconFeesEngine = await deployBeaconOrGetInstance({
    address: LogicFeesEngine.address,
    key: "BeaconFeesEngine",
  });
  const BeaconSurplusAuction = await deployBeaconOrGetInstance({
    address: LogicSurplusAuction.address,
    key: "BeaconSurplusAuction",
  });
  const BeaconDebtAuction = await deployBeaconOrGetInstance({
    address: LogicDebtAuction.address,
    key: "BeaconDebtAuction",
  });
  const BeaconAccountingEngine = await deployBeaconOrGetInstance({
    address: LogicAccountingEngine.address,
    key: "BeaconAccountingEngine",
  });
  const BeaconLiquidationEngine = await deployBeaconOrGetInstance({
    address: LogicLiquidationEngine.address,
    key: "BeaconLiquidationEngine",
  });
  const BeaconLiquidationAuction = await deployBeaconOrGetInstance({
    address: LogicLiquidationAuction.address,
    key: "BeaconLiquidationAuction",
  });
  const BeaconDiscountCalculator = await deployBeaconOrGetInstance({
    address: LogicDiscountCalculator.address,
    key: "BeaconDiscountCalculator",
  });

  // Deploy beacon proxy
  const { implementation: ledger } = await deployBeaconProxyOrGetInsance({
    key: "ProxyLedger",
    factory: "Ledger",
    args: [],
    beacon: BeaconLedger.address,
  });
  const { implementation: collateralJoin } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyCollateralJoin",
      factory: "CollateralJoin",
      args: [ledger.address, collateralType, collateral.address],
      beacon: BeaconCollateralJoin.address,
    });
  const { implementation: stablecoinJoin } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyStablecoinJoin",
      factory: "StablecoinJoin",
      args: [ledger.address, stablecoin.address],
      beacon: BeaconStablecoinJoin.address,
    });
  const { implementation: oracleRelayer } = await deployBeaconProxyOrGetInsance(
    {
      key: "ProxyOracleRelayer",
      factory: "OracleRelayer",
      args: [ledger.address],
      beacon: BeaconOracleRelayer.address,
    }
  );
  const { implementation: savingsAccount } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxySavingsAccount",
      factory: "SavingsAccount",
      args: [ledger.address],
      beacon: BeaconSavingsAccount.address,
    });
  const { implementation: feesEngine } = await deployBeaconProxyOrGetInsance({
    key: "ProxyFeesEngine",
    factory: "FeesEngine",
    args: [ledger.address],
    beacon: BeaconFeesEngine.address,
  });
  const { implementation: surplusAuction } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxySurplusAuction",
      factory: "SurplusAuction",
      args: [ledger.address, governanceToken.address],
      beacon: BeaconSurplusAuction.address,
    });
  const { implementation: debtAuction } = await deployBeaconProxyOrGetInsance({
    key: "ProxyDebtAuction",
    factory: "DebtAuction",
    args: [ledger.address, governanceToken.address],
    beacon: BeaconDebtAuction.address,
  });
  const { implementation: accountingEngine } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyAccountingEngine",
      factory: "AccountingEngine",
      args: [ledger.address, surplusAuction.address, debtAuction.address],
      beacon: BeaconAccountingEngine.address,
    });
  const { implementation: liquidationEngine } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyLiquidationEngine",
      factory: "LiquidationEngine",
      args: [ledger.address],
      beacon: BeaconLiquidationEngine.address,
    });
  const { implementation: liquidationAuction } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyLiquidationAuction",
      factory: "LiquidationAuction",
      args: [
        ledger.address,
        oracleRelayer.address,
        liquidationEngine.address,
        collateralType,
      ],
      beacon: BeaconLiquidationAuction.address,
    });
  const { implementation: discountCalculator } =
    await deployBeaconProxyOrGetInsance({
      key: "ProxyDiscountCalculator",
      factory: "StairstepExponentialDecrease",
      args: [],
      beacon: BeaconDiscountCalculator.address,
    });

  return {
    collateral,
    oracle,
    governanceToken,
    stablecoin,
    collateralType,
    collateralJoin,
    stablecoinJoin,
    ledger,
    savingsAccount,
    oracleRelayer,
    feesEngine,
    surplusAuction,
    debtAuction,
    accountingEngine,
    liquidationEngine,
    liquidationAuction,
    discountCalculator,
  };
};

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
deployCore()
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
