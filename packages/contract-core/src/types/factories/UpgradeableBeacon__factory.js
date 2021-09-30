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
        inputs: [
            {
                internalType: "address",
                name: "implementation_",
                type: "address"
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address"
            },
        ],
        name: "OwnershipTransferred",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "implementation",
                type: "address"
            },
        ],
        name: "Upgraded",
        type: "event"
    },
    {
        inputs: [],
        name: "implementation",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address"
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newImplementation",
                type: "address"
            },
        ],
        name: "upgradeTo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b50604051610a7c380380610a7c833981810160405281019061003291906101ed565b61004e61004361006360201b60201c565b61006b60201b60201c565b61005d8161012f60201b60201c565b50610302565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b610142816101c560201b6103781760201c565b610181576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161017890610239565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600080823b905060008111915050919050565b6000815190506101e7816102eb565b92915050565b6000602082840312156101ff57600080fd5b600061020d848285016101d8565b91505092915050565b6000610223603383610259565b915061022e8261029c565b604082019050919050565b6000602082019050818103600083015261025281610216565b9050919050565b600082825260208201905092915050565b60006102758261027c565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b7f5570677261646561626c65426561636f6e3a20696d706c656d656e746174696f60008201527f6e206973206e6f74206120636f6e747261637400000000000000000000000000602082015250565b6102f48161026a565b81146102ff57600080fd5b50565b61076b806103116000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633659cfe61461005c5780635c60da1b14610078578063715018a6146100965780638da5cb5b146100a0578063f2fde38b146100be575b600080fd5b610076600480360381019061007191906104f8565b6100da565b005b6100806101a5565b60405161008d9190610599565b60405180910390f35b61009e6101cf565b005b6100a8610257565b6040516100b59190610599565b60405180910390f35b6100d860048036038101906100d391906104f8565b610280565b005b6100e261038b565b73ffffffffffffffffffffffffffffffffffffffff16610100610257565b73ffffffffffffffffffffffffffffffffffffffff1614610156576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161014d906105f4565b60405180910390fd5b61015f81610393565b8073ffffffffffffffffffffffffffffffffffffffff167fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b60405160405180910390a250565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6101d761038b565b73ffffffffffffffffffffffffffffffffffffffff166101f5610257565b73ffffffffffffffffffffffffffffffffffffffff161461024b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610242906105f4565b60405180910390fd5b610255600061041f565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b61028861038b565b73ffffffffffffffffffffffffffffffffffffffff166102a6610257565b73ffffffffffffffffffffffffffffffffffffffff16146102fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102f3906105f4565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141561036c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610363906105b4565b60405180910390fd5b6103758161041f565b50565b600080823b905060008111915050919050565b600033905090565b61039c81610378565b6103db576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103d2906105d4565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000813590506104f28161071e565b92915050565b60006020828403121561050a57600080fd5b6000610518848285016104e3565b91505092915050565b61052a81610625565b82525050565b600061053d602683610614565b915061054882610657565b604082019050919050565b6000610560603383610614565b915061056b826106a6565b604082019050919050565b6000610583602083610614565b915061058e826106f5565b602082019050919050565b60006020820190506105ae6000830184610521565b92915050565b600060208201905081810360008301526105cd81610530565b9050919050565b600060208201905081810360008301526105ed81610553565b9050919050565b6000602082019050818103600083015261060d81610576565b9050919050565b600082825260208201905092915050565b600061063082610637565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f5570677261646561626c65426561636f6e3a20696d706c656d656e746174696f60008201527f6e206973206e6f74206120636f6e747261637400000000000000000000000000602082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b61072781610625565b811461073257600080fd5b5056fea2646970667358221220b08536f16e3153f175b1bb90999a11ac0e479da8f11d939be022cff8e20cee6564736f6c63430008040033";
var UpgradeableBeacon__factory = /** @class */ (function (_super) {
    __extends(UpgradeableBeacon__factory, _super);
    function UpgradeableBeacon__factory(signer) {
        return _super.call(this, _abi, _bytecode, signer) || this;
    }
    UpgradeableBeacon__factory.prototype.deploy = function (implementation_, overrides) {
        return _super.prototype.deploy.call(this, implementation_, overrides || {});
    };
    UpgradeableBeacon__factory.prototype.getDeployTransaction = function (implementation_, overrides) {
        return _super.prototype.getDeployTransaction.call(this, implementation_, overrides || {});
    };
    UpgradeableBeacon__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    UpgradeableBeacon__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    UpgradeableBeacon__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    UpgradeableBeacon__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    UpgradeableBeacon__factory.bytecode = _bytecode;
    UpgradeableBeacon__factory.abi = _abi;
    return UpgradeableBeacon__factory;
}(ethers_1.ContractFactory));
exports.UpgradeableBeacon__factory = UpgradeableBeacon__factory;