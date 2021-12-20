/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { deployUupsProxy } from "../src/deploy/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: governanceTokenProxyAddress } = await get(
    "BluejayTokenImpl"
  );

  const { address: treasuryProxyAddress } = await deployUupsProxy({
    factory: "Treasury",
    hre,
    from: deployer,
    args: [governanceTokenProxyAddress],
  });

  // Give treasury permission to mint
  await execute(
    "BluejayTokenImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    treasuryProxyAddress
  );
};

deploymentScript.tags = ["Treasury"];
deploymentScript.dependencies = ["BluejayToken"];
export default deploymentScript;
