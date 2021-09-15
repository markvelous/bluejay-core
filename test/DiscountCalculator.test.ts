import { ethers } from "hardhat";
import { expect } from "chai";
import { exp } from "./utils";

describe("DiscountCalculator", () => {
  it("discounts price correctly", async () => {
    const Calculator = await ethers.getContractFactory(
      "StairstepExponentialDecrease"
    );
    const calculator = await Calculator.deploy();

    await calculator.updateStep(60); // 60 sec
    await calculator.updateFactorPerStep(exp(27).mul(99).div(100)); // 0.99 per step

    // No discount on first 60 seconds
    expect(await calculator.discountPrice(exp(27).mul(1000), 0)).to.equal(
      exp(27).mul(1000)
    );
    expect(await calculator.discountPrice(exp(27).mul(1000), 1)).to.equal(
      exp(27).mul(1000)
    );

    // 0.99x after 1 period
    expect(await calculator.discountPrice(exp(27).mul(1000), 60)).to.equal(
      "990000000000000000000000000000"
    );
    expect(await calculator.discountPrice(exp(27).mul(1000), 61)).to.equal(
      "990000000000000000000000000000"
    );

    // After 60 periods
    expect(await calculator.discountPrice(exp(27).mul(1000), 3600)).to.equal(
      "547156642390761476194741371000"
    );

    // Stress-test
    expect(await calculator.discountPrice(exp(45).mul(100000), 3600)).to.equal(
      "54715664239076147619474137100000000000000000000000"
    );
    expect(await calculator.discountPrice(exp(0).mul(100000), 3600)).to.equal(
      "54715"
    );
    expect(await calculator.discountPrice(exp(27).mul(1000), 360000)).to.equal(
      "6000"
    );
  });
});
