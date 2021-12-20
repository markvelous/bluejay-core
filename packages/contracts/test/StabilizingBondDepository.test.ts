import { expect } from "chai";
import { constants } from "ethers";
import { deployments, ethers } from "hardhat";
import { exp, increaseTime } from "../src/utils";
import { swapOnPool } from "./utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["StabilizingBondDepo"]);

    // Signers setup
    const { deployer: deployerAddress, user1: user1Address } =
      await getNamedAccounts();

    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);

    // Contract setup
    const PriceFeedOracle = await ethers.getContractAt(
      "PriceFeedOracle",
      (
        await deployments.get("PriceFeedOracle")
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
    const Treasury = await ethers.getContractAt(
      "Treasury",
      (
        await deployments.get("TreasuryImpl")
      ).address,
      deployer
    );
    const StabilizingBondDepository = await ethers.getContractAt(
      "StabilizingBondDepository",
      (
        await deployments.get("StabilizingBondDepository")
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
    const BluReservePool = await ethers.getContractAt(
      "IUniswapV2Pair",
      (
        await deployments.get("BluReservePair")
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
    const BluTwapOracle = await ethers.getContractAt(
      "TwapOracle",
      (
        await deployments.get("BluTwapOracle")
      ).address,
      deployer
    );
    const MockChainlinkAggregator = await ethers.getContractAt(
      "MockChainlinkAggregator",
      (
        await deployments.get("MockChainlinkAggregator")
      ).address,
      deployer
    );
    const BluejayToken = await ethers.getContractAt(
      "BluejayToken",
      (
        await deployments.get("BluejayTokenImpl")
      ).address,
      deployer
    );

    // Setup Twap Oracle
    await BluejayToken.mint(BluReservePool.address, 100);
    const bluIsToken0 =
      (await BluReservePool.token0()) === BluejayToken.address;
    await BluReservePool.swap(
      bluIsToken0 ? 0 : 50,
      bluIsToken0 ? 50 : 0,
      deployer.address,
      "0x"
    );
    await StablecoinToken.grantRole(MINTER_ROLE, deployerAddress);
    await swapOnPool(
      { StablecoinToken, ReserveToken, Pool, deployer },
      true,
      exp(18)
    );
    await increaseTime(60 * 60, ethers.provider);
    await TwapOracle.update();
    await BluTwapOracle.update();

    return {
      BluejayToken,
      BluReservePool,
      BluTwapOracle,
      StabilizingBondDepository,
      MockChainlinkAggregator,
      Treasury,
      Pool,
      TwapOracle,
      UniswapFactory,
      PriceFeedOracle,
      ReserveToken,
      StablecoinToken,
      deployer,
      user1,
    };
  }
);

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

const getSpotPrice = async ({
  Pool,
  ReserveToken,
}: Awaited<ReturnType<typeof whenDeployed>>) => {
  const reserves = await Pool.getReserves();
  const token0 = await Pool.token0();
  const reserveIsToken0 = token0 === ReserveToken.address;
  return reserveIsToken0
    ? reserves.reserve1.mul(exp(18)).div(reserves.reserve0)
    : reserves.reserve0.mul(exp(18)).div(reserves.reserve1);
};

describe("StabilizingBondDepository", () => {
  describe("getDeviation", () => {
    it("should quote contractionary deviations correctly", async () => {
      const {
        StabilizingBondDepository,
        PriceFeedOracle,
        Pool,
        StablecoinToken,
      } = await whenDeployed();

      // Calculate swap on external oracle [approx 1.36]
      const priceExt = await PriceFeedOracle.getPrice();

      // Calculate pool price manually [approx 1.4]
      const poolReserves = await Pool.getReserves();
      const stablecoinIsToken0 =
        (await Pool.token0()) === StablecoinToken.address;
      const stablecoinReserve = stablecoinIsToken0
        ? poolReserves.reserve0
        : poolReserves.reserve1;
      const reserveReserve = stablecoinIsToken0
        ? poolReserves.reserve1
        : poolReserves.reserve0;
      const priceInt = stablecoinReserve.mul(exp(18)).div(reserveReserve);

      // Assert that the stablecoin is more expensive on pool
      expect(priceExt).lt(priceInt);

      const deviation = await StabilizingBondDepository.getDeviation();

      // Approx 2.94% positive deviation
      expect(deviation.isExpansionary).to.eq(false);
      expect(deviation.stablecoinOut).to.gt(exp(18));
      expect(deviation.degree).to.gt(exp(18).mul(294).div(10000));
      expect(deviation.degree).to.lt(exp(18).mul(295).div(10000));
    });
    it("should quote expansionary deviations correctly", async () => {
      const {
        StabilizingBondDepository,
        PriceFeedOracle,
        Pool,
        StablecoinToken,
        MockChainlinkAggregator,
      } = await whenDeployed();

      // Calculate swap on external oracle [approx 1.45]
      await MockChainlinkAggregator.setPrice(exp(18).mul(145).div(100));
      const priceExt = await PriceFeedOracle.getPrice();

      // Calculate pool price manually [approx 1.4]
      const poolReserves = await Pool.getReserves();
      const stablecoinIsToken0 =
        (await Pool.token0()) === StablecoinToken.address;
      const stablecoinReserve = stablecoinIsToken0
        ? poolReserves.reserve0
        : poolReserves.reserve1;
      const reserveReserve = stablecoinIsToken0
        ? poolReserves.reserve1
        : poolReserves.reserve0;
      const priceInt = stablecoinReserve.mul(exp(18)).div(reserveReserve);

      // Assert that the stablecoin is more expensive on external market
      expect(priceExt).gt(priceInt);

      const deviation = await StabilizingBondDepository.getDeviation();

      // Approx 3.57% negative deviation
      expect(deviation.isExpansionary).to.eq(true);
      expect(deviation.stablecoinOut).to.lt(exp(18));
      expect(deviation.degree).to.gt(exp(18).mul(344).div(10000));
      expect(deviation.degree).to.lt(exp(18).mul(345).div(10000));
    });
  });
  describe("getCurrentReward", () => {
    it("should return 1 when deviation is within tolerance level", async () => {
      const { StabilizingBondDepository, MockChainlinkAggregator } =
        await whenDeployed();

      // Negative deviation
      await MockChainlinkAggregator.setPrice(exp(18).mul(1401).div(1000));
      const deviation = await StabilizingBondDepository.getDeviation();
      expect(deviation.degree).to.lt(exp(18).div(100));
      expect(deviation.isExpansionary).to.eq(true);
      const discount = await StabilizingBondDepository.getCurrentReward();
      expect(discount).to.eq(exp(18));

      // Positive deviation
      await MockChainlinkAggregator.setPrice(exp(18).mul(1399).div(1000));
      const deviation2 = await StabilizingBondDepository.getDeviation();
      expect(deviation2.degree).to.lt(exp(18).div(100));
      expect(deviation2.isExpansionary).to.eq(false);
      const discount2 = await StabilizingBondDepository.getCurrentReward();
      expect(discount2).to.eq(exp(18));
    });
    it("should correct discount on positive deviations", async () => {
      const { StabilizingBondDepository, MockChainlinkAggregator } =
        await whenDeployed();

      // 1.45% deviation -> x1.07
      await MockChainlinkAggregator.setPrice(exp(18).mul(1380).div(1000));
      const deviation1 = await StabilizingBondDepository.getDeviation();
      const discount1 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation1.degree).to.gt(exp(18).mul(145).div(10000));
      expect(deviation1.degree).to.lt(exp(18).mul(146).div(10000));
      expect(discount1).to.gt(exp(18).mul(10746).div(10000));
      expect(discount1).to.lt(exp(18).mul(10747).div(10000));

      // 2.19% deviation -> x1.11
      await MockChainlinkAggregator.setPrice(exp(18).mul(1370).div(1000));
      const deviation2 = await StabilizingBondDepository.getDeviation();
      const discount2 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation2.degree).to.gt(exp(18).mul(219).div(10000));
      expect(deviation2.degree).to.lt(exp(18).mul(220).div(10000));
      expect(discount2).to.gt(exp(18).mul(11144).div(10000));
      expect(discount2).to.lt(exp(18).mul(11145).div(10000));

      // 3.70% deviation -> x1.1995
      await MockChainlinkAggregator.setPrice(exp(18).mul(1350).div(1000));
      const deviation3 = await StabilizingBondDepository.getDeviation();
      const discount3 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation3.degree).to.gt(exp(18).mul(370).div(10000));
      expect(deviation3.degree).to.lt(exp(18).mul(371).div(10000));
      expect(discount3).to.gt(exp(18).mul(11995).div(10000));
      expect(discount3).to.lt(exp(18).mul(11996).div(10000));

      // 7.69% deviation -> x1.448
      await MockChainlinkAggregator.setPrice(exp(18).mul(1300).div(1000));
      const deviation4 = await StabilizingBondDepository.getDeviation();
      const discount4 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation4.degree).to.gt(exp(18).mul(769).div(10000));
      expect(deviation4.degree).to.lt(exp(18).mul(770).div(10000));
      expect(discount4).to.gt(exp(18).mul(14486).div(10000));
      expect(discount4).to.lt(exp(18).mul(14487).div(10000));
    });
    it("should correct discount on negative deviations", async () => {
      const { StabilizingBondDepository, MockChainlinkAggregator } =
        await whenDeployed();

      // 1.41% deviation -> x1.07
      await MockChainlinkAggregator.setPrice(exp(18).mul(1420).div(1000));
      const deviation1 = await StabilizingBondDepository.getDeviation();
      const discount1 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation1.degree).to.gt(exp(18).mul(140).div(10000));
      expect(deviation1.degree).to.lt(exp(18).mul(141).div(10000));
      expect(discount1).to.gt(exp(18).mul(10723).div(10000));
      expect(discount1).to.lt(exp(18).mul(10724).div(10000));

      // 2.43% deviation -> x1.127
      await MockChainlinkAggregator.setPrice(exp(18).mul(1435).div(1000));
      const deviation2 = await StabilizingBondDepository.getDeviation();
      const discount2 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation2.degree).to.gt(exp(18).mul(243).div(10000));
      expect(deviation2.degree).to.lt(exp(18).mul(244).div(10000));
      expect(discount2).to.gt(exp(18).mul(11279).div(10000));
      expect(discount2).to.lt(exp(18).mul(11280).div(10000));

      // // 3.44% deviation -> x1.184
      await MockChainlinkAggregator.setPrice(exp(18).mul(1450).div(1000));
      const deviation3 = await StabilizingBondDepository.getDeviation();
      const discount3 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation3.degree).to.gt(exp(18).mul(344).div(10000));
      expect(deviation3.degree).to.lt(exp(18).mul(345).div(10000));
      expect(discount3).to.gt(exp(18).mul(11846).div(10000));
      expect(discount3).to.lt(exp(18).mul(11847).div(10000));

      // 6.66% deviation -> x1.308
      await MockChainlinkAggregator.setPrice(exp(18).mul(1500).div(1000));
      const deviation4 = await StabilizingBondDepository.getDeviation();
      const discount4 = await StabilizingBondDepository.getCurrentReward();
      expect(deviation4.degree).to.gt(exp(18).mul(666).div(10000));
      expect(deviation4.degree).to.lt(exp(18).mul(667).div(10000));
      expect(discount4).to.gt(exp(18).mul(13807).div(10000));
      expect(discount4).to.lt(exp(18).mul(13808).div(10000));
    });
    it("should correct max discount on excessive deviations", async () => {
      const { StabilizingBondDepository, MockChainlinkAggregator } =
        await whenDeployed();

      await MockChainlinkAggregator.setPrice(exp(18).mul(1680).div(1000));
      const deviation = await StabilizingBondDepository.getDeviation();
      const discount = await StabilizingBondDepository.getCurrentReward();
      expect(deviation.degree).to.gt(exp(18).mul(1666).div(10000));
      expect(deviation.degree).to.lt(exp(18).mul(1667).div(10000));
      expect(discount).to.eq(exp(18).mul(15).div(10));
    });
  });
  describe("purchase", () => {
    it("expansionary bond should bring stablecoin prices down on pool", async () => {
      const deployment = await whenDeployed();
      const {
        StabilizingBondDepository,
        MockChainlinkAggregator,
        ReserveToken,
        Treasury,
        StablecoinToken,
        user1,
      } = deployment;

      // Price is higher on LP, selling expansionary bond
      const targetPrice = exp(18).mul(1500).div(1000);
      const amountIn = exp(18).mul(1000);
      await MockChainlinkAggregator.setPrice(targetPrice);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.connect(user1).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      const spotPriceBefore = await getSpotPrice(deployment);
      const stablecoinSupplyBefore = await StablecoinToken.totalSupply();
      const treasuryBalanceBefore = await ReserveToken.balanceOf(
        Treasury.address
      );

      // Buy expansionary bond
      await (
        await StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).wait();

      const spotPriceAfter = await getSpotPrice(deployment);
      const stablecoinSupplyAfter = await StablecoinToken.totalSupply();
      const treasuryBalanceAfter = await ReserveToken.balanceOf(
        Treasury.address
      );

      // Lower difference in price after the purchase
      expect(targetPrice.sub(spotPriceBefore).abs()).gt(
        targetPrice.sub(spotPriceAfter).abs()
      );
      // Stablecoin supply increase by reserve amount * external oracle price
      expect(stablecoinSupplyAfter).eq(
        stablecoinSupplyBefore.add(targetPrice.mul(1000))
      );
      // Treasury should receive the purchased amount plus the amount from the swap
      expect(treasuryBalanceAfter).gt(
        treasuryBalanceBefore.add(amountIn).add(amountIn)
      );
    });
    it("contractionary bond should bring stablecoin prices up on pool", async () => {
      const deployment = await whenDeployed();
      const {
        StabilizingBondDepository,
        MockChainlinkAggregator,
        ReserveToken,
        Treasury,
        StablecoinToken,
        user1,
      } = deployment;

      // Price is lower on LP, selling contractionary bond
      const targetPrice = exp(18).mul(1300).div(1000);
      const amountIn = exp(18).mul(1000);
      await MockChainlinkAggregator.setPrice(targetPrice);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.connect(user1).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      const spotPriceBefore = await getSpotPrice(deployment);
      const stablecoinSupplyBefore = await StablecoinToken.totalSupply();
      const treasuryBalanceBefore = await ReserveToken.balanceOf(
        Treasury.address
      );

      // Buy contractionary bond
      await (
        await StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).wait();

      const spotPriceAfter = await getSpotPrice(deployment);
      const stablecoinSupplyAfter = await StablecoinToken.totalSupply();
      const treasuryBalanceAfter = await ReserveToken.balanceOf(
        Treasury.address
      );

      // Lower difference in price after the purchase
      expect(targetPrice.sub(spotPriceBefore).abs()).gt(
        targetPrice.sub(spotPriceAfter).abs()
      );
      // Stablecoin supply decreases by swapped amount
      expect(stablecoinSupplyAfter).lt(
        stablecoinSupplyBefore.sub(amountIn.mul(1300).div(1000))
      );
      // Treasury's reserve balance should not change
      expect(treasuryBalanceAfter).eq(treasuryBalanceBefore);

      // TODO: bond should be created and issued
    });
    it("should issue bond on purchase", async () => {
      const deployment = await whenDeployed();
      const {
        StabilizingBondDepository,
        MockChainlinkAggregator,
        ReserveToken,
        user1,
      } = deployment;

      // Price is higher on LP, selling expansionary bond
      const targetPrice = exp(18).mul(1500).div(1000);
      const amountIn = exp(18).mul(1000);
      await MockChainlinkAggregator.setPrice(targetPrice);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.connect(user1).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      const reward = await StabilizingBondDepository.getCurrentReward();

      const bondCountBefore = await StabilizingBondDepository.bondsCount();

      // Buy expansionary bond
      await (
        await StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).wait();

      const bondCountAfter = await StabilizingBondDepository.bondsCount();
      const bondOwner = await StabilizingBondDepository.bondOwners(1);
      const ownedBonds = await StabilizingBondDepository.listBondIds(
        user1.address
      );
      const bondsList = await StabilizingBondDepository.listBonds(
        user1.address
      );

      expect(bondCountAfter.sub(bondCountBefore)).to.eq(1);
      expect(bondOwner).to.eq(user1.address);
      expect(ownedBonds.length).to.eq(1);
      expect(ownedBonds[0]).to.eq(1);
      expect(bondsList[0].id).to.eq(1);
      expect(bondsList[0].vestingPeriod).to.eq(60 * 60 * 6);
      expect(bondsList[0].principal).to.closeTo(
        reward.mul(amountIn).div(exp(18)),
        100000
      );
    });
    it("should handle multiple bonds purchased", async () => {
      const deployment = await whenDeployed();
      const {
        StabilizingBondDepository,
        MockChainlinkAggregator,
        BluejayToken,
        ReserveToken,
        deployer,
        user1,
      } = deployment;

      // Price is higher on LP, selling expansionary bond
      const targetPrice = exp(18).mul(1500).div(1000);
      const amountIn = exp(18).mul(1000);
      await MockChainlinkAggregator.setPrice(targetPrice);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.mint(deployer.address, amountIn);
      await ReserveToken.connect(user1).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      await ReserveToken.connect(deployer).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      const reward = await StabilizingBondDepository.getCurrentReward();

      const bondCountBefore = await StabilizingBondDepository.bondsCount();

      // Buy expansionary bonds
      await (
        await StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).wait();
      await increaseTime(60 * 60, ethers.provider);
      await (
        await StabilizingBondDepository.connect(deployer).purchase(
          amountIn,
          0,
          deployer.address
        )
      ).wait();
      await increaseTime(60 * 60, ethers.provider);
      await (
        await StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).wait();

      const bondCountAfter = await StabilizingBondDepository.bondsCount();
      const ownedBonds = await StabilizingBondDepository.listBondIds(
        user1.address
      );
      const bondsList = await StabilizingBondDepository.listBonds(
        user1.address
      );

      // 3 bonds issued, 2 belongs to user 1
      expect(bondCountAfter.sub(bondCountBefore)).to.eq(3);
      expect(ownedBonds.length).to.eq(2);

      expect(ownedBonds[0]).to.eq(1);
      expect(bondsList[0].id).to.eq(1);
      expect(bondsList[0].vestingPeriod).to.eq(60 * 60 * 6);
      expect(bondsList[0].principal).to.closeTo(
        reward.mul(amountIn).div(exp(18)),
        100000
      );

      // Third bond should have much lower principal since the price is much close to peg
      expect(ownedBonds[1]).to.eq(3);
      expect(bondsList[1].id).to.eq(3);
      expect(bondsList[1].vestingPeriod).to.eq(60 * 60 * 6);
      expect(bondsList[1].principal).to.lt(reward.mul(amountIn).div(exp(18)));

      // Bond #1 should be about 1/3 vested (2 hours/6 hours)
      await StabilizingBondDepository.connect(user1).redeem(1, user1.address);
      const bluBalance = await BluejayToken.balanceOf(user1.address);
      const principal = reward.mul(amountIn).div(exp(18));
      expect(bluBalance).to.gt(principal.mul(33).div(100));
      expect(bluBalance).to.lt(principal.mul(34).div(100));

      // Bond #1 can be fully redeemed in another 4 hours
      await increaseTime(60 * 60 * 4, ethers.provider);
      await StabilizingBondDepository.connect(user1).redeem(1, user1.address);
      expect(await BluejayToken.balanceOf(user1.address)).to.closeTo(
        principal,
        100000
      );

      expect(await StabilizingBondDepository.bondsCount()).to.eq(3);
      expect(
        (await StabilizingBondDepository.listBondIds(user1.address)).length
      ).to.eq(1);
    });
    it("should not allow purchase to bring price past the peg", async () => {
      const deployment = await whenDeployed();
      const {
        StabilizingBondDepository,
        MockChainlinkAggregator,
        ReserveToken,
        user1,
      } = deployment;

      // Price is higher on LP, selling expansionary bond
      const targetPrice = exp(18).mul(1500).div(1000);
      const amountIn = exp(18).mul(3500); // will bring price over 1.5
      await MockChainlinkAggregator.setPrice(targetPrice);
      await ReserveToken.mint(user1.address, amountIn);
      await ReserveToken.connect(user1).approve(
        StabilizingBondDepository.address,
        constants.MaxUint256
      );

      await expect(
        StabilizingBondDepository.connect(user1).purchase(
          amountIn,
          0,
          user1.address
        )
      ).to.revertedWith("Overcorrection");
    });
  });
});
