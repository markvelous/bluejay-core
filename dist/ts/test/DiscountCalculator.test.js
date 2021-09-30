"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
const utils_1 = require("./utils");
describe("DiscountCalculator", () => {
    it("discounts price correctly", async () => {
        const Calculator = await hardhat_1.ethers.getContractFactory("StairstepExponentialDecrease");
        const calculator = await hardhat_1.upgrades.deployProxy(Calculator, []);
        await calculator.updateStep(60); // 60 sec
        await calculator.updateFactorPerStep(utils_1.exp(27).mul(99).div(100)); // 0.99 per step
        // No discount on first 60 seconds
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 0)).to.equal(utils_1.exp(27).mul(1000));
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 1)).to.equal(utils_1.exp(27).mul(1000));
        // 0.99x after 1 period
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 60)).to.equal("990000000000000000000000000000");
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 61)).to.equal("990000000000000000000000000000");
        // After 60 periods
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 3600)).to.equal("547156642390761476194741371000");
        // Stress-test
        chai_1.expect(await calculator.discountPrice(utils_1.exp(45).mul(100000), 3600)).to.equal("54715664239076147619474137100000000000000000000000");
        chai_1.expect(await calculator.discountPrice(utils_1.exp(0).mul(100000), 3600)).to.equal("54715");
        chai_1.expect(await calculator.discountPrice(utils_1.exp(27).mul(1000), 360000)).to.equal("6000");
    });
});
