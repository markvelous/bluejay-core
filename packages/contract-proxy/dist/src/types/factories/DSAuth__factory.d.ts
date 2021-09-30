import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DSAuth, DSAuthInterface } from "../DSAuth";
export declare class DSAuth__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<DSAuth>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): DSAuth;
    connect(signer: Signer): DSAuth__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167fce241d7ca1f669fee44b6fc00b8eba2df3bb514eed0f6f668f8f89096e81ed9460405160405180910390a26107d6806100a46000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806313af4035146100515780637a9e5e4b1461006d5780638da5cb5b14610089578063bf7e214f146100a7575b600080fd5b61006b60048036038101906100669190610529565b6100c5565b005b6100876004803603810190610082919061057b565b6101db565b005b6100916102ee565b60405161009e91906105f4565b60405180910390f35b6100af610314565b6040516100bc9190610646565b60405180910390f35b6100f3336000357fffffffff0000000000000000000000000000000000000000000000000000000016610338565b610132576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161012990610661565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fce241d7ca1f669fee44b6fc00b8eba2df3bb514eed0f6f668f8f89096e81ed9460405160405180910390a250565b610209336000357fffffffff0000000000000000000000000000000000000000000000000000000016610338565b610248576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161023f90610661565b60405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f1abebea81bfa2637f28358c371278fb15ede7ea8dd28d2e03b112ff6d936ada460405160405180910390a250565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60003073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561037757600190506104e4565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156103d657600190506104e4565b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561043457600090506104e4565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b70096138430856040518463ffffffff1660e01b81526004016104919392919061060f565b60206040518083038186803b1580156104a957600080fd5b505afa1580156104bd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104e19190610552565b90505b92915050565b6000813590506104f98161075b565b92915050565b60008151905061050e81610772565b92915050565b60008135905061052381610789565b92915050565b60006020828403121561053b57600080fd5b6000610549848285016104ea565b91505092915050565b60006020828403121561056457600080fd5b6000610572848285016104ff565b91505092915050565b60006020828403121561058d57600080fd5b600061059b84828501610514565b91505092915050565b6105ad81610692565b82525050565b6105bc816106b0565b82525050565b6105cb8161070e565b82525050565b60006105de601483610681565b91506105e982610732565b602082019050919050565b600060208201905061060960008301846105a4565b92915050565b600060608201905061062460008301866105a4565b61063160208301856105a4565b61063e60408301846105b3565b949350505050565b600060208201905061065b60008301846105c2565b92915050565b6000602082019050818103600083015261067a816105d1565b9050919050565b600082825260208201905092915050565b600061069d826106ee565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b60006106e782610692565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061071982610720565b9050919050565b600061072b826106ee565b9050919050565b7f64732d617574682d756e617574686f72697a6564000000000000000000000000600082015250565b61076481610692565b811461076f57600080fd5b50565b61077b816106a4565b811461078657600080fd5b50565b610792816106dc565b811461079d57600080fd5b5056fea264697066735822122052359b9355deb84e64d442a52154b91c2cf23a1fe085b2a2a69ab4a12f6881e264736f6c63430008040033";
    static readonly abi: ({
        inputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
        outputs?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        stateMutability?: undefined;
        outputs?: undefined;
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
        anonymous?: undefined;
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
        anonymous?: undefined;
    })[];
    static createInterface(): DSAuthInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DSAuth;
}
