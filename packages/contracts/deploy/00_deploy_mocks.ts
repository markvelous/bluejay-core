/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MockReserveToken", {
    from: deployer,
    args: [],
    log: true,
  });
};

deploymentScript.tags = ["MockReserveToken"];
export default deploymentScript;
