import { BigNumber } from "@ethersproject/bignumber";
import { constants, Contract } from "ethers";
import hre, { ethers } from "hardhat";
import { dirSync } from "tmp";
import { expect } from "chai";
import { deployCore } from "../src/deployCore";
import { exp, increaseTime, incrementTime } from "../src/utils";

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

const deployDsProxy = async () => {
  const factory = await (
    await ethers.getContractFactory("DSProxyFactory")
  ).interface;
  const ProxyRegistry = await ethers.getContractFactory("ProxyRegistry");
  const DSProxy = await ethers.getContractFactory("DSProxy");
  const proxyRegistry = await ProxyRegistry.deploy();
  const tx = await (await proxyRegistry["build()"]()).wait();
  if (!tx.events || !tx.events[2]) throw Error("not found");
  const { proxy } = factory.decodeEventLog("Created", tx.events[2].data);
  const dsProxy = DSProxy.attach(proxy);
  return { dsProxy, proxyRegistry };
};

const deployProxyHelper = async () => {
  const ProxyHelperFactory = await ethers.getContractFactory("ProxyHelper");
  const ProxyHelper = await ProxyHelperFactory.deploy();
  return ProxyHelper;
};

const getTransactionData = async (
  ProxyHelper: Contract,
  method: string,
  args: any[]
) => {
  const { data: depositData } = await ProxyHelper.populateTransaction[
    method
  ].apply(null, args);
  if (!depositData) throw new Error("No data");
  return depositData;
};

describe("ProxyHelper", () => {
  it("should allow both deposit and withdrawal of stablecoin & collateral", async () => {
    const [deployer] = await ethers.getSigners();
    const { name, removeCallback } = dirSync({ unsafeCleanup: true });
    const {
      ledger,
      collateralJoin,
      collateral,
      collateralType,
      stablecoinJoin,
      stablecoin,
      feesEngine,
      osm,
      oracleRelayer,
    } = await deployCore(
      {
        transactionCache: `${name}/tx.json`,
        deploymentCache: `${name}/deploy.json`,
      },
      hre
    );
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await oracleRelayer.updateCollateralPrice(collateralType);
    const { dsProxy } = await deployDsProxy();
    const ProxyHelper = await deployProxyHelper();

    await collateral.mint(deployer.address, exp(18).mul(1000));
    await collateral.approve(dsProxy.address, constants.MaxUint256);
    await stablecoin.approve(dsProxy.address, constants.MaxUint256);

    // Deposit collateral
    const depositCollateralData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        exp(18).mul(1000),
        0,
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      depositCollateralData
    );

    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).lockedCollateral
    ).equal(exp(18).mul(1000));

    // Draw out stablecoin
    const mintStablecoinData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        0,
        exp(18).mul(100000),
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      mintStablecoinData
    );
    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).normalizedDebt
    ).equal(exp(18).mul(100000));
    expect(await stablecoin.balanceOf(deployer.address)).to.equal(
      exp(18).mul(100000)
    );

    // Allow stability fee to accrue
    await incrementTime(60 * 60 * 24, ethers.provider);
    await feesEngine.updateAccumulatedRate(
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );

    // Deposit stablecoin
    const repayStablecoinData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        0,
        BigNumber.from(0).sub(exp(18).mul(50000)),
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      repayStablecoinData
    );

    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).normalizedDebt
    ).equal(exp(18).mul(50000));
    expect(await stablecoin.balanceOf(deployer.address)).lt(exp(18).mul(50000));
    expect(await stablecoin.balanceOf(deployer.address)).gt(exp(18).mul(49900));

    // Withdraw collateral
    const withdrawCollateralData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        BigNumber.from(0).sub(exp(18).mul(500)),
        0,
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      withdrawCollateralData
    );
    expect(await collateral.balanceOf(deployer.address)).to.equal(
      exp(18).mul(500)
    );
    removeCallback();
  });

  it("should allow simultaneous minting and repayment", async () => {
    const [deployer] = await ethers.getSigners();
    const { name, removeCallback } = dirSync({ unsafeCleanup: true });
    const {
      ledger,
      collateralJoin,
      collateral,
      collateralType,
      stablecoinJoin,
      stablecoin,
      feesEngine,
      osm,
      oracleRelayer,
    } = await deployCore(
      {
        transactionCache: `${name}/tx.json`,
        deploymentCache: `${name}/deploy.json`,
      },
      hre
    );
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await oracleRelayer.updateCollateralPrice(collateralType);
    const { dsProxy } = await deployDsProxy();
    const ProxyHelper = await deployProxyHelper();

    await collateral.mint(deployer.address, exp(18).mul(1000));
    await collateral.approve(dsProxy.address, constants.MaxUint256);
    await stablecoin.approve(dsProxy.address, constants.MaxUint256);

    // Deposit collateral & mint stablecoin
    const depositCollateralData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        exp(18).mul(1000),
        exp(18).mul(100000),
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      depositCollateralData
    );

    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).lockedCollateral
    ).equal(exp(18).mul(1000));
    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).normalizedDebt
    ).equal(exp(18).mul(100000));
    expect(await stablecoin.balanceOf(deployer.address)).to.equal(
      exp(18).mul(100000)
    );

    // Allow stability fee to accrue
    await incrementTime(60 * 60 * 24, ethers.provider);
    await feesEngine.updateAccumulatedRate(
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );

    // Deposit stablecoin and unlock collateral
    const repayStablecoinData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        BigNumber.from(0).sub(exp(18).mul(500)),
        BigNumber.from(0).sub(exp(18).mul(50000)),
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      repayStablecoinData
    );

    expect(
      (
        await ledger.positions(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          dsProxy.address
        )
      ).normalizedDebt
    ).equal(exp(18).mul(50000));
    expect(await stablecoin.balanceOf(deployer.address)).lt(exp(18).mul(50000));
    expect(await stablecoin.balanceOf(deployer.address)).gt(exp(18).mul(49900));

    expect(await collateral.balanceOf(deployer.address)).to.equal(
      exp(18).mul(500)
    );
    removeCallback();
  });

  it("should allow savings", async () => {
    const [deployer] = await ethers.getSigners();
    const { name, removeCallback } = dirSync({ unsafeCleanup: true });
    const {
      ledger,
      collateralJoin,
      collateral,
      collateralType,
      stablecoinJoin,
      stablecoin,
      osm,
      oracleRelayer,
      savingsAccount,
    } = await deployCore(
      {
        transactionCache: `${name}/tx.json`,
        deploymentCache: `${name}/deploy.json`,
      },
      hre
    );
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await increaseTime(3600, ethers.provider);
    await osm.updatePriceFeed();
    await oracleRelayer.updateCollateralPrice(collateralType);
    const { dsProxy } = await deployDsProxy();
    const ProxyHelper = await deployProxyHelper();

    await incrementTime(60 * 60, ethers.provider);

    await collateral.mint(deployer.address, exp(18).mul(1000));
    await collateral.approve(dsProxy.address, constants.MaxUint256);
    await stablecoin.approve(dsProxy.address, constants.MaxUint256);

    // Deposit collateral & mint stablecoin
    const depositCollateralData = await getTransactionData(
      ProxyHelper,
      "transferCollateralAndDebt",
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        ledger.address,
        stablecoinJoin.address,
        collateralJoin.address,
        exp(18).mul(1000),
        exp(18).mul(100000),
      ]
    );
    await dsProxy["execute(address,bytes)"](
      ProxyHelper.address,
      depositCollateralData
    );

    // Save stablecoin
    await savingsAccount.updateAccumulatedRate();
    const depositData = await getTransactionData(
      ProxyHelper,
      "transferSavings",
      [savingsAccount.address, stablecoinJoin.address, exp(18).mul(100000)]
    );
    await dsProxy["execute(address,bytes)"](ProxyHelper.address, depositData);
    expect(await stablecoin.balanceOf(deployer.address)).to.equal(0);

    const normalizedSavings = await savingsAccount.savings(dsProxy.address);

    await incrementTime(365 * 24 * 60 * 60, ethers.provider);
    await savingsAccount.updateAccumulatedRate();

    // Withdraw savings
    const withdrawData = await getTransactionData(
      ProxyHelper,
      "transferSavings",
      [
        savingsAccount.address,
        stablecoinJoin.address,
        BigNumber.from(0)
          .sub(normalizedSavings)
          .add(1)
          .mul(await savingsAccount.accumulatedRates())
          .div(exp(27)),
      ]
    );
    await dsProxy["execute(address,bytes)"](ProxyHelper.address, withdrawData);

    expect(await stablecoin.balanceOf(deployer.address)).to.gt(
      exp(18).mul(110000)
    );

    removeCallback();
  });
});
