import { utils } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { enableAllLog, getLogger } from "../src/debug";
import { buildCachedDeployments } from "../src/cachedDeployments";
import { formatRay, formatWad } from "../src/utils";

const { info } = getLogger("debugInfrastructure");

export const debugInfrastructure = async (
  {
    deploymentCache,
    transactionCache,
  }: {
    deploymentCache: string;
    transactionCache: string;
  },
  hre: HardhatRuntimeEnvironment
) => {
  enableAllLog();
  hre.ethers.utils.Logger.setLogLevel(hre.ethers.utils.Logger.levels.ERROR);
  const transactionOverrides = { gasPrice: utils.parseUnits("30", "gwei") };

  const { getInstance } = buildCachedDeployments({
    network: hre.network.name,
    deploymentCachePath: deploymentCache,
    transactionCachePath: transactionCache,
    skipDeploymentCache: false,
    skipTransactionCache: false,
    emitLog: false,
    hre,
    transactionOverrides,
  });
  const collateralType =
    "0x0000000000000000000000000000000000000000000000000000000000000001";
  const oracle = await getInstance({
    key: "[MMKT][USDT]ProxyOracle",
    factory: "SingleFeedOracle",
  });
  const osm = await getInstance({
    key: "[MMKT][USDT]ProxyOSM",
    factory: "OracleSecurityModule",
  });
  const oracleRelayer = await getInstance({
    key: "[MMKT]ProxyOracleRelayer",
    factory: "OracleRelayer",
  });

  info("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖");
  info(`Oracle @ ${oracle.address}`);
  info(`Price: ${formatWad(await oracle.tokenPrice())} USDT`);

  info("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖");
  info(`OSM @ ${osm.address}`);
  const currentPrice = await osm.getPrice();
  const nextPrice = await osm.getNextPrice();
  info(`Price source: ${await osm.oracle()}`);
  info(`Current Price: ${formatWad(currentPrice[0])} USDT`);
  info(`Next Price: ${formatWad(nextPrice[0])} USDT`);

  info("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖");
  info(`OracleRelayer @ ${oracleRelayer.address}`);
  const relayerCollateralInfo = await oracleRelayer.collateralTypes(
    collateralType
  );
  info(`Price source: ${relayerCollateralInfo[0]}`);
  info(`Collateralization Ratio: ${formatRay(relayerCollateralInfo[1])}`);
};
