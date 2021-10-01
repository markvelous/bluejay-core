import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { DiscountCalculator, DiscountCalculatorInterface } from "../DiscountCalculator";
export declare class DiscountCalculator__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): DiscountCalculatorInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DiscountCalculator;
}
