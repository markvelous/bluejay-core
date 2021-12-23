import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { exp } from "../src/utils";

const OPERATOR_ROLE =
  "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929";

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["InitializePriceStabilizer"]);

    // Signers setup
    const { deployer: deployerAddress, user1: user1Address } =
      await getNamedAccounts();

    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);

    // Contract setup
    const PriceStabilizer = await ethers.getContractAt(
      "PriceStabilizer",
      (
        await deployments.get("PriceStabilizer")
      ).address,
      deployer
    );
    const ChainlinkAggregator = await ethers.getContractAt(
      "MockChainlinkAggregator",
      (
        await deployments.get("MockChainlinkAggregator")
      ).address,
      deployer
    );
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
    const StablecoinEngine = await ethers.getContractAt(
      "StablecoinEngine",
      (
        await deployments.get("StablecoinEngineImpl")
      ).address,
      deployer
    );
    const Treasury = await ethers.getContractAt(
      "Treasury",
      (
        await deployments.get("TreasuryImpl")
      ).address,
      deployer
    );

    await PriceStabilizer.grantRole(OPERATOR_ROLE, deployer.address);
    await StablecoinEngine.grantRole(OPERATOR_ROLE, PriceStabilizer.address);

    const poolAddress: string = await UniswapFactory.getPair(
      StablecoinToken.address,
      ReserveToken.address
    );

    return {
      StablecoinEngine,
      PriceStabilizer,
      Treasury,
      ChainlinkAggregator,
      ReserveToken,
      StablecoinToken,
      deployer,
      user1,
      poolAddress,
    };
  }
);

const getPrice = async (stablecoinEngine: Contract, pool: string) => {
  const { stablecoinReserve, reserveReserve } =
    await stablecoinEngine.getReserves(pool);
  return stablecoinReserve.mul(exp(18)).div(reserveReserve);
};

describe("PriceStabilizer", () => {
  it("should swap reserve to stablecoin when oracle price is lower", async () => {
    const {
      ChainlinkAggregator,
      PriceStabilizer,
      StablecoinEngine,
      poolAddress,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployed();
    // Oracle: 1.33 SGD = 1 DAI
    const oraclePrice = exp(18).mul(133).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // LP: 1.4 SGD = 1 DAI
    const initialPrice = await getPrice(StablecoinEngine, poolAddress);
    const initialReserveInTreasury = await ReserveToken.balanceOf(
      Treasury.address
    );
    const initialStablecoinSupply = await StablecoinToken.totalSupply();

    const updatePriceTx = await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(2500), // About 2601 to get to back to peg
      exp(18).mul(2500).mul(133).div(100),
      false
    );

    await expect(updatePriceTx).to.emit(PriceStabilizer, "UpdatePrice");

    // LP: 1.333 SGD = 1 DAI
    const updatedPrice = await getPrice(StablecoinEngine, poolAddress);
    const updatedReserveInTreasury = await ReserveToken.balanceOf(
      Treasury.address
    );
    const updatedStablecoinSupply = await StablecoinToken.totalSupply();

    // Price is between oracle price and the initial LP's price
    expect(updatedPrice).to.gte(oraclePrice);
    expect(updatedPrice).to.lte(initialPrice);

    // 2500 DAI taken out of reserve to swap for SGD
    expect(initialReserveInTreasury.sub(updatedReserveInTreasury)).to.eq(
      exp(18).mul(2500)
    );
    // At least 2500 * 1.33 SGD burnt after swap
    expect(initialStablecoinSupply.sub(updatedStablecoinSupply)).to.gt(
      exp(18).mul(2500).mul(133).div(100)
    );
    // At most 2500 * 1.4 SGD burnt after swap
    expect(initialStablecoinSupply.sub(updatedStablecoinSupply)).to.lt(
      exp(18).mul(2500).mul(14).div(10)
    );
  });
  it("should swap stablecoin to reserve when oracle price is higher", async () => {
    const {
      ChainlinkAggregator,
      PriceStabilizer,
      StablecoinEngine,
      poolAddress,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployed();
    // Oracle: 1.45 SGD = 1 DAI
    const oraclePrice = exp(18).mul(145).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // LP: 1.4 SGD = 1 DAI
    const initialPrice = await getPrice(StablecoinEngine, poolAddress);
    const initialReserveInTreasury = await ReserveToken.balanceOf(
      Treasury.address
    );
    const initialStablecoinSupply = await StablecoinToken.totalSupply();

    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(2000),
      exp(18).mul(2000).mul(100).div(145),
      true
    );

    // LP: 1.44 SGD = 1 DAI
    const updatedPrice = await getPrice(StablecoinEngine, poolAddress);
    const updatedReserveInTreasury = await ReserveToken.balanceOf(
      Treasury.address
    );
    const updatedStablecoinSupply = await StablecoinToken.totalSupply();

    // Price is between oracle price and the initial LP's price
    expect(updatedPrice).to.lte(oraclePrice);
    expect(updatedPrice).to.gte(initialPrice);

    // >1300 DAI deposited in treasury
    expect(updatedReserveInTreasury.sub(initialReserveInTreasury)).to.gt(
      exp(18).mul(1300)
    );
    // 2000 SGD created for the swap
    expect(updatedStablecoinSupply.sub(initialStablecoinSupply)).to.eq(
      exp(18).mul(2000)
    );
  });
  it("should not allow overcorrection on swap from stablecoin to reserve", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress } =
      await whenDeployed();
    // Oracle: 1.45 SGD = 1 DAI
    const oraclePrice = exp(18).mul(145).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // First swap will execute
    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(1000),
      exp(18).mul(1000).mul(100).div(145),
      true
    );

    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(2000),
        exp(18).mul(2000).mul(100).div(145),
        true
      )
    ).to.revertedWith("Overcorrection");
  });
  it("should not allow overcorrection on swap from reserve to stablecoin", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress } =
      await whenDeployed();
    // Oracle: 1.3 SGD = 1 DAI
    const oraclePrice = exp(18).mul(13).div(10);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // First swap will execute
    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(2000),
      exp(18).mul(2000).mul(13).div(10),
      false
    );

    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(2000),
        exp(18).mul(2000).mul(13).div(10),
        false
      )
    ).to.revertedWith("Overcorrection");
  });
  it("should not allow excessive slippage from reserve to stablecoin", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress } =
      await whenDeployed();
    // Oracle: 1.45 SGD = 1 DAI
    const oraclePrice = exp(18).mul(145).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // First swap will execute
    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(10),
      exp(18).mul(10).mul(100).div(145),
      true
    );

    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(10),
        exp(18).mul(10).mul(100).div(140),
        true
      )
    ).to.revertedWith("Insufficient output");
  });
  it("should not allow excessive slippage from stablecoin to reserve", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress } =
      await whenDeployed();
    // Oracle: 1.3 SGD = 1 DAI
    const oraclePrice = exp(18).mul(130).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);

    // First swap will execute
    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(10),
      exp(18).mul(10).mul(130).div(100),
      false
    );

    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(10),
        exp(18).mul(10).mul(140).div(100),
        false
      )
    ).to.revertedWith("Insufficient output");
  });
  it("should not allow operator swap against the direction of peg", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress } =
      await whenDeployed();
    // Oracle: 1.3 SGD = 1 DAI
    const oraclePrice = exp(18).mul(130).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);
    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(10),
        exp(18).mul(1),
        true
      )
    ).to.revertedWith("Swap direction is incorrect");
  });
  it("should not allow non-operator to perform swap", async () => {
    const { ChainlinkAggregator, PriceStabilizer, poolAddress, deployer } =
      await whenDeployed();
    await PriceStabilizer.revokeRole(OPERATOR_ROLE, deployer.address);
    // Oracle: 1.3 SGD = 1 DAI
    const oraclePrice = exp(18).mul(130).div(100);
    await ChainlinkAggregator.setPrice(oraclePrice);
    await expect(
      PriceStabilizer.updatePrice(
        poolAddress,
        exp(18).mul(10),
        exp(18).mul(1),
        false
      )
    ).to.revertedWith(
      "AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929"
    );
  });
  it("should not have stray tokens", async () => {
    const {
      ChainlinkAggregator,
      PriceStabilizer,
      StablecoinEngine,
      poolAddress,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployed();

    await ChainlinkAggregator.setPrice(exp(18).mul(133).div(100));

    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(2500), // About 2601 to get to back to peg
      exp(18).mul(2500).mul(133).div(100),
      false
    );

    expect(await ReserveToken.balanceOf(StablecoinEngine.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(StablecoinEngine.address)).to.eq(0);

    expect(await ReserveToken.balanceOf(PriceStabilizer.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(PriceStabilizer.address)).to.eq(0);

    expect(await StablecoinToken.balanceOf(Treasury.address)).to.eq(0);

    expect(await ReserveToken.balanceOf(ChainlinkAggregator.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(ChainlinkAggregator.address)).to.eq(
      0
    );

    await ChainlinkAggregator.setPrice(exp(18).mul(145).div(100));
    await PriceStabilizer.updatePrice(
      poolAddress,
      exp(18).mul(2000),
      exp(18).mul(2000).mul(100).div(145),
      true
    );

    expect(await ReserveToken.balanceOf(StablecoinEngine.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(StablecoinEngine.address)).to.eq(0);

    expect(await ReserveToken.balanceOf(PriceStabilizer.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(PriceStabilizer.address)).to.eq(0);

    expect(await StablecoinToken.balanceOf(Treasury.address)).to.eq(0);

    expect(await ReserveToken.balanceOf(ChainlinkAggregator.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(ChainlinkAggregator.address)).to.eq(
      0
    );
  });
});
