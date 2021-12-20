/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { exp } from "../src/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: reserveTokenAddress } = await get("MockReserveToken");
  const { address: bluTokenAddress } = await get("BluejayTokenImpl");

  const tx = await execute(
    "MockUniswapV2Factory",
    { from: deployer, log: true },
    "createPair",
    reserveTokenAddress,
    bluTokenAddress
  );
  if (!tx.events || !tx.events[0].args || !tx.events[0].args.pair)
    throw new Error("No events emitted");
  const poolAddr = tx.events[0].args.pair;

  // Furnish with other artifacts
  const artifact = await hre.deployments.getArtifact("IUniswapV2Pair");
  const poolImplementation = {
    ...artifact,
    address: poolAddr,
  };

  // Manually save the deployment
  hre.deployments.save(`BluReservePair`, poolImplementation);

  // Add liquidity
  await execute(
    "BluejayTokenImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    deployer
  );
  await execute(
    "BluejayTokenImpl",
    { from: deployer, log: true },
    "mint",
    poolAddr,
    exp(18).mul(10000)
  );
  await execute(
    "MockReserveToken",
    { from: deployer, log: true },
    "mint",
    poolAddr,
    exp(18).mul(10000)
  );
  await execute(
    "BluReservePair",
    { from: deployer, log: true },
    "mint",
    deployer
  );
};

deploymentScript.tags = ["DeployBluPool"];
deploymentScript.dependencies = [
  "MockReserveToken",
  "MockUniswapV2Factory",
  "BluejayToken",
];
export default deploymentScript;
