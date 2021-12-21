/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const interestRate = "1000000124049443431959642954"; // 5000% APY
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: governanceTokenAddress } = await get("BluejayTokenImpl");
  const { address: treasuryAddress } = await get("TreasuryImpl");

  const tx = await deploy("StakedToken", {
    from: deployer,
    args: [
      "Staked BLU",
      "sBLU",
      governanceTokenAddress,
      treasuryAddress,
      interestRate,
    ],
    log: true,
  });

  // Give permission to staking contract to mint on treasury
  await execute(
    "TreasuryImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    tx.address
  );
};

deploymentScript.tags = ["StakedToken"];
deploymentScript.dependencies = ["BluejayToken", "Treasury"];
export default deploymentScript;
