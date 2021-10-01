import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { LiquidationAuctionLike, LiquidationAuctionLikeInterface } from "../LiquidationAuctionLike";
export declare class LiquidationAuctionLike__factory {
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
    static createInterface(): LiquidationAuctionLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): LiquidationAuctionLike;
}
