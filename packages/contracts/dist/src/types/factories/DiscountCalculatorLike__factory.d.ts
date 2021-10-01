import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { DiscountCalculatorLike, DiscountCalculatorLikeInterface } from "../DiscountCalculatorLike";
export declare class DiscountCalculatorLike__factory {
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
    static createInterface(): DiscountCalculatorLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DiscountCalculatorLike;
}
