import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { LedgerLike, LedgerLikeInterface } from "../LedgerLike";
export declare class LedgerLike__factory {
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
    static createInterface(): LedgerLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): LedgerLike;
}
