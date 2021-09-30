import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DSAuthEvents, DSAuthEventsInterface } from "../DSAuthEvents";
export declare class DSAuthEvents__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<DSAuthEvents>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): DSAuthEvents;
    connect(signer: Signer): DSAuthEvents__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220dad601f38acc01e8b55fe923701a6bb80004f7ba1d485b4b2cd6f6e9852228f164736f6c63430008040033";
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
    static createInterface(): DSAuthEventsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DSAuthEvents;
}
