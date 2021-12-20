/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: poolAddress } = await get("BluReservePair");

  await deploy("BluTwapOracle", {
    contract: "TwapOracle",
    from: deployer,
    args: [poolAddress, 1 * 60 * 60],
    log: true,
  });
};

deploymentScript.tags = ["MockBLUTwapOracle"];
deploymentScript.dependencies = ["DeployBluPool"];
export default deploymentScript;
