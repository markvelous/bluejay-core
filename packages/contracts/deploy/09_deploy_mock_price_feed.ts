/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { exp } from "../src/utils";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const aggregator = await deploy("MockChainlinkAggregator", {
    from: deployer,
    // 1 USD to 1.36 SGD
    args: [exp(18).mul(136).div(100), 18],
    log: true,
  });

  await deploy("PriceFeedOracle", {
    from: deployer,
    args: [[aggregator.address], [false]],
    log: true,
  });
};

deploymentScript.tags = ["MockChainlinkAggregator"];
export default deploymentScript;
