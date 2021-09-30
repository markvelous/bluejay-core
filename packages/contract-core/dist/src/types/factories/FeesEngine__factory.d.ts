import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { FeesEngine, FeesEngineInterface } from "../FeesEngine";
export declare class FeesEngine__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<FeesEngine>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): FeesEngine;
    connect(signer: Signer): FeesEngine__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50611750806100206000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c8063b48028e31161008c578063cba0bad311610066578063cba0bad3146101fe578063d07900bb1461021a578063d10aca881461024b578063e55c9dde14610267576100cf565b8063b48028e314610196578063c4d66de8146101b2578063c4ef15a1146101ce576100cf565b806324ba5884146100d4578063498fb99a1461010457806356397c35146101225780638f2fdb4214610140578063961d45c41461015c578063988af2a81461017a575b600080fd5b6100ee60048036038101906100e99190610f54565b610283565b6040516100fb9190611269565b60405180910390f35b61010c61029b565b6040516101199190611269565b60405180910390f35b61012a6102a1565b60405161013791906111ae565b60405180910390f35b61015a60048036038101906101559190610f54565b6102c7565b005b6101646103d2565b6040516101719190611141565b60405180910390f35b610194600480360381019061018f9190610f54565b6103f8565b005b6101b060048036038101906101ab9190610f54565b610515565b005b6101cc60048036038101906101c79190610f54565b610621565b005b6101e860048036038101906101e39190610f7d565b6107c3565b6040516101f59190611269565b60405180910390f35b61021860048036038101906102139190610f7d565b610a54565b005b610234600480360381019061022f9190610f7d565b610b55565b6040516102429291906112bb565b60405180910390f35b61026560048036038101906102609190610fa6565b610b79565b005b610281600480360381019061027c9190610fe2565b610cd4565b005b60016020528060005260406000206000915090505481565b60055481565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610348576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161033f906111c9565b60405180910390fd5b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a250565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610479576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610470906111c9565b60405180910390fd5b80600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f6163636f756e74696e67456e67696e65000000000000000000000000000000007f2916d8563c1cf5073eb154f94b17e16d9506f9f7a53013587da7047bcf8d051f8260405161050a9190611141565b60405180910390a250565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610596576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161058d906111c9565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff1fb81a1db01a30a631ba89f5c83a43f2c9273aad05ec220f22ce42c02c1684860405160405180910390a250565b600060019054906101000a900460ff1680610647575060008054906101000a900460ff16155b610686576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161067d90611209565b60405180910390fd5b60008060019054906101000a900460ff1615905080156106d6576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a280156107bf5760008060016101000a81548160ff0219169083151502179055505b5050565b6000600260008381526020019081526020016000206001015442101561081e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610815906111e9565b60405180910390fd5b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d07900bb846040518263ffffffff1660e01b815260040161087b919061115c565b6040805180830381600087803b15801561089457600080fd5b505af11580156108a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108cc919061100b565b91505061093361092d60026000868152602001908152602001600020600001546005546108f991906112f5565b60026000878152602001908152602001600020600101544261091b919061146a565b6b033b2e3c9fd0803ce8000000610db7565b82610e7d565b915060006109418383610ecf565b9050600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630e9e11d385600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16846040518463ffffffff1660e01b81526004016109c493929190611177565b600060405180830381600087803b1580156109de57600080fd5b505af11580156109f2573d6000803e3d6000fd5b50505050426002600086815260200190815260200160002060010181905550837f08fbf3952cf5ec7203aa8d18d0c3aef21e282e3fb123df0597fbcae1fc790fd2428386604051610a4593929190611284565b60405180910390a25050919050565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610ad5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610acc906111c9565b60405180910390fd5b60006002600083815260200190815260200160002090506000816000015414610b33576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b2a90611229565b60405180910390fd5b6b033b2e3c9fd0803ce800000081600001819055504281600101819055505050565b60026020528060005260406000206000915090508060000154908060010154905082565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610bfa576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bf1906111c9565b60405180910390fd5b610c03826107c3565b5060026000838152602001908152602001600020600101544214610c5c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c5390611249565b60405180910390fd5b806002600084815260200190815260200160002060000181905550817f73746162696c69747946656500000000000000000000000000000000000000007f576bd0b84eeab90bb04acbe73c2dd33f5e5d003e96cf52f789ba6bbe98e9123083604051610cc89190611269565b60405180910390a35050565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610d55576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d4c906111c9565b60405180910390fd5b806005819055507f676c6f62616c53746162696c69747946656500000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c82604051610dac9190611269565b60405180910390a250565b60008360008114610e5d576002840660008114610dd657859250610dda565b8392505b50600283046002850494505b8415610e57578586028687820414610dfd57600080fd5b81810181811015610e0d57600080fd5b85810497506002870615610e4a578785028589820414158915151615610e3257600080fd5b83810181811015610e4257600080fd5b878104965050505b5050600285049450610de6565b50610e75565b8360008114610e6f5760009250610e73565b8392505b505b509392505050565b60008183610e8b919061137c565b90506000821480610ea65750828282610ea4919061134b565b145b610eaf57600080fd5b6b033b2e3c9fd0803ce800000081610ec7919061134b565b905092915050565b60008183610edd91906113d6565b905060008312158015610ef1575060008212155b610efa57600080fd5b92915050565b600081359050610f0f816116d5565b92915050565b600081359050610f24816116ec565b92915050565b600081359050610f3981611703565b92915050565b600081519050610f4e81611703565b92915050565b600060208284031215610f6657600080fd5b6000610f7484828501610f00565b91505092915050565b600060208284031215610f8f57600080fd5b6000610f9d84828501610f15565b91505092915050565b60008060408385031215610fb957600080fd5b6000610fc785828601610f15565b9250506020610fd885828601610f2a565b9150509250929050565b600060208284031215610ff457600080fd5b600061100284828501610f2a565b91505092915050565b6000806040838503121561101e57600080fd5b600061102c85828601610f3f565b925050602061103d85828601610f3f565b9150509250929050565b6110508161149e565b82525050565b61105f816114b0565b82525050565b61106e816114ee565b82525050565b61107d816114ba565b82525050565b60006110906019836112e4565b915061109b82611570565b602082019050919050565b60006110b36022836112e4565b91506110be82611599565b604082019050919050565b60006110d6602e836112e4565b91506110e1826115e8565b604082019050919050565b60006110f96026836112e4565b915061110482611637565b604082019050919050565b600061111c6022836112e4565b915061112782611686565b604082019050919050565b61113b816114e4565b82525050565b60006020820190506111566000830184611047565b92915050565b60006020820190506111716000830184611056565b92915050565b600060608201905061118c6000830186611056565b6111996020830185611047565b6111a66040830184611074565b949350505050565b60006020820190506111c36000830184611065565b92915050565b600060208201905081810360008301526111e281611083565b9050919050565b60006020820190508181036000830152611202816110a6565b9050919050565b60006020820190508181036000830152611222816110c9565b9050919050565b60006020820190508181036000830152611242816110ec565b9050919050565b600060208201905081810360008301526112628161110f565b9050919050565b600060208201905061127e6000830184611132565b92915050565b60006060820190506112996000830186611132565b6112a66020830185611074565b6112b36040830184611132565b949350505050565b60006040820190506112d06000830185611132565b6112dd6020830184611132565b9392505050565b600082825260208201905092915050565b6000611300826114e4565b915061130b836114e4565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156113405761133f611512565b5b828201905092915050565b6000611356826114e4565b9150611361836114e4565b92508261137157611370611541565b5b828204905092915050565b6000611387826114e4565b9150611392836114e4565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156113cb576113ca611512565b5b828202905092915050565b60006113e1826114ba565b91506113ec836114ba565b9250827f80000000000000000000000000000000000000000000000000000000000000000182126000841215161561142757611426611512565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01821360008412161561145f5761145e611512565b5b828203905092915050565b6000611475826114e4565b9150611480836114e4565b92508282101561149357611492611512565b5b828203905092915050565b60006114a9826114c4565b9050919050565b6000819050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60006114f982611500565b9050919050565b600061150b826114c4565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f46656573456e67696e652f6e6f742d617574686f72697a656400000000000000600082015250565b7f46656573456e67696e652f696e76616c69642d626c6f636b2e74696d6573746160008201527f6d70000000000000000000000000000000000000000000000000000000000000602082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f46656573456e67696e652f636f6c6c61746572616c547970652d616c7265616460008201527f792d696e69740000000000000000000000000000000000000000000000000000602082015250565b7f46656573456e67696e652f6c617374557064617465642d6e6f742d757064617460008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b6116de8161149e565b81146116e957600080fd5b50565b6116f5816114b0565b811461170057600080fd5b50565b61170c816114e4565b811461171757600080fd5b5056fea2646970667358221220e9ea47733a44c32bf7dfa275fa7597859613178a8b24fc58822161e1e05997ba64736f6c63430008040033";
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        anonymous?: undefined;
    })[];
    static createInterface(): FeesEngineInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): FeesEngine;
}