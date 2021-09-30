import { network, ethers } from "hardhat";
import { constants, utils } from "ethers";
import { deploymentParameters } from "./deployment-parameter";
import { getLogger, enableAllLog } from "../src/debug";
import { buildCachedDeployments } from "../src/cachedDeployments";
import { exp } from "../test/utils";

const { error } = getLogger("deployCore");

const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const TRANSACTION_CACHE_PATH = `${__dirname}/core-transaction-cache.json`;

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export const deployCore = async () => {
  const transactionOverrides = { gasPrice: utils.parseUnits("10", "gwei") };
  const {
    deployBeaconOrGetInstance,
    deployBeaconProxyOrGetInsance,
    deployOrGetInstance,
    deployUupsOrGetInstance,
    executeTransaction,
  } = buildCachedDeployments({
    network: network.name,
    deploymentCachePath: DEPLOYMENT_CACHE_PATH,
    transactionCachePath: TRANSACTION_CACHE_PATH,
    skipDeploymentCache: false,
    skipTransactionCache: false,
    transactionOverrides,
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

  // Periphery setup
  await executeTransaction({
    contract: oracle,
    key: "ORACLE_SET_PRICE",
    method: "setPrice",
    args: [exp(18).mul(1500)],
  });
  await executeTransaction({
    contract: governanceToken,
    key: "GOVERNANCE_TOKEN_SET_MINTER_DEBT_AUCTION",
    method: "grantRole",
    args: [MINTER_ROLE, debtAuction.address],
  });

  // Auth
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_ORACLE_RELAYER",
    method: "grantAuthorization",
    args: [oracleRelayer.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_COLLATERAL_JOIN",
    method: "grantAuthorization",
    args: [collateralJoin.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_STABLECOIN_JOIN",
    method: "grantAuthorization",
    args: [stablecoinJoin.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_SAVING_ACCOUNT",
    method: "grantAuthorization",
    args: [savingsAccount.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_FEES_ENGINE",
    method: "grantAuthorization",
    args: [feesEngine.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_ACCOUNTING_ENGINE",
    method: "grantAuthorization",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_LIQUIDATION_ENGINE",
    method: "grantAuthorization",
    args: [liquidationEngine.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_LIQUIDATION_AUCTION",
    method: "grantAuthorization",
    args: [liquidationAuction.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_DEBT_AUCTION",
    method: "grantAuthorization",
    args: [debtAuction.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_AUTH_SURPLUS_AUCTION",
    method: "grantAuthorization",
    args: [surplusAuction.address],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_AUTH_LIQUIDATION_ENGINE",
    method: "grantAuthorization",
    args: [liquidationEngine.address],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_AUTH_LIQUIDATION_ENGINE",
    method: "grantAuthorization",
    args: [liquidationEngine.address],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_AUTH_LIQUIDATION_AUCTION",
    method: "grantAuthorization",
    args: [liquidationAuction.address],
  });
  await executeTransaction({
    contract: surplusAuction,
    key: "SURPLUS_AUCTION_AUTH_ACCOUNTING_ENGINE",
    method: "grantAuthorization",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: debtAuction,
    key: "DEBT_AUCTION_AUTH_ACCOUNTING_ENGINE",
    method: "grantAuthorization",
    args: [accountingEngine.address],
  });

  // Initializations
  await executeTransaction({
    contract: stablecoin,
    key: "STABLECOING_GRANT_ROLE_STABLECOIN_JOIN",
    method: "grantRole",
    args: [MINTER_ROLE, stablecoinJoin.address],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_INITIALIZE_COLLATERAL_TYPE",
    method: "initializeCollateralType",
    args: [deploymentParameters.COLLATERAL_TYPE],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_UPDATE_DEBT_CEILING",
    method: "updateDebtCeiling",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.LEDGER_COLLATERAL_DEBT_CEILING,
    ],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_UPDATE_DEBT_FLOOR",
    method: "updateDebtFloor",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.LEDGER_COLLATERAL_DEBT_FLOOR,
    ],
  });
  await executeTransaction({
    contract: ledger,
    key: "LEDGER_UPDATE_TOTAL_DEBT_FLOOR",
    method: "updateTotalDebtCeiling",
    args: [deploymentParameters.LEDGER_COLLATERAL_TOTAL_DEBT_CEILING],
  });
  await executeTransaction({
    contract: oracleRelayer,
    key: "ORACLE_RELAYER_UPDATE_ORACLE",
    method: "updateOracle",
    args: [deploymentParameters.COLLATERAL_TYPE, oracle.address],
  });
  await executeTransaction({
    contract: oracleRelayer,
    key: "ORACLE_RELAYER_UPDATE_COLLATERALIZATION_RATIO",
    method: "updateCollateralizationRatio",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.ORACLE_RELAYER_COLLATERALIZATION_RATIO,
    ],
  });
  await executeTransaction({
    contract: oracleRelayer,
    key: "ORACLE_RELAYER_UPDATE_COLLATERAL_PRICE",
    method: "updateCollateralPrice",
    args: [deploymentParameters.COLLATERAL_TYPE],
  });
  await executeTransaction({
    contract: savingsAccount,
    key: "SAVINGS_ACCOUNT_UPDATE_SAVINGS_RATE",
    method: "updateSavingsRate",
    args: [deploymentParameters.SAVINGS_ACCOUNT_SAVINGS_RATE],
  });
  await executeTransaction({
    contract: savingsAccount,
    key: "SAVINGS_ACCOUNT_UPDATE_ACCOUNTING_ENGINE",
    method: "updateAccountingEngine",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: feesEngine,
    key: "FEES_ENGINE_INITIALIZE_COLLATERAL",
    method: "initializeCollateral",
    args: [deploymentParameters.COLLATERAL_TYPE],
  });
  await executeTransaction({
    contract: feesEngine,
    key: "FEES_ENGINE_UPDATE_ACCOUNTING_ENGINE",
    method: "updateAccountingEngine",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: feesEngine,
    key: "FEES_ENGINE_UPDATE_STABILITY_FEE",
    method: "updateStabilityFee",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.FEES_ENGINE_STABILITY_FEE,
    ],
  });
  await executeTransaction({
    contract: feesEngine,
    key: "FEES_ENGINE_UPDATE_GLOBAL_STABILITY_FEE",
    method: "updateGlobalStabilityFee",
    args: [deploymentParameters.FEES_ENGINE_GLOBAL_STABILITY_FEE],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_UPDATE_DEBT_DELAY",
    method: "updatePopDebtDelay",
    args: [deploymentParameters.ACCOUNTING_ENGINE_DEBT_DELAY],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_UPDATE_SURPLUS_AUCTION_LOT_SIZE",
    method: "updateSurplusAuctionLotSize",
    args: [deploymentParameters.ACCOUNTING_ENGINE_SURPLUS_AUCTION_LOT_SIZE],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_UPDATE_SURPLUS_BUFFER",
    method: "updateSurplusBuffer",
    args: [deploymentParameters.ACCOUNTING_ENGINE_SURPLUS_BUFFER],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_BID",
    method: "updateIntialDebtAuctionBid",
    args: [deploymentParameters.ACCOUNTING_ENGINE_DEBT_AUCTION_BID],
  });
  await executeTransaction({
    contract: accountingEngine,
    key: "ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_LOT_SIZE",
    method: "updateDebtAuctionLotSize",
    args: [deploymentParameters.ACCOUNTING_ENGINE_DEBT_AUCTION_LOT_SIZE],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_UPDATE_ACCOUNTING_ENGINE",
    method: "updateAccountingEngine",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_UPDATE_GLOBAL_MAX_DEBT_IN_ACTIVE_AUCTION",
    method: "updateGlobalMaxDebtForActiveAuctions",
    args: [
      deploymentParameters.LIQUIDATION_ENGINE_GLOBAL_MAX_DEBT_IN_ACTIVE_AUCTION,
    ],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_PENALTY",
    method: "updateLiquidatonPenalty",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.LIQUIDATION_ENGINE_LIQUIDATION_PENALTY,
    ],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_UPDATE_MAX_DEBT_IN_ACTIVE_AUCTION",
    method: "updateMaxDebtForActiveAuctions",
    args: [
      deploymentParameters.COLLATERAL_TYPE,
      deploymentParameters.LIQUIDATION_ENGINE_MAX_DEBT_IN_ACTIVE_AUCTION,
    ],
  });
  await executeTransaction({
    contract: liquidationEngine,
    key: "LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_AUCTION",
    method: "updateLiquidationAuction",
    args: [deploymentParameters.COLLATERAL_TYPE, liquidationAuction.address],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_STARTING_PRICE_FACTOR",
    method: "updateStartingPriceFactor",
    args: [deploymentParameters.LIQUIDATION_AUCTION_STARTING_PRICE_FACTOR],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_MAX_AUCTION_DURATION",
    method: "updateMaxAuctionDuration",
    args: [deploymentParameters.LIQUIDATION_AUCTION_MAX_AUCTION_DURATION],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_MAX_PRICE_DISCOUNT",
    method: "updateMaxPriceDiscount",
    args: [deploymentParameters.LIQUIDATION_AUCTION_MAX_PRICE_DISCOUNT],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_KEEPER_REWARD_FACTOR",
    method: "updateKeeperRewardFactor",
    args: [deploymentParameters.LIQUIDATION_AUCTION_KEEPER_REWARD_FACTOR],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_KEEPER_INCENTIVE",
    method: "updateKeeperIncentive",
    args: [deploymentParameters.LIQUIDATION_AUCTION_KEEPER_INCENTIVE],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_ACCOUNTING_ENGINE",
    method: "updateAccountingEngine",
    args: [accountingEngine.address],
  });
  await executeTransaction({
    contract: liquidationAuction,
    key: "LIQUIDATION_AUCTION_UPDATE_DISCOUNT_CALCULATOR",
    method: "updateDiscountCalculator",
    args: [discountCalculator.address],
  });
  await executeTransaction({
    contract: discountCalculator,
    key: "DISCOUNT_CALCULATOR_UPDATE_STEP",
    method: "updateStep",
    args: [deploymentParameters.DISCOUNT_CALCULATOR_STEP],
  });
  await executeTransaction({
    contract: discountCalculator,
    key: "DISCOUNT_CALCULATOR_UPDATE_FACTOR_PER_STEP",
    method: "updateFactorPerStep",
    args: [deploymentParameters.DISCOUNT_CALCULATOR_FACTOR_PER_STEP],
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
