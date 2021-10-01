import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { AccountingEngineLike, AccountingEngineLikeInterface } from "../AccountingEngineLike";
export declare class AccountingEngineLike__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): AccountingEngineLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AccountingEngineLike;
}
