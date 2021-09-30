/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  StairstepExponentialDecrease,
  StairstepExponentialDecreaseInterface,
} from "../StairstepExponentialDecrease";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "GrantAuthorization",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "RevokeAuthorization",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "parameter",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "data",
        type: "uint256",
      },
    ],
    name: "UpdateParameter",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorizedAccounts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "initialPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeElapsed",
        type: "uint256",
      },
    ],
    name: "discountPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "factorPerStep",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "grantAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "revokeAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "step",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "data",
        type: "uint256",
      },
    ],
    name: "updateFactorPerStep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "data",
        type: "uint256",
      },
    ],
    name: "updateStep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610ce1806100206000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c80639736eb23116100665780639736eb231461010c578063b48028e31461013c578063cf25b21d14610158578063e23f57ae14610174578063e25fe1751461019057610093565b806324ba5884146100985780635fb170b7146100c85780638129fc1c146100e65780638f2fdb42146100f0575b600080fd5b6100b260048036038101906100ad91906108d9565b6101ae565b6040516100bf9190610a3f565b60405180910390f35b6100d06101c6565b6040516100dd9190610a3f565b60405180910390f35b6100ee6101cc565b005b61010a600480360381019061010591906108d9565b61032c565b005b6101266004803603810190610121919061092b565b610437565b6040516101339190610a3f565b60405180910390f35b610156600480360381019061015191906108d9565b610470565b005b610172600480360381019061016d9190610902565b61057c565b005b61018e60048036038101906101899190610902565b6106ae565b005b610198610791565b6040516101a59190610a3f565b60405180910390f35b60016020528060005260406000206000915090505481565b60035481565b600060019054906101000a900460ff16806101f2575060008054906101000a900460ff16155b610231576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610228906109ff565b60405180910390fd5b60008060019054906101000a900460ff161590508015610281576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a280156103295760008060016101000a81548160ff0219169083151502179055505b50565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146103ad576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103a4906109df565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a260018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b600061046883610463600354600254866104519190610a6b565b6b033b2e3c9fd0803ce8000000610797565b61085d565b905092915050565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146104f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104e8906109df565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff1fb81a1db01a30a631ba89f5c83a43f2c9273aad05ec220f22ce42c02c1684860405160405180910390a250565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146105fd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f4906109df565b60405180910390fd5b6b033b2e3c9fd0803ce800000081111561064c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064390610a1f565b60405180910390fd5b806003819055507f666163746f7250657253746570000000000000000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c826040516106a39190610a3f565b60405180910390a250565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541461072f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610726906109df565b60405180910390fd5b806002819055507f73746570000000000000000000000000000000000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c826040516107869190610a3f565b60405180910390a250565b60025481565b600082600081146108515784600081146108465760028506600081146107bf578693506107c3565b8493505b50600284046002860495505b8515610840578687028760801c156107e657600080fd5b818101818110156107f657600080fd5b8681049850600288061561083357888602868a820414158a1515161561081b57600080fd5b8381018181101561082b57600080fd5b888104975050505b50506002860495506107cf565b5061084b565b600092505b50610855565b8291505b509392505050565b6000818361086b9190610a9c565b9050600082148061088657508282826108849190610a6b565b145b61088f57600080fd5b6b033b2e3c9fd0803ce8000000816108a79190610a6b565b905092915050565b6000813590506108be81610c7d565b92915050565b6000813590506108d381610c94565b92915050565b6000602082840312156108eb57600080fd5b60006108f9848285016108af565b91505092915050565b60006020828403121561091457600080fd5b6000610922848285016108c4565b91505092915050565b6000806040838503121561093e57600080fd5b600061094c858286016108c4565b925050602061095d858286016108c4565b9150509250929050565b6000610974602b83610a5a565b915061097f82610b90565b604082019050919050565b6000610997602e83610a5a565b91506109a282610bdf565b604082019050919050565b60006109ba603183610a5a565b91506109c582610c2e565b604082019050919050565b6109d981610b28565b82525050565b600060208201905081810360008301526109f881610967565b9050919050565b60006020820190508181036000830152610a188161098a565b9050919050565b60006020820190508181036000830152610a38816109ad565b9050919050565b6000602082019050610a5460008301846109d0565b92915050565b600082825260208201905092915050565b6000610a7682610b28565b9150610a8183610b28565b925082610a9157610a90610b61565b5b828204905092915050565b6000610aa782610b28565b9150610ab283610b28565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610aeb57610aea610b32565b5b828202905092915050565b6000610b0182610b08565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f5374616972737465704578706f6e656e7469616c44656372656173652f6e6f7460008201527f2d617574686f72697a6564000000000000000000000000000000000000000000602082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f5374616972737465704578706f6e656e7469616c44656372656173652f66616360008201527f746f72506572537465702d67742d524159000000000000000000000000000000602082015250565b610c8681610af6565b8114610c9157600080fd5b50565b610c9d81610b28565b8114610ca857600080fd5b5056fea2646970667358221220f88bdfd637ee0584f8d92380ec781cdb17d0a2aae4247427fe7c245a21eecfde64736f6c63430008040033";

export class StairstepExponentialDecrease__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<StairstepExponentialDecrease> {
    return super.deploy(
      overrides || {}
    ) as Promise<StairstepExponentialDecrease>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): StairstepExponentialDecrease {
    return super.attach(address) as StairstepExponentialDecrease;
  }
  connect(signer: Signer): StairstepExponentialDecrease__factory {
    return super.connect(signer) as StairstepExponentialDecrease__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StairstepExponentialDecreaseInterface {
    return new utils.Interface(_abi) as StairstepExponentialDecreaseInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StairstepExponentialDecrease {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as StairstepExponentialDecrease;
  }
}
