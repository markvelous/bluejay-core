/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { exp } from "../src/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const TREASURER_ROLE =
  "0x3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d07";
const MANAGER_ROLE =
  "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: treasuryAddr } = await get("TreasuryImpl");
  const { address: stablecoinEngineAddr } = await get("StablecoinEngineImpl");
  const { address: stablecoinAddr } = await get("StablecoinTokenImpl");
  const { address: reserveAddr } = await get("MockReserveToken");
  const { address: oracleAddr } = await get("PriceFeedOracle");

  // Give stablecoin engine permission to mint stablecoin
  await execute(
    "StablecoinTokenImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    stablecoinEngineAddr
  );

  // Give stablecoin engine permission to withdraw reserves from treasury
  await execute(
    "TreasuryImpl",
    { from: deployer, log: true },
    "grantRole",
    TREASURER_ROLE,
    stablecoinEngineAddr
  );

  // Give deployer permission to initialize
  await execute(
    "StablecoinEngineImpl",
    { from: deployer, log: true },
    "grantRole",
    MANAGER_ROLE,
    deployer
  );

  // Mint some reserves to the treasury
  await execute(
    "MockReserveToken",
    { from: deployer, log: true },
    "mint",
    treasuryAddr,
    exp(18).mul(1000000)
  );

  // Create pool with liquidity
  const tx = await execute(
    "StablecoinEngineImpl",
    { from: deployer, log: true },
    "initializeStablecoin",
    reserveAddr,
    stablecoinAddr,
    exp(18).mul(100000),
    exp(18).mul(140000)
  );
  if (!tx.events) throw new Error("No events emitted");
  const event = tx.events.find((e) => e.event === "PoolAdded");
  if (!event) throw new Error("No PoolAdded event emitted");
  const poolAddr = event.args.pool;

  // Furnish with other artifacts
  const artifact = await hre.deployments.getArtifact("IUniswapV2Pair");
  const poolImplementation = {
    ...artifact,
    address: poolAddr,
  };

  // Manually save the deployment
  hre.deployments.save(`IUniswapV2Pair`, poolImplementation);

  // Give deployer permission to initialize
  await execute(
    "PriceStabilizer",
    { from: deployer, log: true },
    "grantRole",
    MANAGER_ROLE,
    deployer
  );

  // Add pool to price stabilizer
  await execute(
    "PriceStabilizer",
    { from: deployer, log: true },
    "initializePool",
    poolAddr,
    oracleAddr
  );
};

deploymentScript.tags = ["InitializePriceStabilizer"];
deploymentScript.dependencies = [
  "MockPriceStabilizer",
  "Treasury",
  "MockReserveToken",
  "StablecoinToken",
];
export default deploymentScript;
