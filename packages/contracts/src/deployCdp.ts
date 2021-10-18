/* eslint-disable no-await-in-loop */
import { Contract, constants, BigNumber } from "ethers";
import { buildCachedDeployments } from "./cachedDeployments";
import { UseDeployment } from "./types";
import { readDeploymentPlan } from "./deploymentPlan";

interface DeployCore {
  discountCalculator: Contract;
  liquidationEngine: Contract;
  accountingEngine: Contract;
  debtAuction: Contract;
  surplusAuction: Contract;
  feesEngine: Contract;
  savingsAccount: Contract;
  oracleRelayer: Contract;
  stablecoinJoin: Contract;
  ledger: Contract;
  stablecoin: Contract;
}

type CollateralSpecificContracts = {
  oracle: Contract;
  osm: Contract;
  collateralJoin: Contract;
  liquidationAuction: Contract;
};

const DUMMY_COLLATERAL_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export const deployCdp: UseDeployment<{ deploymentPlan: string }, DeployCore> =
  async (
    {
      deploymentPlan: deploymentPlanPath,
      deploymentCache,
      transactionCache,
      transactionOverrides,
    },
    hre
  ) => {
    const deploymentPlan = readDeploymentPlan(deploymentPlanPath);
    const {
      getInstance,
      deployOrGetInstance,
      deployUupsOrGetInstance,
      deployBeaconOrGetInstance,
      deployBeaconProxyOrGetInsance,
      executeTransaction,
    } = buildCachedDeployments({
      network: hre.network.name,
      deploymentCachePath: deploymentCache,
      transactionCachePath: transactionCache,
      skipDeploymentCache: false,
      skipTransactionCache: false,
      transactionOverrides,
      hre,
    });

    const stablecoinContext = deploymentPlan.stablecoin.symbol;

    // Load collateral token and governance token
    const governanceToken = await getInstance({
      key: "GovernanceToken",
      factory: "SimpleGovernanceToken",
    });
    const collateral: { [key: string]: Contract } = {};
    for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
      const { key } = deploymentPlan.collaterals[i];
      // eslint-disable-next-line no-await-in-loop
      collateral[key] = await getInstance({
        key: `Collateral[${key}]`,
        factory: "SimpleCollateral",
      });
    }

    // Deploy logic contracts
    const LogicOracle = await deployOrGetInstance({
      key: "LogicOracle",
      factory: "SingleFeedOracle",
      initArgs: [],
    });
    const LogicOSM = await deployOrGetInstance({
      key: "LogicOracleSecurityModule",
      factory: "OracleSecurityModule",
      initArgs: [constants.AddressZero],
    });
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
      initArgs: [
        constants.AddressZero,
        constants.HashZero,
        governanceToken.address,
      ],
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
        DUMMY_COLLATERAL_TYPE,
      ],
    });
    const LogicDiscountCalculator = await deployOrGetInstance({
      key: "LogicDiscountCalculator",
      factory: "StairstepExponentialDecrease",
      initArgs: [],
    });

    // Deploy beacons
    const BeaconOracle = await deployBeaconOrGetInstance({
      address: LogicOracle.address,
      key: "BeaconOracle",
    });
    const BeaconOSM = await deployBeaconOrGetInstance({
      address: LogicOSM.address,
      key: "BeaconOSM",
    });
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

    // Deploy stablecoin proxy
    const { implementation: stablecoin } = await deployUupsOrGetInstance({
      key: `[${stablecoinContext}]ProxyStablecoin`,
      factory: "Stablecoin",
      args: [deploymentPlan.stablecoin.name, deploymentPlan.stablecoin.symbol],
      implementationAddress: LogicStablecoin.address,
    });

    // Deploy proxies
    const { implementation: ledger } = await deployBeaconProxyOrGetInsance({
      key: `[${stablecoinContext}]ProxyLedger`,
      factory: "Ledger",
      args: [],
      beacon: BeaconLedger.address,
    });
    const { implementation: stablecoinJoin } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxyStablecoinJoin`,
        factory: "StablecoinJoin",
        args: [ledger.address, stablecoin.address],
        beacon: BeaconStablecoinJoin.address,
      });
    const { implementation: oracleRelayer } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxyOracleRelayer`,
        factory: "OracleRelayer",
        args: [ledger.address],
        beacon: BeaconOracleRelayer.address,
      });
    const { implementation: savingsAccount } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxySavingsAccount`,
        factory: "SavingsAccount",
        args: [ledger.address],
        beacon: BeaconSavingsAccount.address,
      });
    const { implementation: feesEngine } = await deployBeaconProxyOrGetInsance({
      key: `[${stablecoinContext}]ProxyFeesEngine`,
      factory: "FeesEngine",
      args: [ledger.address],
      beacon: BeaconFeesEngine.address,
    });
    const { implementation: surplusAuction } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxySurplusAuction`,
        factory: "SurplusAuction",
        args: [ledger.address, governanceToken.address],
        beacon: BeaconSurplusAuction.address,
      });
    const { implementation: debtAuction } = await deployBeaconProxyOrGetInsance(
      {
        key: `[${stablecoinContext}]ProxyDebtAuction`,
        factory: "DebtAuction",
        args: [ledger.address, governanceToken.address],
        beacon: BeaconDebtAuction.address,
      }
    );
    const { implementation: accountingEngine } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxyAccountingEngine`,
        factory: "AccountingEngine",
        args: [ledger.address, surplusAuction.address, debtAuction.address],
        beacon: BeaconAccountingEngine.address,
      });
    const { implementation: liquidationEngine } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxyLiquidationEngine`,
        factory: "LiquidationEngine",
        args: [ledger.address],
        beacon: BeaconLiquidationEngine.address,
      });
    const { implementation: discountCalculator } =
      await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}]ProxyDiscountCalculator`,
        factory: "StairstepExponentialDecrease",
        args: [],
        beacon: BeaconDiscountCalculator.address,
      });
    const collateralSpecificDeployment: {
      [collateralType: string]: CollateralSpecificContracts;
    } = {};
    for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
      const deploymentForCollateral: { [key: string]: Contract } = {};
      const { key, collateralType } = deploymentPlan.collaterals[i];

      const { implementation: oracle } = await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}][${key}]ProxyOracle`,
        factory: "SingleFeedOracle",
        args: [],
        beacon: BeaconOracle.address,
      });
      deploymentForCollateral.oracle = oracle;

      const { implementation: osm } = await deployBeaconProxyOrGetInsance({
        key: `[${stablecoinContext}][${key}]ProxyOSM`,
        factory: "OracleSecurityModule",
        args: [oracle.address],
        beacon: BeaconOSM.address,
      });
      deploymentForCollateral.osm = osm;

      const { implementation: collateralJoin } =
        await deployBeaconProxyOrGetInsance({
          key: `[${stablecoinContext}][${key}]ProxyCollateralJoin`,
          factory: "CollateralJoin",
          args: [ledger.address, collateralType, collateral[key].address],
          beacon: BeaconCollateralJoin.address,
        });
      deploymentForCollateral.collateralJoin = collateralJoin;

      const { implementation: liquidationAuction } =
        await deployBeaconProxyOrGetInsance({
          key: `[${stablecoinContext}][${key}]ProxyLiquidationAuction`,
          factory: "LiquidationAuction",
          args: [
            ledger.address,
            oracleRelayer.address,
            liquidationEngine.address,
            collateralType,
          ],
          beacon: BeaconLiquidationAuction.address,
        });
      deploymentForCollateral.liquidationAuction = liquidationAuction;
      collateralSpecificDeployment[key] =
        deploymentForCollateral as CollateralSpecificContracts;
    }

    // Allow debt auction to mint governance token
    if (deploymentPlan.governanceToken.grantMinterRole)
      await executeTransaction({
        contract: governanceToken,
        key: `[${stablecoinContext}]GOVERNANCE_TOKEN_SET_MINTER_DEBT_AUCTION`,
        method: "grantRole",
        args: [MINTER_ROLE, debtAuction.address],
      });

    // Auth
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_ORACLE_RELAYER`,
      method: "grantAuthorization",
      args: [oracleRelayer.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_STABLECOIN_JOIN`,
      method: "grantAuthorization",
      args: [stablecoinJoin.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_SAVING_ACCOUNT`,
      method: "grantAuthorization",
      args: [savingsAccount.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_FEES_ENGINE`,
      method: "grantAuthorization",
      args: [feesEngine.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_ACCOUNTING_ENGINE`,
      method: "grantAuthorization",
      args: [accountingEngine.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_LIQUIDATION_ENGINE`,
      method: "grantAuthorization",
      args: [liquidationEngine.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_DEBT_AUCTION`,
      method: "grantAuthorization",
      args: [debtAuction.address],
    });
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_AUTH_SURPLUS_AUCTION`,
      method: "grantAuthorization",
      args: [surplusAuction.address],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_AUTH_LIQUIDATION_ENGINE`,
      method: "grantAuthorization",
      args: [liquidationEngine.address],
    });
    await executeTransaction({
      contract: surplusAuction,
      key: `[${stablecoinContext}]SURPLUS_AUCTION_AUTH_ACCOUNTING_ENGINE`,
      method: "grantAuthorization",
      args: [accountingEngine.address],
    });
    await executeTransaction({
      contract: debtAuction,
      key: `[${stablecoinContext}]DEBT_AUCTION_AUTH_ACCOUNTING_ENGINE`,
      method: "grantAuthorization",
      args: [accountingEngine.address],
    });
    for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
      const { key } = deploymentPlan.collaterals[i];
      const { collateralJoin, liquidationAuction } =
        collateralSpecificDeployment[key];
      await executeTransaction({
        contract: ledger,
        key: `[${stablecoinContext}][${key}]LEDGER_AUTH_COLLATERAL_JOIN`,
        method: "grantAuthorization",
        args: [collateralJoin.address],
      });
      await executeTransaction({
        contract: ledger,
        key: `[${stablecoinContext}][${key}]LEDGER_AUTH_LIQUIDATION_AUCTION`,
        method: "grantAuthorization",
        args: [liquidationAuction.address],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_AUTH_LIQUIDATION_ENGINE`,
        method: "grantAuthorization",
        args: [liquidationEngine.address],
      });
      await executeTransaction({
        contract: liquidationEngine,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_ENGINE_AUTH_LIQUIDATION_AUCTION`,
        method: "grantAuthorization",
        args: [liquidationAuction.address],
      });
    }

    // Initializations
    await executeTransaction({
      contract: stablecoin,
      key: `[${stablecoinContext}]STABLECOIN_GRANT_ROLE_STABLECOIN_JOIN`,
      method: "grantRole",
      args: [MINTER_ROLE, stablecoinJoin.address],
    });
    for (let i = 0; i < deploymentPlan.collaterals.length; i += 1) {
      const {
        key,
        collateralType,
        debtCeiling,
        debtFloor,
        stabilityFee,
        collateralizationRatio,
        liquidationPenalty,
        maxDebtInActiveLiquidation,
        liquidationStartingPriceMultiplier,
        liquidationMaxDuration,
        liquidationMaxPriceDiscount,
        liquidationKeeperRewardFactor,
        liquidationKeeperIncentive,
        osmPriceDelay,
      } = deploymentPlan.collaterals[i];
      const { osm, liquidationAuction } = collateralSpecificDeployment[key];
      await executeTransaction({
        contract: ledger,
        key: `[${stablecoinContext}][${key}]LEDGER_INITIALIZE_COLLATERAL_TYPE`,
        method: "initializeCollateralType",
        args: [collateralType],
      });
      await executeTransaction({
        contract: ledger,
        key: `[${stablecoinContext}][${key}]LEDGER_UPDATE_DEBT_CEILING`,
        method: "updateDebtCeiling",
        args: [collateralType, BigNumber.from(debtCeiling)],
      });
      await executeTransaction({
        contract: ledger,
        key: `[${stablecoinContext}][${key}]LEDGER_UPDATE_DEBT_FLOOR`,
        method: "updateDebtFloor",
        args: [collateralType, BigNumber.from(debtFloor)],
      });
      await executeTransaction({
        contract: oracleRelayer,
        key: `[${stablecoinContext}][${key}]ORACLE_RELAYER_UPDATE_OSM`,
        method: "updateOracle",
        args: [collateralType, osm.address],
      });
      await executeTransaction({
        contract: oracleRelayer,
        key: `[${stablecoinContext}][${key}]ORACLE_RELAYER_UPDATE_COLLATERALIZATION_RATIO`,
        method: "updateCollateralizationRatio",
        args: [collateralType, BigNumber.from(collateralizationRatio)],
      });
      await executeTransaction({
        contract: feesEngine,
        key: `[${stablecoinContext}][${key}]FEES_ENGINE_INITIALIZE_COLLATERAL`,
        method: "initializeCollateral",
        args: [collateralType],
      });
      await executeTransaction({
        contract: feesEngine,
        key: `[${stablecoinContext}][${key}]FEES_ENGINE_UPDATE_STABILITY_FEE`,
        method: "updateStabilityFee",
        args: [collateralType, BigNumber.from(stabilityFee)],
      });
      await executeTransaction({
        contract: liquidationEngine,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_PENALTY`,
        method: "updateLiquidatonPenalty",
        args: [collateralType, BigNumber.from(liquidationPenalty)],
      });
      await executeTransaction({
        contract: liquidationEngine,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_ENGINE_UPDATE_MAX_DEBT_IN_ACTIVE_AUCTION`,
        method: "updateMaxDebtForActiveAuctions",
        args: [collateralType, BigNumber.from(maxDebtInActiveLiquidation)],
      });
      await executeTransaction({
        contract: liquidationEngine,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_ENGINE_UPDATE_LIQUIDATION_AUCTION`,
        method: "updateLiquidationAuction",
        args: [collateralType, liquidationAuction.address],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_STARTING_PRICE_FACTOR`,
        method: "updateStartingPriceFactor",
        args: [BigNumber.from(liquidationStartingPriceMultiplier)],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_MAX_AUCTION_DURATION`,
        method: "updateMaxAuctionDuration",
        args: [BigNumber.from(liquidationMaxDuration)],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_MAX_PRICE_DISCOUNT`,
        method: "updateMaxPriceDiscount",
        args: [BigNumber.from(liquidationMaxPriceDiscount)],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_KEEPER_REWARD_FACTOR`,
        method: "updateKeeperRewardFactor",
        args: [BigNumber.from(liquidationKeeperRewardFactor)],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_KEEPER_INCENTIVE`,
        method: "updateKeeperIncentive",
        args: [BigNumber.from(liquidationKeeperIncentive)],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_ACCOUNTING_ENGINE`,
        method: "updateAccountingEngine",
        args: [accountingEngine.address],
      });
      await executeTransaction({
        contract: liquidationAuction,
        key: `[${stablecoinContext}][${key}]LIQUIDATION_AUCTION_UPDATE_DISCOUNT_CALCULATOR`,
        method: "updateDiscountCalculator",
        args: [discountCalculator.address],
      });
      await executeTransaction({
        contract: osm,
        key: `[${stablecoinContext}][${key}]OSM_UPDATE_PRICE_DELAY`,
        method: "updatePriceDelay",
        args: [BigNumber.from(osmPriceDelay)],
      });
    }
    await executeTransaction({
      contract: ledger,
      key: `[${stablecoinContext}]LEDGER_UPDATE_TOTAL_DEBT_CEILING`,
      method: "updateTotalDebtCeiling",
      args: [BigNumber.from(deploymentPlan.global.debtCeiling)],
    });
    await executeTransaction({
      contract: savingsAccount,
      key: `[${stablecoinContext}]SAVINGS_ACCOUNT_UPDATE_SAVINGS_RATE`,
      method: "updateSavingsRate",
      args: [BigNumber.from(deploymentPlan.global.savingsRate)],
    });
    await executeTransaction({
      contract: savingsAccount,
      key: `[${stablecoinContext}]SAVINGS_ACCOUNT_UPDATE_ACCOUNTING_ENGINE`,
      method: "updateAccountingEngine",
      args: [accountingEngine.address],
    });

    await executeTransaction({
      contract: feesEngine,
      key: `[${stablecoinContext}]FEES_ENGINE_UPDATE_ACCOUNTING_ENGINE`,
      method: "updateAccountingEngine",
      args: [accountingEngine.address],
    });

    await executeTransaction({
      contract: feesEngine,
      key: `[${stablecoinContext}]FEES_ENGINE_UPDATE_GLOBAL_STABILITY_FEE`,
      method: "updateGlobalStabilityFee",
      args: [BigNumber.from(deploymentPlan.global.stabilityFee)],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_UPDATE_DEBT_DELAY`,
      method: "updatePopDebtDelay",
      args: [BigNumber.from(deploymentPlan.global.debtDelay)],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_UPDATE_SURPLUS_AUCTION_LOT_SIZE`,
      method: "updateSurplusAuctionLotSize",
      args: [BigNumber.from(deploymentPlan.global.surplusLotSize)],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_UPDATE_SURPLUS_BUFFER`,
      method: "updateSurplusBuffer",
      args: [BigNumber.from(deploymentPlan.global.surplusBuffer)],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_BID`,
      method: "updateIntialDebtAuctionBid",
      args: [BigNumber.from(deploymentPlan.global.debtLotInitialBid)],
    });
    await executeTransaction({
      contract: accountingEngine,
      key: `[${stablecoinContext}]ACCOUNTING_ENGINE_UPDATE_DEBT_AUCTION_LOT_SIZE`,
      method: "updateDebtAuctionLotSize",
      args: [BigNumber.from(deploymentPlan.global.debtLotSize)],
    });
    await executeTransaction({
      contract: liquidationEngine,
      key: `[${stablecoinContext}]LIQUIDATION_ENGINE_UPDATE_ACCOUNTING_ENGINE`,
      method: "updateAccountingEngine",
      args: [accountingEngine.address],
    });
    await executeTransaction({
      contract: liquidationEngine,
      key: `[${stablecoinContext}]LIQUIDATION_ENGINE_UPDATE_GLOBAL_MAX_DEBT_IN_ACTIVE_AUCTION`,
      method: "updateGlobalMaxDebtForActiveAuctions",
      args: [BigNumber.from(deploymentPlan.global.maxDebtInActiveLiquidation)],
    });

    await executeTransaction({
      contract: discountCalculator,
      key: `[${stablecoinContext}]DISCOUNT_CALCULATOR_UPDATE_STEP`,
      method: "updateStep",
      args: [BigNumber.from(deploymentPlan.global.discountCalculatorStep)],
    });
    await executeTransaction({
      contract: discountCalculator,
      key: `[${stablecoinContext}]DISCOUNT_CALCULATOR_UPDATE_FACTOR_PER_STEP`,
      method: "updateFactorPerStep",
      args: [
        BigNumber.from(deploymentPlan.global.discountCalculatorFactorPerStep),
      ],
    });

    return {
      discountCalculator,
      liquidationEngine,
      accountingEngine,
      debtAuction,
      surplusAuction,
      feesEngine,
      savingsAccount,
      oracleRelayer,
      stablecoinJoin,
      ledger,
      stablecoin,
    };
  };
