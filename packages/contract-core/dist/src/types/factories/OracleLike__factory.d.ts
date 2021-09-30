import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { OracleLike, OracleLikeInterface } from "../OracleLike";
export declare class OracleLike__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): OracleLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): OracleLike;
}
