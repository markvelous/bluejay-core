import { BigNumber } from "@ethersproject/bignumber";
import { ContractReceipt } from "@ethersproject/contracts";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { exp } from "../src/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const MANAGER_ROLE =
  "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";
const OPERATOR_ROLE =
  "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929";
const UNISWAP_MINIMUM_LIQUIDITY = 1000; // https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["MockStablecoinEngine"]);

    const { deployer: deployerAddress, user1: user1Address } =
      await getNamedAccounts();
    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);
    const { address: stablecoinAddress } = await deployments.get(
      "StablecoinTokenProxy"
    );
    const StablecoinToken = await ethers.getContractAt(
      "StablecoinToken",
      stablecoinAddress,
      deployer
    );
    const { address: reserveTokenAddress } = await deployments.get(
      "MockReserveToken"
    );
    const ReserveToken = await ethers.getContractAt(
      "MockReserveToken",
      reserveTokenAddress,
      deployer
    );
    const { address: treasuryAddress } = await deployments.get("TreasuryProxy");
    const Treasury = await ethers.getContractAt(
      "Treasury",
      treasuryAddress,
      deployer
    );
    const { address: stablecoinEngineAddress } = await deployments.get(
      "StablecoinEngineProxy"
    );
    const StablecoinEngine = await ethers.getContractAt(
      "StablecoinEngine",
      stablecoinEngineAddress,
      deployer
    );
    const { address: poolFactoryAddress } = await deployments.get(
      "MockUniswapV2Factory"
    );
    const PoolFactory = await ethers.getContractAt(
      "IUniswapV2Factory",
      poolFactoryAddress,
      deployer
    );
    await StablecoinEngine.grantRole(MANAGER_ROLE, deployer.address);
    await StablecoinEngine.grantRole(OPERATOR_ROLE, deployer.address);

    // Assuming treasury has reserves in it already
    await ReserveToken.mint(Treasury.address, exp(18).mul(1000000));
    return {
      PoolFactory,
      StablecoinToken,
      ReserveToken,
      Treasury,
      StablecoinEngine,
      deployer,
      user1,
    };
  }
);

const getPoolAddress = (tx: ContractReceipt): string => {
  if (!tx.events) throw new Error("No events");
  const poolAddedEvent = tx.events.find((e: any) => e.event === "PoolAdded");
  if (!poolAddedEvent || !poolAddedEvent.args)
    throw new Error("PoolAdded event not found");
  const poolAddress = poolAddedEvent.args.pool;
  if (!poolAddress) throw new Error("Pool address not found");
  return poolAddress;
};

const whenDeployedWithLiquidity = async () => {
  const deployment = await whenDeployed();
  const { ReserveToken, StablecoinToken, StablecoinEngine, deployer } =
    deployment;
  const tx = await (
    await StablecoinEngine.initializeStablecoin(
      ReserveToken.address,
      StablecoinToken.address,
      exp(18).mul(100000),
      exp(18).mul(140000)
    )
  ).wait();
  const poolAddress = getPoolAddress(tx);
  const UniswapPool = await ethers.getContractAt(
    "IUniswapV2Pair",
    poolAddress,
    deployer
  );
  return {
    ...deployment,
    UniswapPool,
  };
};

describe("StablecoinEngine", () => {
  it("should allow manager to create a pool and add liquidity", async () => {
    const {
      ReserveToken,
      StablecoinToken,
      Treasury,
      StablecoinEngine,
      deployer,
    } = await whenDeployed();
    const stablecoinInitialTotalSupply = await StablecoinToken.totalSupply();
    const reserveInitialBalance = await ReserveToken.balanceOf(
      Treasury.address
    );
    const tx = await (
      await StablecoinEngine.initializeStablecoin(
        ReserveToken.address,
        StablecoinToken.address,
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).wait();

    // 140k stablecoin tokens minted
    expect(await StablecoinToken.totalSupply()).eq(
      stablecoinInitialTotalSupply.add(exp(18).mul(140000))
    );
    // 100k reserve tokens transferred from treasury
    expect(await ReserveToken.balanceOf(Treasury.address)).eq(
      reserveInitialBalance.sub(exp(18).mul(100000))
    );

    const poolAddress = getPoolAddress(tx);
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      deployer
    );
    const lpTotalSupply = await UniswapPool.totalSupply();

    // LP token sent to treasury
    expect(lpTotalSupply).to.eq("118321595661992320851346"); // sqr(r0,r1)-1000
    expect(await UniswapPool.balanceOf(Treasury.address)).to.eq(
      lpTotalSupply.sub(UNISWAP_MINIMUM_LIQUIDITY)
    );
  });

  it("should allow manager to add existing pool", async () => {
    const {
      ReserveToken,
      StablecoinToken,
      PoolFactory,
      StablecoinEngine,
      deployer,
    } = await whenDeployed();
    const tx = await (
      await PoolFactory.createPair(
        ReserveToken.address,
        StablecoinToken.address
      )
    ).wait();
    if (!tx.events || !tx.events[0].args) throw new Error("No events");
    const poolAddress: string = tx.events[0].args.pair;
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      deployer
    );

    // Add liquidity manually
    await StablecoinToken.grantRole(MINTER_ROLE, deployer.address);
    await StablecoinToken.mint(poolAddress, exp(18).mul(14000));
    await ReserveToken.mint(poolAddress, exp(18).mul(10000));
    await UniswapPool.mint(deployer.address);

    // Initialize the stablecoin info in the engine
    await StablecoinEngine.initializeExistingPool(
      ReserveToken.address,
      StablecoinToken.address
    );

    expect(
      await StablecoinEngine.pools(
        ReserveToken.address,
        StablecoinToken.address
      )
    ).to.eq(poolAddress);
  });

  it("should allow operator to add liquidity to a pool", async () => {
    const {
      ReserveToken,
      StablecoinToken,
      Treasury,
      StablecoinEngine,
      deployer,
    } = await whenDeployed();
    const tx = await (
      await StablecoinEngine.initializeStablecoin(
        ReserveToken.address,
        StablecoinToken.address,
        exp(18).mul(10000),
        exp(18).mul(14000)
      )
    ).wait();
    const poolAddress = getPoolAddress(tx);
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      deployer
    );
    const treasuryLiquidity = await UniswapPool.balanceOf(Treasury.address);
    await StablecoinEngine.addLiquidity(
      poolAddress,
      exp(18).mul(100000),
      exp(18).mul(140000),
      exp(18).mul(90000),
      exp(18).mul(130000)
    );

    expect(await UniswapPool.balanceOf(Treasury.address)).to.eq(
      treasuryLiquidity
        .add(UNISWAP_MINIMUM_LIQUIDITY)
        .mul(11)
        .sub(UNISWAP_MINIMUM_LIQUIDITY)
    );
    expect(await StablecoinToken.totalSupply()).to.eq(
      exp(18).mul(140000 + 14000)
    );
  });

  it("should allow operator to add liquidity to a pool with slippages", async () => {
    const {
      ReserveToken,
      StablecoinToken,
      Treasury,
      StablecoinEngine,
      deployer,
      user1,
    } = await whenDeployed();
    const tx = await (
      await StablecoinEngine.initializeStablecoin(
        ReserveToken.address,
        StablecoinToken.address,
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).wait();
    const poolAddress = getPoolAddress(tx);
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      deployer
    );

    // Create a swap
    await StablecoinToken.grantRole(MINTER_ROLE, deployer.address);
    await StablecoinToken.mint(poolAddress, exp(18).mul(1000));
    const stablecoinIsToken0 =
      (await UniswapPool.token0()) === StablecoinToken.address;
    const stablesInWithFee = exp(18).mul(1000).mul(997);
    const numerator = stablesInWithFee.mul(exp(18).mul(100000));
    const denominator = exp(18).mul(140000).mul(1000).add(stablesInWithFee);
    const reserveOut = numerator.div(denominator);
    await UniswapPool.swap(
      stablecoinIsToken0 ? BigNumber.from(0) : reserveOut,
      stablecoinIsToken0 ? reserveOut : BigNumber.from(0),
      user1.address,
      "0x"
    );
    await StablecoinEngine.addLiquidity(
      poolAddress,
      exp(18).mul(100000),
      exp(18).mul(140000),
      exp(18).mul(90000),
      exp(18).mul(130000)
    );

    // Will fail when too much slippage
    expect(await UniswapPool.balanceOf(Treasury.address)).to.eq(
      "235804031071062710348135"
    );
  });

  it("should fail when trying to add liquidity with excessive slippages", async () => {
    const { ReserveToken, StablecoinToken, StablecoinEngine, deployer, user1 } =
      await whenDeployed();
    const tx = await (
      await StablecoinEngine.initializeStablecoin(
        ReserveToken.address,
        StablecoinToken.address,
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).wait();
    const poolAddress = getPoolAddress(tx);
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      deployer
    );

    // Create a swap
    await StablecoinToken.grantRole(MINTER_ROLE, deployer.address);
    await StablecoinToken.mint(poolAddress, exp(18).mul(1000));
    const stablecoinIsToken0 =
      (await UniswapPool.token0()) === StablecoinToken.address;
    const stablesInWithFee = exp(18).mul(1000).mul(997);
    const numerator = stablesInWithFee.mul(exp(18).mul(100000));
    const denominator = exp(18).mul(140000).mul(1000).add(stablesInWithFee);
    const reserveOut = numerator.div(denominator);
    await UniswapPool.swap(
      stablecoinIsToken0 ? BigNumber.from(0) : reserveOut,
      stablecoinIsToken0 ? reserveOut : BigNumber.from(0),
      user1.address,
      "0x"
    );

    // Will fail when too much slippage
    await expect(
      StablecoinEngine.addLiquidity(
        poolAddress,
        exp(18).mul(100000),
        exp(18).mul(140000),
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).to.revertedWith("Insufficient reserve");
  });

  it("should allow operator to swap from stablecoin to reserve", async () => {
    const {
      StablecoinEngine,
      UniswapPool,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployedWithLiquidity();
    const treasuryReserveBefore = await ReserveToken.balanceOf(
      Treasury.address
    );
    const stablecoinSupplyBefore = await StablecoinToken.totalSupply();
    const reservesBefore = await StablecoinToken.balanceOf(UniswapPool.address);

    // Attempt to swap 1400 SGD to more than 980 USD
    await StablecoinEngine.swap(
      UniswapPool.address,
      exp(18).mul(1400),
      exp(18).mul(980),
      true
    );

    const treasuryReserveAfter = await ReserveToken.balanceOf(Treasury.address);
    const stablecoinSupplyAfter = await StablecoinToken.totalSupply();
    const reservesAfter = await StablecoinToken.balanceOf(UniswapPool.address);

    // Reserve in treasury should increase
    expect(treasuryReserveAfter.sub(treasuryReserveBefore)).to.eq(
      "987158034397061298850"
    );

    // Total supply of stablecoin should increase
    expect(stablecoinSupplyAfter.sub(stablecoinSupplyBefore)).to.eq(
      exp(18).mul(1400)
    );

    // Stablecoin in pool should increase
    expect(reservesAfter.sub(reservesBefore)).to.eq(exp(18).mul(1400));

    // Should not have remaining tokens in the engine
    expect(await ReserveToken.balanceOf(StablecoinEngine.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(StablecoinEngine.address)).to.eq(0);
  });

  it("should allow operator to swap from reserve to stablecoin", async () => {
    const {
      StablecoinEngine,
      UniswapPool,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployedWithLiquidity();
    const treasuryReserveBefore = await ReserveToken.balanceOf(
      Treasury.address
    );
    const stablecoinSupplyBefore = await StablecoinToken.totalSupply();
    const reservesBefore = await ReserveToken.balanceOf(UniswapPool.address);

    // Attempt to swap 1000 USD to more than 1350 SGD
    await StablecoinEngine.swap(
      UniswapPool.address,
      exp(18).mul(1000),
      exp(18).mul(1350),
      false
    );
    const treasuryReserveAfter = await ReserveToken.balanceOf(Treasury.address);
    const stablecoinSupplyAfter = await StablecoinToken.totalSupply();
    const reservesAfter = await ReserveToken.balanceOf(UniswapPool.address);

    // Reserve in treasury should decrease
    expect(treasuryReserveBefore.sub(treasuryReserveAfter)).to.eq(
      exp(18).mul(1000)
    );

    // Total supply of stablecoin should decrease
    expect(stablecoinSupplyBefore.sub(stablecoinSupplyAfter)).to.eq(
      "1382021248155885818390"
    );

    // Reserve in pool should increase
    expect(reservesAfter.sub(reservesBefore)).to.eq(exp(18).mul(1000));

    // Should not have remaining tokens in the engine
    expect(await ReserveToken.balanceOf(StablecoinEngine.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(StablecoinEngine.address)).to.eq(0);
  });

  it("should not allow operator to add liquidity to uninitialized pools", async () => {
    const { StablecoinEngine, user1 } = await whenDeployed();
    await expect(
      StablecoinEngine.connect(user1).addLiquidity(
        "0x0000000000000000000000000000000000000000",
        exp(18).mul(100000),
        exp(18).mul(140000),
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).to.revertedWith(
      "is missing role 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08"
    );
  });

  it("should not allow operator to swap with excessive slippages", async () => {
    const { ReserveToken, StablecoinToken, StablecoinEngine, user1 } =
      await whenDeployed();
    const tx = await (
      await StablecoinEngine.initializeStablecoin(
        ReserveToken.address,
        StablecoinToken.address,
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).wait();
    const poolAddress = getPoolAddress(tx);
    const UniswapPool = await ethers.getContractAt(
      "IUniswapV2Pair",
      poolAddress,
      user1
    );

    expect(
      StablecoinEngine.swap(
        UniswapPool.address,
        exp(18).mul(1400),
        exp(18).mul(997),
        true
      )
    ).to.revertedWith("Insufficient output");
  });

  it("should not allow non-managers to initialize pools", async () => {
    const { ReserveToken, StablecoinToken, StablecoinEngine, user1 } =
      await whenDeployed();
    await expect(
      StablecoinEngine.connect(user1).initializeExistingPool(
        ReserveToken.address,
        StablecoinToken.address
      )
    ).to.revertedWith(
      "is missing role 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08"
    );
  });

  it("should not allow non-managers to add liquidity", async () => {
    const { user1, StablecoinEngine, UniswapPool } =
      await whenDeployedWithLiquidity();
    await expect(
      StablecoinEngine.connect(user1).addLiquidity(
        UniswapPool.address,
        exp(18).mul(100000),
        exp(18).mul(140000),
        exp(18).mul(100000),
        exp(18).mul(140000)
      )
    ).to.revertedWith(
      "is missing role 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08"
    );
  });

  it("should not allow non-managers to remove liquidity", async () => {
    const { UniswapPool, StablecoinEngine, user1 } =
      await whenDeployedWithLiquidity();
    await expect(
      StablecoinEngine.connect(user1).removeLiquidity(
        UniswapPool.address,
        exp(18).mul(1),
        100,
        100
      )
    ).to.be.revertedWith(
      "is missing role 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08"
    );
  });

  it("should not allow non-operator to swap", async () => {
    const { StablecoinEngine, UniswapPool, user1 } =
      await whenDeployedWithLiquidity();
    await expect(
      StablecoinEngine.connect(user1).swap(
        UniswapPool.address,
        exp(18).mul(1400),
        exp(18).mul(1000),
        true
      )
    ).to.be.revertedWith(
      "is missing role 0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929"
    );
  });

  it("should return the ordered reserves from the pool", async () => {
    const { UniswapPool, StablecoinEngine } = await whenDeployedWithLiquidity();
    const reserves = await StablecoinEngine.getReserves(UniswapPool.address);
    expect(reserves.reserveReserve).to.eq(exp(18).mul(100000));
    expect(reserves.stablecoinReserve).to.eq(exp(18).mul(140000));
  });

  it("should not have stray tokens", async () => {
    const {
      StablecoinEngine,
      UniswapPool,
      ReserveToken,
      Treasury,
      StablecoinToken,
    } = await whenDeployedWithLiquidity();
    await StablecoinEngine.swap(
      UniswapPool.address,
      exp(18).mul(1000),
      exp(18).mul(1350),
      false
    );
    expect(await ReserveToken.balanceOf(StablecoinEngine.address)).to.eq(0);
    expect(await StablecoinToken.balanceOf(StablecoinEngine.address)).to.eq(0);

    expect(await StablecoinToken.balanceOf(Treasury.address)).to.eq(0);
  });
});
