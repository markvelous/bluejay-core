import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { DebtAuctionLike, DebtAuctionLikeInterface } from "../DebtAuctionLike";
export declare class DebtAuctionLike__factory {
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
    static createInterface(): DebtAuctionLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DebtAuctionLike;
}
