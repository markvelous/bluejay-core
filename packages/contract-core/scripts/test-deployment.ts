import { constants } from "ethers";
import { readFileSync } from "fs";
import { network, ethers } from "hardhat";
import { getLogger, enableAllLog } from "../src/debug";
import { exp } from "../test/utils";

const { info, error } = getLogger("deployCore");

const DEPLOYMENT_CACHE_PATH = `${__dirname}/core-deployment-cache.json`;
const transactionOverrides = { gasLimit: 30000000 };

const buildContractFromCache = (cache: string, net: string) => {
  const deployments = JSON.parse(readFileSync(cache).toString())[net];
  return async (key: string, factory: string) => {
    if (!deployments[key]) throw new Error("Deployment address not found");
    const Factory = await ethers.getContractFactory(factory);
    return Factory.attach(deployments[key]);
  };
};
const collateralType =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

export const deployCore = async () => {
  const [deployer] = await ethers.getSigners();
  if (!deployer.provider) throw new Error("Deployer has no provider");
  const account1 = ethers.Wallet.createRandom().connect(deployer.provider);

  // Load contracts
  const getContract = buildContractFromCache(
    DEPLOYMENT_CACHE_PATH,
    network.name
  );
  const collateral = await getContract("SimpleCollateral", "SimpleCollateral");
  const collateralJoin = await getContract(
    "ProxyCollateralJoin",
    "CollateralJoin"
  );
  const ledger = await getContract("ProxyLedger", "Ledger");
  const feesEngine = await getContract("ProxyFeesEngine", "FeesEngine");

  // Fund new wallet
  await deployer.sendTransaction({ to: account1.address, value: exp(18) });

  // Mint some 1k USD for account
  await collateral.mint(account1.address, exp(18).mul(1000));
  info(
    `Collateral Balance of ${account1.address}: ${await collateral.balanceOf(
      account1.address
    )}`
  );

  // Deposit 1k USD
  await collateral
    .connect(account1)
    .approve(
      collateralJoin.address,
      constants.MaxUint256,
      transactionOverrides
    );
  await collateralJoin
    .connect(account1)
    .deposit(account1.address, exp(18).mul(1000), transactionOverrides);

  //   Draw out 1m of MMK
  await ledger
    .connect(account1)
    .modifyPositionCollateralization(
      collateralType,
      account1.address,
      account1.address,
      account1.address,
      exp(18).mul(1000),
      exp(18).mul(1000 * 1000),
      transactionOverrides
    );
  info(`Internal stablecoin balance: ${await ledger.debt(account1.address)}`);

  // Update fees
  await feesEngine.connect(account1).updateAccumulatedRate(collateralType);
  info(`${await ledger.collateralTypes(collateralType)}`);
};

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
enableAllLog();
deployCore()
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(1);
  });
