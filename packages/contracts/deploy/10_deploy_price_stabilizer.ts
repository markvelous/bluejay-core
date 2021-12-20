/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: stablecoinEngineAddress } = await get(
    "StablecoinEngineProxy"
  );

  await deploy("PriceStabilizer", {
    from: deployer,
    args: [stablecoinEngineAddress],
    log: true,
  });
};

deploymentScript.tags = ["MockPriceStabilizer"];
deploymentScript.dependencies = [
  "MockChainlinkAggregator",
  "MockStablecoinEngine",
  "StablecoinToken",
  "MockReserveToken",
];
export default deploymentScript;
