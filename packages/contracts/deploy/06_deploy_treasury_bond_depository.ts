/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";
import { deployUupsProxy } from "../src/deploy/utils";

const VESTING_PERIOD = 7 * 24 * 60 * 60; // 7 days
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { get, execute } = deployments;
  const { deployer, dao } = await getNamedAccounts();

  const { address: policyAddress } = await get("BondGovernor");
  const { address: assetAddress } = await get("MockReserveToken");
  const { address: bluAddress } = await get("BluejayTokenProxy");
  const { address: treasuryAddress } = await get("TreasuryProxy");

  const { address: bondDepositoryProxyAddress } = await deployUupsProxy({
    factory: "TreasuryBondDepository",
    hre,
    from: deployer,
    args: [
      policyAddress,
      assetAddress,
      bluAddress,
      treasuryAddress,
      dao,
      VESTING_PERIOD,
    ],
  });

  // Give permission to bond depository contract to mint on treasury
  await execute(
    "TreasuryImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    bondDepositoryProxyAddress
  );
};

deploymentScript.tags = ["TreasuryBondDepositoryMocked"];
deploymentScript.dependencies = [
  "MockReserveToken",
  "BluejayToken",
  "Treasury",
  "StakedToken",
  "BondGovernorMocked",
];
export default deploymentScript;
