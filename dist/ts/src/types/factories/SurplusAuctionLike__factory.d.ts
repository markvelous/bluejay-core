import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { SurplusAuctionLike, SurplusAuctionLikeInterface } from "../SurplusAuctionLike";
export declare class SurplusAuctionLike__factory {
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
    static createInterface(): SurplusAuctionLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SurplusAuctionLike;
}
