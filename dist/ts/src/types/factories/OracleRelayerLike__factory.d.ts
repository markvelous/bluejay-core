import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { OracleRelayerLike, OracleRelayerLikeInterface } from "../OracleRelayerLike";
export declare class OracleRelayerLike__factory {
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
    static createInterface(): OracleRelayerLikeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): OracleRelayerLike;
}
