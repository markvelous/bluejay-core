import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { LiquidationAuctionCallee, LiquidationAuctionCalleeInterface } from "../LiquidationAuctionCallee";
export declare class LiquidationAuctionCallee__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): LiquidationAuctionCalleeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): LiquidationAuctionCallee;
}
