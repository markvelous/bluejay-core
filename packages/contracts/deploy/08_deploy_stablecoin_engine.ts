/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { deployUupsProxy } from "../src/deploy/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const TREASURER_ROLE =
  "0x3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d07";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: swapFactoryAddress } = await get("MockUniswapV2Factory");
  const { address: treasuryAddress } = await get("TreasuryProxy");

  const { address: stablecoinEngineProxyAddress } = await deployUupsProxy({
    factory: "StablecoinEngine",
    hre,
    from: deployer,
    args: [treasuryAddress, swapFactoryAddress],
  });

  // Give permission to engine to mint stablecoin
  await execute(
    "StablecoinTokenImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    stablecoinEngineProxyAddress
  );

  // Give permission to engine to mint on treasury
  await execute(
    "TreasuryImpl",
    { from: deployer, log: true },
    "grantRole",
    TREASURER_ROLE,
    stablecoinEngineProxyAddress
  );
};

deploymentScript.tags = ["MockStablecoinEngine"];
deploymentScript.dependencies = [
  "MockUniswapV2Factory",
  "MockReserveToken",
  "Treasury",
  "StablecoinToken",
];
export default deploymentScript;
