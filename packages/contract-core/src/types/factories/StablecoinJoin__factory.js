"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var ethers_1 = require("ethers");
var _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
        ],
        name: "Deposit",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "GrantAuthorization",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "RevokeAuthorization",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
        ],
        name: "Withdraw",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "authorizedAccounts",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "wad",
                type: "uint256"
            },
        ],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address"
            },
        ],
        name: "grantAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "ledger_",
                type: "address"
            },
            {
                internalType: "address",
                name: "stablecoin_",
                type: "address"
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "ledger",
        outputs: [
            {
                internalType: "contract LedgerLike",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "live",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address"
            },
        ],
        name: "revokeAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "shutdown",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "stablecoin",
        outputs: [
            {
                internalType: "contract TokenLike",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "wad",
                type: "uint256"
            },
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b50610eb6806100206000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063957aa58c11610066578063957aa58c14610145578063b48028e314610163578063e9cbd8221461017f578063f3fef3a31461019d578063fc0e74d1146101b95761009e565b806324ba5884146100a357806347e7ef24146100d3578063485cc955146100ef57806356397c351461010b5780638f2fdb4214610129575b600080fd5b6100bd60048036038101906100b89190610a3c565b6101c3565b6040516100ca9190610c78565b60405180910390f35b6100ed60048036038101906100e89190610aa1565b6101db565b005b61010960048036038101906101049190610a65565b610364565b005b610113610550565b6040516101209190610be2565b60405180910390f35b610143600480360381019061013e9190610a3c565b610576565b005b61014d610681565b60405161015a9190610c78565b60405180910390f35b61017d60048036038101906101789190610a3c565b610687565b005b610187610793565b6040516101949190610bfd565b60405180910390f35b6101b760048036038101906101b29190610aa1565b6107b9565b005b6101c1610987565b005b60016020528060005260406000206000915090505481565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be3084846b033b2e3c9fd0803ce80000006102339190610ca4565b6040518463ffffffff1660e01b815260040161025193929190610b82565b600060405180830381600087803b15801561026b57600080fd5b505af115801561027f573d6000803e3d6000fd5b50505050600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639dc29fac33836040518363ffffffff1660e01b81526004016102e0929190610bb9565b600060405180830381600087803b1580156102fa57600080fd5b505af115801561030e573d6000803e3d6000fd5b505050508173ffffffffffffffffffffffffffffffffffffffff167fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c826040516103589190610c78565b60405180910390a25050565b600060019054906101000a900460ff168061038a575060008054906101000a900460ff16155b6103c9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103c090610c38565b60405180910390fd5b60008060019054906101000a900460ff161590508015610419576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600160048190555082600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a2801561054b5760008060016101000a81548160ff0219169083151502179055505b505050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146105f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105ee90610c58565b60405180910390fd5b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a250565b60045481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610708576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106ff90610c58565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff1fb81a1db01a30a631ba89f5c83a43f2c9273aad05ec220f22ce42c02c1684860405160405180910390a250565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6001600454146107fe576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107f590610c18565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be3330846b033b2e3c9fd0803ce80000006108569190610ca4565b6040518463ffffffff1660e01b815260040161087493929190610b82565b600060405180830381600087803b15801561088e57600080fd5b505af11580156108a2573d6000803e3d6000fd5b50505050600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166340c10f1983836040518363ffffffff1660e01b8152600401610903929190610bb9565b600060405180830381600087803b15801561091d57600080fd5b505af1158015610931573d6000803e3d6000fd5b505050508173ffffffffffffffffffffffffffffffffffffffff167f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a94243648260405161097b9190610c78565b60405180910390a25050565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610a08576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109ff90610c58565b60405180910390fd5b6000600481905550565b600081359050610a2181610e52565b92915050565b600081359050610a3681610e69565b92915050565b600060208284031215610a4e57600080fd5b6000610a5c84828501610a12565b91505092915050565b60008060408385031215610a7857600080fd5b6000610a8685828601610a12565b9250506020610a9785828601610a12565b9150509250929050565b60008060408385031215610ab457600080fd5b6000610ac285828601610a12565b9250506020610ad385828601610a27565b9150509250929050565b610ae681610cfe565b82525050565b610af581610d3a565b82525050565b610b0481610d5e565b82525050565b6000610b17601783610c93565b9150610b2282610db1565b602082019050919050565b6000610b3a602e83610c93565b9150610b4582610dda565b604082019050919050565b6000610b5d601d83610c93565b9150610b6882610e29565b602082019050919050565b610b7c81610d30565b82525050565b6000606082019050610b976000830186610add565b610ba46020830185610add565b610bb16040830184610b73565b949350505050565b6000604082019050610bce6000830185610add565b610bdb6020830184610b73565b9392505050565b6000602082019050610bf76000830184610aec565b92915050565b6000602082019050610c126000830184610afb565b92915050565b60006020820190508181036000830152610c3181610b0a565b9050919050565b60006020820190508181036000830152610c5181610b2d565b9050919050565b60006020820190508181036000830152610c7181610b50565b9050919050565b6000602082019050610c8d6000830184610b73565b92915050565b600082825260208201905092915050565b6000610caf82610d30565b9150610cba83610d30565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610cf357610cf2610d82565b5b828202905092915050565b6000610d0982610d10565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b6000610d4582610d4c565b9050919050565b6000610d5782610d10565b9050919050565b6000610d6982610d70565b9050919050565b6000610d7b82610d10565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f537461626c65636f696e4a6f696e2f6e6f742d6c697665000000000000000000600082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f537461626c65636f696e4a6f696e2f6e6f742d617574686f72697a6564000000600082015250565b610e5b81610cfe565b8114610e6657600080fd5b50565b610e7281610d30565b8114610e7d57600080fd5b5056fea2646970667358221220fb736b9f73536cd053e96587f2376d1577e71928ef183a697c24ff00e1de600464736f6c63430008040033";
var StablecoinJoin__factory = /** @class */ (function (_super) {
    __extends(StablecoinJoin__factory, _super);
    function StablecoinJoin__factory(signer) {
        return _super.call(this, _abi, _bytecode, signer) || this;
    }
    StablecoinJoin__factory.prototype.deploy = function (overrides) {
        return _super.prototype.deploy.call(this, overrides || {});
    };
    StablecoinJoin__factory.prototype.getDeployTransaction = function (overrides) {
        return _super.prototype.getDeployTransaction.call(this, overrides || {});
    };
    StablecoinJoin__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    StablecoinJoin__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    StablecoinJoin__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    StablecoinJoin__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    StablecoinJoin__factory.bytecode = _bytecode;
    StablecoinJoin__factory.abi = _abi;
    return StablecoinJoin__factory;
}(ethers_1.ContractFactory));
exports.StablecoinJoin__factory = StablecoinJoin__factory;
