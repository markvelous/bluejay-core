import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";
import { exp } from "../src/utils";

const deployAggregator = async (decimal: number, price: BigNumber) => {
  const MockAggregator = await ethers.getContractFactory(
    "MockChainlinkAggregator"
  );
  const aggregator = await MockAggregator.deploy(price, decimal);
  return aggregator;
};

describe("PriceFeedOracle", () => {
  it("should return the correct price for a single path swap", async () => {
    const sgdUsd = await deployAggregator(8, exp(8).mul(732011).div(1000000));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy([sgdUsd.address], [false]);
    const price = await oracle.getPrice();
    expect(price).to.eq("732011000000000000");
  });
  it("should return the correct price for a single path swap with different decimal", async () => {
    const sgdUsd = await deployAggregator(27, exp(27).mul(732011).div(1000000));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy([sgdUsd.address], [false]);
    const price = await oracle.getPrice();
    expect(price).to.eq("732011000000000000");
  });
  it("should return the correct price for a single path swap with inversion", async () => {
    const sgdUsd = await deployAggregator(27, exp(27).mul(732011).div(1000000));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy([sgdUsd.address], [true]);
    const price = await oracle.getPrice();
    expect(price).to.eq("1366099689758760455");
  });
  it("should return the correct price for a multi path swap", async () => {
    const sgdUsd = await deployAggregator(8, exp(8).mul(732011).div(1000000));
    const usdDai = await deployAggregator(8, exp(8).mul(10000).div(10017));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy(
      [sgdUsd.address, usdDai.address],
      [false, false]
    );
    const price = await oracle.getPrice();
    expect(price).to.eq("730768689491680000");
  });
  it("should return the correct price for a multi path swap with inversion", async () => {
    const sgdUsd = await deployAggregator(8, exp(8).mul(732011).div(1000000));
    const daiUsd = await deployAggregator(8, exp(8).mul(10017).div(10000));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy(
      [sgdUsd.address, daiUsd.address],
      [false, true]
    );
    const price = await oracle.getPrice();
    expect(price).to.eq("730768693221523410");
  });
  it("should return the correct price for a multi path swap with inversion and different decimal", async () => {
    const sgdUsd = await deployAggregator(8, exp(8).mul(732011).div(1000000));
    const daiUsd = await deployAggregator(18, exp(18).mul(10017).div(10000));
    const PriceFeedOracle = await ethers.getContractFactory("PriceFeedOracle");
    const oracle = await PriceFeedOracle.deploy(
      [sgdUsd.address, daiUsd.address],
      [false, true]
    );
    const price = await oracle.getPrice();
    expect(price).to.eq("730768693221523410");
  });
});
