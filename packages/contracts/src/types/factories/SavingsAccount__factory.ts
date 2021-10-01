/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SavingsAccount,
  SavingsAccountInterface,
} from "../SavingsAccount";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
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
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "accumulatedRateDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nextAccumulatedRate",
        type: "uint256",
      },
    ],
    name: "UpdateAccumulatedRate",
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
        internalType: "address",
        name: "data",
        type: "address",
      },
    ],
    name: "UpdateParameter",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "accountingEngine",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedRates",
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
        name: "wad",
        type: "uint256",
      },
    ],
    name: "deposit",
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
    name: "grantAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ledger_",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUpdated",
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
    name: "ledger",
    outputs: [
      {
        internalType: "contract LedgerLike",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "live",
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
    name: "revokeAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "savings",
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
    name: "savingsRate",
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
    name: "shutdown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSavings",
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
        name: "addr",
        type: "address",
      },
    ],
    name: "updateAccountingEngine",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateAccumulatedRate",
    outputs: [
      {
        internalType: "uint256",
        name: "nextAccumulatedRate",
        type: "uint256",
      },
    ],
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
    name: "updateSavingsRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506116f1806100206000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c8063988af2a8116100a2578063b6b55f2511610071578063b6b55f25146102bb578063c4d66de8146102d7578063c87a6d2f146102f3578063d0b06f5d14610311578063fc0e74d11461032f57610116565b8063988af2a8146102495780639b78f69f146102655780639bf42b3f14610281578063b48028e31461029f57610116565b806364dbfd81116100e957806364dbfd81146101b55780636ecd067f146101d35780638f2fdb42146101f1578063957aa58c1461020d578063961d45c41461022b57610116565b80631f7cdd5f1461011b57806324ba58841461014b5780632e1a7d4d1461017b57806356397c3514610197575b600080fd5b610135600480360381019061013091906110dd565b610339565b6040516101429190611318565b60405180910390f35b610165600480360381019061016091906110dd565b610351565b6040516101729190611318565b60405180910390f35b61019560048036038101906101909190611106565b610369565b005b61019f6104fa565b6040516101ac919061125d565b60405180910390f35b6101bd610520565b6040516101ca9190611318565b60405180910390f35b6101db6106b9565b6040516101e89190611318565b60405180910390f35b61020b600480360381019061020691906110dd565b6106bf565b005b6102156107ca565b6040516102229190611318565b60405180910390f35b6102336107d0565b604051610240919061120b565b60405180910390f35b610263600480360381019061025e91906110dd565b6107f6565b005b61027f600480360381019061027a9190611106565b610913565b005b610289610a93565b6040516102969190611318565b60405180910390f35b6102b960048036038101906102b491906110dd565b610a99565b005b6102d560048036038101906102d09190611106565b610ba5565b005b6102f160048036038101906102ec91906110dd565b610d3f565b005b6102fb610f16565b6040516103089190611318565b60405180910390f35b610319610f1c565b6040516103269190611318565b60405180910390f35b610337610f22565b005b60026020528060005260406000206000915090505481565b60016020528060005260406000206000915090505481565b80600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546103b4919061145c565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080600354610405919061145c565b600381905550600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be3033846005546104599190611402565b6040518463ffffffff1660e01b815260040161047793929190611226565b600060405180830381600087803b15801561049157600080fd5b505af11580156104a5573d6000803e3d6000fd5b505050503373ffffffffffffffffffffffffffffffffffffffff167f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364826040516104ef9190611318565b60405180910390a250565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600854421015610567576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055e906112b8565b60405180910390fd5b6105986105906004546008544261057e919061145c565b6b033b2e3c9fd0803ce8000000610fc0565b600554611086565b90506000600554826105aa919061145c565b90508160058190555042600881905550600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631b142820600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16308460035461062a9190611402565b6040518463ffffffff1660e01b815260040161064893929190611226565b600060405180830381600087803b15801561066257600080fd5b505af1158015610676573d6000803e3d6000fd5b505050507f49d9692692a059f4689c8500a9b4cda64ea46f82c73a75f2464e0389ab6a7a874282846040516106ad93929190611333565b60405180910390a15090565b60045481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610740576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610737906112f8565b60405180910390fd5b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a250565b60095481565b600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610877576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161086e906112f8565b60405180910390fd5b80600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f6163636f756e74696e67456e67696e65000000000000000000000000000000007f2916d8563c1cf5073eb154f94b17e16d9506f9f7a53013587da7047bcf8d051f82604051610908919061120b565b60405180910390a250565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610994576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161098b906112f8565b60405180910390fd5b6001600954146109d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109d090611298565b60405180910390fd5b6b033b2e3c9fd0803ce8000000811015610a28576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a1f906112d8565b60405180910390fd5b610a30610520565b50806004819055507f736176696e6773526174650000000000000000000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c82604051610a889190611318565b60405180910390a250565b60035481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610b1a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b11906112f8565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff1fb81a1db01a30a631ba89f5c83a43f2c9273aad05ec220f22ce42c02c1684860405160405180910390a250565b610bad610520565b5080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610bf9919061137b565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080600354610c4a919061137b565b600381905550600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be333084600554610c9e9190611402565b6040518463ffffffff1660e01b8152600401610cbc93929190611226565b600060405180830381600087803b158015610cd657600080fd5b505af1158015610cea573d6000803e3d6000fd5b505050503373ffffffffffffffffffffffffffffffffffffffff167fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c82604051610d349190611318565b60405180910390a250565b600060019054906101000a900460ff1680610d65575060008054906101000a900460ff16155b610da4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d9b90611278565b60405180910390fd5b60008060019054906101000a900460ff161590508015610df4576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506b033b2e3c9fd0803ce80000006004819055506b033b2e3c9fd0803ce80000006005819055504260088190555060016009819055503373ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a28015610f125760008060016101000a81548160ff0219169083151502179055505b5050565b60055481565b60085481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610fa3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9a906112f8565b60405180910390fd5b60006009819055506b033b2e3c9fd0803ce8000000600481905550565b60008360008114611066576002840660008114610fdf57859250610fe3565b8392505b50600283046002850494505b841561106057858602868782041461100657600080fd5b8181018181101561101657600080fd5b8581049750600287061561105357878502858982041415891515161561103b57600080fd5b8381018181101561104b57600080fd5b878104965050505b5050600285049450610fef565b5061107e565b8360008114611078576000925061107c565b8392505b505b509392505050565b60006b033b2e3c9fd0803ce800000082846110a19190611402565b6110ab91906113d1565b905092915050565b6000813590506110c28161168d565b92915050565b6000813590506110d7816116a4565b92915050565b6000602082840312156110ef57600080fd5b60006110fd848285016110b3565b91505092915050565b60006020828403121561111857600080fd5b6000611126848285016110c8565b91505092915050565b61113881611490565b82525050565b611147816114cc565b82525050565b600061115a602e8361136a565b91506111658261154e565b604082019050919050565b600061117d60178361136a565b91506111888261159d565b602082019050919050565b60006111a060268361136a565b91506111ab826115c6565b604082019050919050565b60006111c360218361136a565b91506111ce82611615565b604082019050919050565b60006111e6601d8361136a565b91506111f182611664565b602082019050919050565b611205816114c2565b82525050565b6000602082019050611220600083018461112f565b92915050565b600060608201905061123b600083018661112f565b611248602083018561112f565b61125560408301846111fc565b949350505050565b6000602082019050611272600083018461113e565b92915050565b600060208201905081810360008301526112918161114d565b9050919050565b600060208201905081810360008301526112b181611170565b9050919050565b600060208201905081810360008301526112d181611193565b9050919050565b600060208201905081810360008301526112f1816111b6565b9050919050565b60006020820190508181036000830152611311816111d9565b9050919050565b600060208201905061132d60008301846111fc565b92915050565b600060608201905061134860008301866111fc565b61135560208301856111fc565b61136260408301846111fc565b949350505050565b600082825260208201905092915050565b6000611386826114c2565b9150611391836114c2565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156113c6576113c56114f0565b5b828201905092915050565b60006113dc826114c2565b91506113e7836114c2565b9250826113f7576113f661151f565b5b828204905092915050565b600061140d826114c2565b9150611418836114c2565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611451576114506114f0565b5b828202905092915050565b6000611467826114c2565b9150611472836114c2565b925082821015611485576114846114f0565b5b828203905092915050565b600061149b826114a2565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60006114d7826114de565b9050919050565b60006114e9826114a2565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f536176696e67734163636f756e742f6e6f742d6c697665000000000000000000600082015250565b7f536176696e67734163636f756e742f696e76616c69642d626c6f636b2e74696d60008201527f657374616d700000000000000000000000000000000000000000000000000000602082015250565b7f536176696e67734163636f756e742f736176696e6773526174652d6c742d6f6e60008201527f6500000000000000000000000000000000000000000000000000000000000000602082015250565b7f536176696e67734163636f756e742f6e6f742d617574686f72697a6564000000600082015250565b61169681611490565b81146116a157600080fd5b50565b6116ad816114c2565b81146116b857600080fd5b5056fea2646970667358221220d6eef1f7719a5cb3aa253a7378235fc5281a5a8bad79774a6e03f0d170ec485164736f6c63430008040033";

export class SavingsAccount__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SavingsAccount> {
    return super.deploy(overrides || {}) as Promise<SavingsAccount>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SavingsAccount {
    return super.attach(address) as SavingsAccount;
  }
  connect(signer: Signer): SavingsAccount__factory {
    return super.connect(signer) as SavingsAccount__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SavingsAccountInterface {
    return new utils.Interface(_abi) as SavingsAccountInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SavingsAccount {
    return new Contract(address, _abi, signerOrProvider) as SavingsAccount;
  }
}
