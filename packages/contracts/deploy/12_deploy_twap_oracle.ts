/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: poolAddress } = await get("IUniswapV2Pair");

  await deploy("TwapOracle", {
    from: deployer,
    args: [poolAddress, 1 * 60 * 60],
    log: true,
  });
};

deploymentScript.tags = ["MockTwapOracle"];
deploymentScript.dependencies = ["InitializePriceStabilizer"];
export default deploymentScript;
