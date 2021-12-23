import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { exp, increaseTime } from "../src/utils";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const whenDeployed = deployments.createFixture(
  async ({ deployments: fixtureDeployments, getNamedAccounts }) => {
    await fixtureDeployments.fixture(["TreasuryBondDepositoryMocked"]);

    const {
      deployer: deployerAddress,
      user1: user1Address,
      user2: user2Address,
    } = await getNamedAccounts();

    const deployer = await ethers.getSigner(deployerAddress);
    const user1 = await ethers.getSigner(user1Address);
    const user2 = await ethers.getSigner(user2Address);

    const { address: governanceTokenAddress } = await deployments.get(
      "BluejayTokenProxy"
    );
    const BluejayToken = await ethers.getContractAt(
      "BluejayToken",
      governanceTokenAddress,
      deployer
    );

    const { address: treasuryAddress } = await deployments.get("TreasuryProxy");
    const Treasury = await ethers.getContractAt(
      "Treasury",
      treasuryAddress,
      deployer
    );

    const { address: bondDepositoryAddress } = await deployments.get(
      "TreasuryBondDepositoryProxy"
    );
    const TreasuryBondDepository = await ethers.getContractAt(
      "TreasuryBondDepository",
      bondDepositoryAddress,
      deployer
    );

    const { address: mockReserveAddress } = await deployments.get(
      "MockReserveToken"
    );
    const MockReserveToken = await ethers.getContractAt(
      "MockReserveToken",
      mockReserveAddress,
      deployer
    );

    await Treasury.grantRole(MINTER_ROLE, deployerAddress);
    await Treasury.grantRole(MINTER_ROLE, bondDepositoryAddress);

    // Pre-mint tokens to create initial supply
    await Treasury.mint(deployerAddress, ethers.utils.parseEther("100000"));

    // Fund user1 and user2 with 1 mil USD each
    await MockReserveToken.mint(
      user1Address,
      ethers.utils.parseEther("1000000")
    );
    await MockReserveToken.mint(
      user2Address,
      ethers.utils.parseEther("1000000")
    );

    // Pre-approve bondDepository to spend users tokens
    await MockReserveToken.connect(user1).approve(
      TreasuryBondDepository.address,
      ethers.constants.MaxUint256
    );
    await MockReserveToken.connect(user2).approve(
      TreasuryBondDepository.address,
      ethers.constants.MaxUint256
    );

    return {
      Treasury,
      BluejayToken,
      TreasuryBondDepository,
      MockReserveToken,
      deployer,
      user1,
      user2,
    };
  }
);

describe("TreasuryBondDepository", () => {
  it("should price bond at minimum price when no bond is sold yet", async () => {
    const { TreasuryBondDepository } = await whenDeployed();
    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));
  });
  it("should allow users to buy the bonds", async () => {
    const { TreasuryBondDepository, user1 } = await whenDeployed();

    const purchaseTx = await TreasuryBondDepository.connect(user1).purchase(
      exp(18),
      exp(18).mul(2),
      user1.address
    );

    await expect(purchaseTx).to.emit(TreasuryBondDepository, "BondPurchased");

    expect(await TreasuryBondDepository.totalDebt()).to.eq(exp(18));
    expect(await TreasuryBondDepository.bondsCount()).to.eq(1);
    expect(await TreasuryBondDepository.ownedBonds(user1.address, 0)).to.eq(1);
    expect(
      await TreasuryBondDepository.ownedBondsIndex(user1.address, 1)
    ).to.eq(0);

    const { principal, vestingPeriod } = await TreasuryBondDepository.bonds(1);

    expect(principal).to.eq(exp(18));
    expect(vestingPeriod).to.eq(7 * 24 * 60 * 60);
  });
  it("should adjust bond price based on bonds sold", async () => {
    const { TreasuryBondDepository, user1 } = await whenDeployed();

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    await TreasuryBondDepository.connect(user1).purchase(
      exp(18).mul(1000),
      exp(18).mul(2),
      user1.address
    );
    expect(await TreasuryBondDepository.bondPrice()).to.gt(exp(18));

    await TreasuryBondDepository.connect(user1).purchase(
      exp(18).mul(1100),
      exp(18).mul(10),
      user1.address
    );
    expect(await TreasuryBondDepository.bondPrice()).to.gt(exp(18).mul(4));

    await TreasuryBondDepository.connect(user1).purchase(
      exp(18).mul(1200),
      exp(18).mul(10),
      user1.address
    );
    expect(await TreasuryBondDepository.bondPrice()).to.gt(exp(18).mul(5));

    await TreasuryBondDepository.connect(user1).purchase(
      exp(18).mul(1300),
      exp(18).mul(10),
      user1.address
    );
    expect(await TreasuryBondDepository.bondPrice()).to.gt(exp(18).mul(6));
  });
  it("should discount bond price when demand is low", async () => {
    const { TreasuryBondDepository, user1 } = await whenDeployed();

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    for (let i = 0; i < 10; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await TreasuryBondDepository.connect(user1).purchase(
        exp(18).mul(1000),
        exp(18).mul(10),
        user1.address
      );
    }

    const previousPrice = await TreasuryBondDepository.bondPrice();

    // Simulate period of zero sale
    await increaseTime(60 * 60, ethers.provider);

    expect(await TreasuryBondDepository.bondPrice()).to.lt(previousPrice);
  });
  it("should allow users to redeem bond early and frequently", async () => {
    const { TreasuryBondDepository, user1, BluejayToken } =
      await whenDeployed();

    const amountPaid = exp(18).mul(1000);

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    await TreasuryBondDepository.connect(user1).purchase(
      amountPaid,
      exp(18).mul(10),
      user1.address
    );

    // After one day
    await increaseTime(24 * 60 * 60, ethers.provider);

    const bondBeforeRedeem = await TreasuryBondDepository.bonds(1);
    const redeemTx = await TreasuryBondDepository.connect(user1).redeem(
      1,
      user1.address
    );
    const bondAfterRedeem = await TreasuryBondDepository.bonds(1);

    await expect(redeemTx).to.emit(TreasuryBondDepository, "BondRedeemed");

    // Redemption info should be updated
    expect(bondBeforeRedeem.lastRedeemed).to.lt(
      bondAfterRedeem.lastRedeemed.sub(24 * 60 * 60)
    );
    expect(bondBeforeRedeem.vestingPeriod).to.gt(
      bondAfterRedeem.vestingPeriod.add(24 * 60 * 60)
    );

    // Less than 6/7 of the principal should be left
    expect(bondBeforeRedeem.principal).to.gt(
      bondAfterRedeem.principal.add(amountPaid.div(7))
    );

    // Governance token should be sent to user
    expect(await BluejayToken.balanceOf(user1.address)).to.eq(
      bondBeforeRedeem.principal.sub(bondAfterRedeem.principal)
    );

    // After another day
    await increaseTime(24 * 60 * 60, ethers.provider);
    await TreasuryBondDepository.connect(user1).redeem(1, user1.address);
    const bondAfterSecondRedeem = await TreasuryBondDepository.bonds(1);

    // Less than 5/7 of the principal should be left
    expect(bondBeforeRedeem.principal).to.gt(
      bondAfterSecondRedeem.principal.add(amountPaid.div(7).mul(2))
    );

    // Governance token should be sent to user
    expect(await BluejayToken.balanceOf(user1.address)).to.eq(
      bondBeforeRedeem.principal.sub(bondAfterSecondRedeem.principal)
    );
  });
  it("should allow users to buy multiple bonds", async () => {
    const { TreasuryBondDepository, user1, user2 } = await whenDeployed();

    await TreasuryBondDepository.connect(user1).purchase(
      exp(18),
      exp(18).mul(2),
      user1.address
    );
    await TreasuryBondDepository.connect(user1).purchase(
      exp(18),
      exp(18).mul(2),
      user1.address
    );
    await TreasuryBondDepository.connect(user2).purchase(
      exp(18),
      exp(18).mul(2),
      user2.address
    );
    await TreasuryBondDepository.connect(user2).purchase(
      exp(18),
      exp(18).mul(2),
      user2.address
    );
    await TreasuryBondDepository.connect(user1).purchase(
      exp(18),
      exp(18).mul(2),
      user1.address
    );
    await TreasuryBondDepository.connect(user2).purchase(
      exp(18),
      exp(18).mul(2),
      user2.address
    );

    const user1BondIds = await TreasuryBondDepository.listBondIds(
      user1.address
    );
    expect(user1BondIds[0]).to.eq(1);
    expect(user1BondIds[1]).to.eq(2);
    expect(user1BondIds[2]).to.eq(5);

    const user2BondIds = await TreasuryBondDepository.listBondIds(
      user2.address
    );
    expect(user2BondIds[0]).to.eq(3);
    expect(user2BondIds[1]).to.eq(4);

    const user1Bonds = await TreasuryBondDepository.listBonds(user1.address);

    expect(user1Bonds[0].id).to.eq(1);
    expect(user1Bonds[0].principal).to.eq(exp(18));
    expect(user1Bonds[0].vestingPeriod).to.eq(7 * 24 * 60 * 60);

    expect(user1Bonds[2].id).to.eq(5);
    expect(user1Bonds[2].principal).to.lt(exp(18));
    expect(user1Bonds[2].principal).to.gt(exp(18).mul(98).div(100));
    expect(user1Bonds[2].vestingPeriod).to.eq(7 * 24 * 60 * 60);
  });
  it("should delete bond after the bond is fully redeemed", async () => {
    const { TreasuryBondDepository, user1, BluejayToken } =
      await whenDeployed();

    const amountPaid = exp(18).mul(1000);

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    await TreasuryBondDepository.connect(user1).purchase(
      amountPaid,
      exp(18).mul(10),
      user1.address
    );

    // After 7 day
    await increaseTime(7 * 24 * 60 * 60, ethers.provider);
    await TreasuryBondDepository.connect(user1).redeem(1, user1.address);

    // Add one more bond (testing listing)
    await TreasuryBondDepository.connect(user1).purchase(
      amountPaid,
      exp(18).mul(10),
      user1.address
    );

    // Governance token should be sent to user
    expect(await BluejayToken.balanceOf(user1.address)).to.eq(amountPaid);

    // Bond should be deleted
    const bondAfterRedeem = await TreasuryBondDepository.bonds(1);
    expect(bondAfterRedeem.id).to.eq(0);
    expect(bondAfterRedeem.principal).to.eq(0);
    expect(bondAfterRedeem.vestingPeriod).to.eq(0);
    expect(bondAfterRedeem.lastRedeemed).to.eq(0);

    // Bond should not be listed under owner
    const usersBond = await TreasuryBondDepository.listBondIds(user1.address);
    expect(usersBond.length).to.eq(1);
    expect(usersBond[0]).to.eq(2);
  });
  it("should not have stray tokens", async () => {
    const {
      TreasuryBondDepository,
      Treasury,
      user1,
      BluejayToken,
      MockReserveToken,
    } = await whenDeployed();

    const amountPaid = exp(18).mul(1000);
    await TreasuryBondDepository.connect(user1).purchase(
      amountPaid,
      exp(18).mul(10),
      user1.address
    );

    await increaseTime(24 * 60 * 60, ethers.provider);

    await TreasuryBondDepository.connect(user1).redeem(1, user1.address);

    expect(await BluejayToken.balanceOf(Treasury.address)).to.eq(0);
    expect(
      await MockReserveToken.balanceOf(TreasuryBondDepository.address)
    ).to.eq(0);
  });
  it("should allow pausing and unpausing of purchase", async () => {
    const { TreasuryBondDepository, user1 } = await whenDeployed();

    const amountPaid = exp(18).mul(1000);

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    await TreasuryBondDepository.setIsPurchasePaused(true);

    await expect(
      TreasuryBondDepository.connect(user1).purchase(
        amountPaid,
        exp(18).mul(10),
        user1.address
      )
    ).to.be.revertedWith("Purchase paused");

    await TreasuryBondDepository.setIsPurchasePaused(false);

    await expect(
      TreasuryBondDepository.connect(user1).purchase(
        amountPaid,
        exp(18).mul(10),
        user1.address
      )
    ).not.to.be.reverted;
  });
  it("should allow pausing and unpausing of redeem", async () => {
    const { TreasuryBondDepository, user1 } = await whenDeployed();

    const amountPaid = exp(18).mul(1000);

    expect(await TreasuryBondDepository.bondPrice()).to.eq(exp(18));

    await TreasuryBondDepository.connect(user1).purchase(
      amountPaid,
      exp(18).mul(10),
      user1.address
    );

    // After one day
    await increaseTime(24 * 60 * 60, ethers.provider);

    await TreasuryBondDepository.setIsRedeemPaused(true);

    await expect(
      TreasuryBondDepository.connect(user1).redeem(1, user1.address)
    ).to.be.revertedWith("Redeem paused");

    await TreasuryBondDepository.setIsRedeemPaused(false);

    await expect(TreasuryBondDepository.connect(user1).redeem(1, user1.address))
      .not.to.be.reverted;
  });
});
