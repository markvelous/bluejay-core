import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { exp, increaseTime } from "../src/utils";
import { swapOnPool } from "./utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["MockTwapOracle"]);

    const { deployer: deployerAddress, user1: user1Address } =
      await getNamedAccounts();

    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);

    const ReserveToken = await ethers.getContractAt(
      "MockReserveToken",
      (
        await deployments.get("MockReserveToken")
      ).address,
      deployer
    );
    const StablecoinToken = await ethers.getContractAt(
      "StablecoinToken",
      (
        await deployments.get("StablecoinTokenImpl")
      ).address,
      deployer
    );
    const UniswapFactory = await ethers.getContractAt(
      "IUniswapV2Factory",
      (
        await deployments.get("MockUniswapV2Factory")
      ).address,
      deployer
    );

    const Pool = await ethers.getContractAt(
      "IUniswapV2Pair",
      (
        await deployments.get("IUniswapV2Pair")
      ).address,
      deployer
    );

    const TwapOracle = await ethers.getContractAt(
      "TwapOracle",
      (
        await deployments.get("TwapOracle")
      ).address,
      deployer
    );

    await StablecoinToken.grantRole(MINTER_ROLE, deployerAddress);
    return {
      ReserveToken,
      StablecoinToken,
      UniswapFactory,
      TwapOracle,
      Pool,
      deployer,
      user1,
    };
  }
);

describe("TwapOracle", () => {
  it("should provide the correct price after initialization", async () => {
    const deployed = await whenDeployed();
    const { TwapOracle, ReserveToken } = deployed;

    // Perform a small swap to get the cumulative price to update
    await swapOnPool(deployed, true, exp(18).mul(10));

    // Update the oracle after the period passes
    await increaseTime(60 * 60, ethers.provider);
    await TwapOracle.update();

    // Price on oracle is correct
    const price = await TwapOracle.consult(ReserveToken.address, exp(18));
    expect(price).to.gt(exp(18).mul(140).div(100));
    expect(price).to.lt(exp(18).mul(141).div(100));
  });
  it("should return the correct average over a period of time", async () => {
    const deployed = await whenDeployed();
    const { Pool, StablecoinToken, ReserveToken, TwapOracle } = deployed;

    const stableIsToken0 = (await Pool.token0()) === StablecoinToken.address;

    // 1/4 time at one price
    await swapOnPool(deployed, true, exp(18).mul(5000));
    await increaseTime(0.25 * 60 * 60, ethers.provider);
    const { reserve0: firstR0, reserve1: firstR1 } = await Pool.getReserves();

    // 3/4 time at another price
    await swapOnPool(deployed, false, exp(18).mul(15000));
    await increaseTime(0.75 * 60 * 60, ethers.provider);
    const { reserve0: secondR0, reserve1: secondR1 } = await Pool.getReserves();

    await TwapOracle.update();

    // Calculate what is the expected price if the accumulator is working
    const accumulatedR0 = secondR0.mul(3).add(firstR0);
    const accumulatedR1 = secondR1.mul(3).add(firstR1);
    const expectedPrice = stableIsToken0
      ? accumulatedR0.mul(exp(18)).div(accumulatedR1)
      : accumulatedR1.mul(exp(18)).div(accumulatedR0);

    const actualPrice = await TwapOracle.consult(ReserveToken.address, exp(18));

    // Difference between the two price is low (<2% deviation)
    expect(actualPrice.sub(expectedPrice).abs()).to.be.lt(
      exp(18).mul(2).div(100)
    );
  });
  it("should work for a long period of time (10 000 years)", async () => {
    const deployed = await whenDeployed();
    const { TwapOracle, ReserveToken } = deployed;

    // Perform a small swap to get the cumulative price to update
    await swapOnPool(deployed, true, exp(18).mul(10));

    // Update the oracle after the period passes
    await increaseTime(60 * 60 * 24 * 365 * 10000, ethers.provider);
    await TwapOracle.update();

    // Price on oracle is correct
    const price = await TwapOracle.consult(ReserveToken.address, exp(18));
    expect(price).to.gt(exp(18).mul(140).div(100));
    expect(price).to.lt(exp(18).mul(141).div(100));
  });
  it("should not return any price before the first period passes", async () => {
    const deployed = await whenDeployed();
    const { TwapOracle, ReserveToken } = deployed;

    await expect(
      TwapOracle.consult(ReserveToken.address, exp(18))
    ).to.revertedWith("Invalid price");

    await swapOnPool(deployed, true, exp(18).mul(10));

    await expect(
      TwapOracle.consult(ReserveToken.address, exp(18))
    ).to.revertedWith("Invalid price");

    // Update the oracle after the period passes
    await increaseTime(60 * 60, ethers.provider);

    await expect(
      TwapOracle.consult(ReserveToken.address, exp(18))
    ).to.revertedWith("Invalid price");

    await TwapOracle.update();

    await expect(TwapOracle.consult(ReserveToken.address, exp(18))).not.to.be
      .reverted;
  });
});
