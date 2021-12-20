/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { DeployFunction } from "hardhat-deploy/types";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const deploymentScript: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: bluAddress } = await get("BluejayTokenImpl");
  const { address: reserveAddress } = await get("MockReserveToken");
  const { address: treasuryAddress } = await get("TreasuryImpl");
  const { address: stablecoinAddress } = await get("StablecoinTokenImpl");
  const { address: stablecoinTwapOracle } = await get("TwapOracle");
  const { address: stablecoinOracle } = await get("PriceFeedOracle");
  const { address: bluTwapOracle } = await get("BluTwapOracle");
  const { address: stablecoinReservePool } = await get("IUniswapV2Pair");

  await deploy("StabilizingBondDepository", {
    from: deployer,
    args: [
      bluAddress,
      reserveAddress,
      stablecoinAddress,
      treasuryAddress,
      bluTwapOracle,
      stablecoinTwapOracle,
      stablecoinOracle,
      stablecoinReservePool,
      60 * 60 * 6, // 6 hours
    ],
    log: true,
  });
  const { address: bondDepoAddress } = await get("StabilizingBondDepository");
  await execute(
    "StablecoinTokenImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    bondDepoAddress
  );
  await execute(
    "TreasuryImpl",
    { from: deployer, log: true },
    "grantRole",
    MINTER_ROLE,
    bondDepoAddress
  );
};

deploymentScript.tags = ["StabilizingBondDepo"];
deploymentScript.dependencies = [
  "BluejayToken",
  "MockChainlinkAggregator",
  "MockTwapOracle",
  "StablecoinToken",
  "InitializePriceStabilizer",
  "MockReserveToken",
  "MockBLUTwapOracle",
];
export default deploymentScript;
