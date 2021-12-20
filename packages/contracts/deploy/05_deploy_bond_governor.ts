/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { exp } from "../src/utils";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const { address: bluAddress } = await get("BluejayTokenImpl");
  const { address: assetAddress } = await get("MockReserveToken");

  await deploy("BondGovernor", {
    from: deployer,
    args: [bluAddress],
    log: true,
  });

  await execute(
    "BondGovernor",
    { from: deployer, log: true },
    "initializePolicy",
    assetAddress,
    exp(27).mul(300),
    exp(18).mul(1000000),
    exp(18)
  );
};

deploymentScript.tags = ["BondGovernorMocked"];
deploymentScript.dependencies = ["BluejayToken", "MockReserveToken"];
export default deploymentScript;
