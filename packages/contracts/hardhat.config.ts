/* eslint-disable import/no-extraneous-dependencies */
import { task, types } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-watcher";
import "hardhat-abi-exporter";
import { ActionType } from "hardhat/types";
import { utils, BigNumber } from "ethers";
import { config } from "./src/config";
import { deployInfrastructure } from "./tasks/deployInfrastructure";
import { poke } from "./tasks/poke";
import { updateOraclePrice } from "./tasks/updateOraclePrice";
import { debugInfrastructure } from "./tasks/debugInfrastructure";
import { deployTestCollateral } from "./src/deployTestCollateral";
import { deployTestGovernanceToken } from "./src/deployTestGovernanceToken";
import { deployCdp } from "./src/deployCdp";
import { deployProxy } from "./src/deployProxy";
import { deployPoker } from "./src/deployPoker";
import { deployHelper } from "./src/deployHelper";
import { debugVault } from "./src/debugVault";
import { deployProxyHelper } from "./src/deployProxyHelper";

export const deploymentTask = <
  T extends {
    transactionOverrides: { gasPrice: BigNumber };
    deploymentCache: string;
    transactionCache: string;
    gasPrice: string;
  }
>(
  name: string,
  description: string,
  action: ActionType<T>
) => {
  const withTransactionOverrides: ActionType<T> = async (
    args,
    hre,
    runSuper
  ) => {
    const transactionOverrides = {
      gasPrice: utils.parseUnits(args.gasPrice, "gwei"),
    };
    await action({ ...args, transactionOverrides }, hre, runSuper);
  };
  return task(name, description, withTransactionOverrides)
    .addParam(
      "deploymentCache",
      "Cache for deployed contracts",
      undefined,
      types.string
    )
    .addParam(
      "transactionCache",
      "Cache for executed transactions",
      undefined,
      types.string
    )
    .addParam(
      "gasPrice",
      "Gas price used in transactions (in gwei)",
      "30",
      types.string
    );
};

deploymentTask("deployProxy", "Deploy the proxy registry", deployProxy);
deploymentTask(
  "deployPoker",
  "Deploy the poker contract",
  deployPoker as any
).addParam("deploymentPlan", "Entire deployment plan", undefined, types.string);
deploymentTask("debugVault", "Print vault information", debugVault as any)
  .addParam("vault", "Address of vault", undefined, types.string)
  .addParam(
    "deploymentPlan",
    "Entire deployment plan",
    undefined,
    types.string
  );
deploymentTask("deployHelper", "Deploy the helper contract", deployHelper);
deploymentTask(
  "deployProxyHelper",
  "Deploy the helper contracts for proxy",
  deployProxyHelper
);
deploymentTask(
  "deployTestCollateral",
  "Deploy the test collateral contract",
  deployTestCollateral as any
).addParam("name", "Name of Collateral", "FakeUSD", types.string);

deploymentTask(
  "deployTestGovernanceToken",
  "Deploy the test governance token contract",
  deployTestGovernanceToken
);

deploymentTask(
  "deployCdp",
  "Deploy the CDP for new stablecoin",
  deployCdp as any
).addParam("deploymentPlan", "Entire deployment plan", undefined, types.string);

deploymentTask(
  "deployInfrastructure",
  "Deploys the infrastructure",
  deployInfrastructure
);

deploymentTask(
  "debugInfrastructure",
  "Print debug information for entire infrastructure",
  debugInfrastructure
);

task("poke", "Use mega poke the infrastructure", async (args: any, hre) => {
  await poke(args, hre);
}).addParam(
  "pokerAddress",
  "Address of poker contract",
  undefined,
  types.string
);

task(
  "updateOraclePrice",
  "Updates the oracle price",
  async (args: any, hre) => {
    await updateOraclePrice(args, hre);
  }
)
  .addParam(
    "oracleAddress",
    "Address of SingleFeedOracle contract",
    undefined,
    types.string
  )
  .addParam("price", "Price in WAD", undefined, types.string);

task("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  // eslint-disable-next-line no-console
  accounts.forEach((account) => console.log(account.address));
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// eslint-disable-next-line import/no-default-export
export default {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: false,
      runs: 1000,
    },
  },
  networks: config.networks,
  watcher: {
    test: {
      tasks: ["compile", "test"],
      files: ["./contracts", "./test"],
    },
  },
  typechain: {
    outDir: "./src/contracts",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
  abiExporter: {
    path: "./abi",
    flat: true,
    spacing: 2,
  },
};
