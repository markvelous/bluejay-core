import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { exp, increaseTime } from "../src/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["StakedToken"]);

    const { deployer: deployerAddress, user1: user1Address } =
      await getNamedAccounts();

    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);

    const { address: governanceTokenAddress } = await deployments.get(
      "BluejayTokenImpl"
    );
    const BluejayToken = await ethers.getContractAt(
      "BluejayToken",
      governanceTokenAddress,
      deployer
    );

    const { address: stakedBluejayTokenAddress } = await deployments.get(
      "StakedToken"
    );
    const StakedToken = await ethers.getContractAt(
      "StakedToken",
      stakedBluejayTokenAddress,
      deployer
    );

    const { address: treasuryAddress } = await deployments.get("TreasuryProxy");
    const Treasury = await ethers.getContractAt(
      "Treasury",
      treasuryAddress,
      deployer
    );

    await Treasury.grantRole(MINTER_ROLE, deployerAddress);

    return {
      Treasury,
      BluejayToken,
      StakedToken,
      deployer,
      user1,
    };
  }
);

describe("StakedToken", () => {
  it("should be initialized correctly", async () => {
    const { StakedToken, BluejayToken, Treasury } = await whenDeployed();
    expect(await StakedToken.interestRate()).to.eq(
      "1000000124049443431959642954"
    );
    expect(await StakedToken.totalSupply()).to.eq(0);
    expect(await StakedToken.BLU()).to.eq(BluejayToken.address);
    expect(await StakedToken.treasury()).to.eq(Treasury.address);
    expect(await StakedToken.accumulatedRates()).to.eq(exp(27));
    expect(await StakedToken.name()).to.eq("Staked BLU");
    expect(await StakedToken.symbol()).to.eq("sBLU");
  });
  it("should return compounded interest correctly", async () => {
    const { StakedToken } = await whenDeployed();
    expect(await StakedToken.compoundedInterest(365 * 24 * 60 * 60)).to.be.gt(
      exp(23).mul(499999)
    );
    expect(await StakedToken.compoundedInterest(365 * 24 * 60 * 60)).to.be.lt(
      exp(23).mul(500001)
    );
  });
  it("should store the states correctly", async () => {
    const { StakedToken, BluejayToken, Treasury, deployer, user1 } =
      await whenDeployed();

    await Treasury.grantRole(MINTER_ROLE, deployer.address);
    await Treasury.mint(user1.address, ethers.utils.parseEther("10"));
    await BluejayToken.connect(user1).approve(
      StakedToken.address,
      ethers.constants.MaxUint256
    );

    await StakedToken.connect(user1).stake(
      ethers.utils.parseEther("10"),
      user1.address
    );

    const expectedInitialNormalizedBalance = ethers.utils
      .parseEther("10")
      .mul(exp(27))
      .div(await StakedToken.currentAccumulatedRate());

    expect(await StakedToken.normalizedBalances(user1.address)).to.eq(
      expectedInitialNormalizedBalance
    );

    await StakedToken.connect(user1).transfer(
      deployer.address,
      ethers.utils.parseEther("5")
    );

    const expectedRecipientNormalizedBalance = ethers.utils
      .parseEther("5")
      .mul(exp(27))
      .div(await StakedToken.currentAccumulatedRate());
    expect(await StakedToken.normalizedBalances(deployer.address)).to.eq(
      expectedRecipientNormalizedBalance
    );
    expect(await StakedToken.normalizedBalances(user1.address)).to.eq(
      expectedInitialNormalizedBalance.sub(expectedRecipientNormalizedBalance)
    );
  });
  it("should allow users to stake and unstake correctly", async () => {
    const { BluejayToken, StakedToken, Treasury, user1 } = await whenDeployed();
    await Treasury.mint(user1.address, ethers.utils.parseEther("10"));

    // Stake tokens
    await BluejayToken.connect(user1).approve(
      StakedToken.address,
      ethers.constants.MaxUint256
    );
    await StakedToken.connect(user1).stake(
      ethers.utils.parseEther("10"),
      user1.address
    );

    expect(await StakedToken.balanceOf(user1.address)).closeTo(
      ethers.utils.parseEther("10"),
      10
    );
    expect(await BluejayToken.balanceOf(user1.address)).eq(0);
    expect(await BluejayToken.balanceOf(StakedToken.address)).eq(
      ethers.utils.parseEther("10")
    );

    // Wait for 1 year to pass
    await increaseTime(365 * 24 * 60 * 60, ethers.provider);

    expect(await StakedToken.balanceOf(user1.address)).closeTo(
      ethers.utils.parseEther("500"),
      100
    );

    // Unstake tokens
    await StakedToken.connect(user1).unstake(
      ethers.utils.parseEther("500"),
      user1.address
    );
    expect(await BluejayToken.balanceOf(user1.address)).closeTo(
      ethers.utils.parseEther("500"),
      100
    );
    expect(await StakedToken.balanceOf(user1.address)).eq(0);
  });
  it("should zero accounts with balances that are too small", async () => {
    const { StakedToken, BluejayToken, Treasury, deployer, user1 } =
      await whenDeployed();

    await Treasury.grantRole(MINTER_ROLE, deployer.address);
    await Treasury.mint(user1.address, ethers.utils.parseEther("10"));
    await BluejayToken.connect(user1).approve(
      StakedToken.address,
      ethers.constants.MaxUint256
    );

    await StakedToken.connect(user1).stake(
      ethers.utils.parseEther("10"),
      user1.address
    );
    const initialTotalBalance = await StakedToken.normalizedTotalSupply();

    await StakedToken.connect(user1).transfer(
      deployer.address,
      ethers.utils.parseEther("10")
    );
    expect(await StakedToken.balanceOf(user1.address)).eq(0);

    // Total supply is reduced when tokens are burned in small account
    expect(await StakedToken.normalizedTotalSupply()).lt(initialTotalBalance);
  });
});
