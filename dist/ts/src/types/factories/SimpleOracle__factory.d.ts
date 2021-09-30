import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SimpleOracle, SimpleOracleInterface } from "../SimpleOracle";
export declare class SimpleOracle__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<SimpleOracle>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): SimpleOracle;
    connect(signer: Signer): SimpleOracle__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506101c2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80637ff9b5961461004657806391b7f5ed1461006457806398d5fdca14610080575b600080fd5b61004e61009f565b60405161005b919061011b565b60405180910390f35b61007e600480360381019061007991906100d4565b6100a5565b005b6100886100af565b604051610096929190610136565b60405180910390f35b60005481565b8060008190555050565b6000806000546001915091509091565b6000813590506100ce81610175565b92915050565b6000602082840312156100e657600080fd5b60006100f4848285016100bf565b91505092915050565b6101068161015f565b82525050565b6101158161016b565b82525050565b6000602082019050610130600083018461010c565b92915050565b600060408201905061014b600083018561010c565b61015860208301846100fd565b9392505050565b60008115159050919050565b6000819050919050565b61017e8161016b565b811461018957600080fd5b5056fea26469706673582212208483cc2c06512ba4b814a596e684c4adb5205efe72300d9770967bfd67b2c20364736f6c63430008040033";
    static readonly abi: ({
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): SimpleOracleInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SimpleOracle;
}
