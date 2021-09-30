import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DSNote, DSNoteInterface } from "../DSNote";
export declare class DSNote__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<DSNote>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): DSNote;
    connect(signer: Signer): DSNote__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea26469706673582212209028eb836a8cd7c7668f9c0e0dd5997bdd1c24d039e57b1ba47dab75257c86b064736f6c63430008040033";
    static readonly abi: {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
    }[];
    static createInterface(): DSNoteInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DSNote;
}
