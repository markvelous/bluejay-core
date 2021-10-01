import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { LiquidationEngineLike, LiquidationEngineLikeInterface } from "../LiquidationEngineLike";
export declare class LiquidationEngineLike__factory {
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
    static createInterface(): LiquidationEngineLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): LiquidationEngineLike;
}
