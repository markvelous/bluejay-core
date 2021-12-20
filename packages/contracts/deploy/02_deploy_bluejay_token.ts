/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { deployUupsProxy } from "../src/deploy/utils";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  await deployUupsProxy({
    factory: "BluejayToken",
    hre,
    from: deployer,
  });
};

deploymentScript.tags = ["BluejayToken"];
export default deploymentScript;
