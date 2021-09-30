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
                name: "_logic",
                type: "address"
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes"
            },
        ],
        stateMutability: "payable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "previousAdmin",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "newAdmin",
                type: "address"
            },
        ],
        name: "AdminChanged",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "beacon",
                type: "address"
            },
        ],
        name: "BeaconUpgraded",
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
        stateMutability: "payable",
        type: "fallback"
    },
    {
        stateMutability: "payable",
        type: "receive"
    },
];
var _bytecode = "0x608060405260405162000d2f38038062000d2f83398181016040528101906200002991906200046f565b60017f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd60001c6200005b9190620006a1565b60001b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b14620000b7577f4e487b7100000000000000000000000000000000000000000000000000000000600052600160045260246000fd5b620000cb82826000620000d360201b60201c565b5050620008ad565b620000e4836200011660201b60201c565b600082511180620000f25750805b1562000111576200010f83836200016d60201b620000371760201c565b505b505050565b6200012781620001a360201b60201c565b8073ffffffffffffffffffffffffffffffffffffffff167fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b60405160405180910390a250565b60606200019b838360405180606001604052806027815260200162000d08602791396200027960201b60201c565b905092915050565b620001b9816200035d60201b620000641760201c565b620001fb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620001f290620005cc565b60405180910390fd5b80620002357f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b6200037060201b620000771760201c565b60000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60606200028c846200035d60201b60201c565b620002ce576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002c590620005ee565b60405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff1685604051620002f891906200058f565b600060405180830381855af49150503d806000811462000335576040519150601f19603f3d011682016040523d82523d6000602084013e6200033a565b606091505b5091509150620003528282866200037a60201b60201c565b925050509392505050565b600080823b905060008111915050919050565b6000819050919050565b606083156200038c57829050620003df565b600083511115620003a05782518084602001fd5b816040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003d69190620005a8565b60405180910390fd5b9392505050565b6000620003fd620003f78462000639565b62000610565b9050828152602081018484840111156200041657600080fd5b620004238482856200071a565b509392505050565b6000815190506200043c8162000893565b92915050565b600082601f8301126200045457600080fd5b815162000466848260208601620003e6565b91505092915050565b600080604083850312156200048357600080fd5b600062000493858286016200042b565b925050602083015167ffffffffffffffff811115620004b157600080fd5b620004bf8582860162000442565b9150509250929050565b6000620004d6826200066f565b620004e2818562000685565b9350620004f48185602086016200071a565b80840191505092915050565b60006200050d826200067a565b62000519818562000690565b93506200052b8185602086016200071a565b6200053681620007e4565b840191505092915050565b600062000550602d8362000690565b91506200055d82620007f5565b604082019050919050565b60006200057760268362000690565b9150620005848262000844565b604082019050919050565b60006200059d8284620004c9565b915081905092915050565b60006020820190508181036000830152620005c4818462000500565b905092915050565b60006020820190508181036000830152620005e78162000541565b9050919050565b60006020820190508181036000830152620006098162000568565b9050919050565b60006200061c6200062f565b90506200062a828262000750565b919050565b6000604051905090565b600067ffffffffffffffff821115620006575762000656620007b5565b5b6200066282620007e4565b9050602081019050919050565b600081519050919050565b600081519050919050565b600081905092915050565b600082825260208201905092915050565b6000620006ae8262000710565b9150620006bb8362000710565b925082821015620006d157620006d062000786565b5b828203905092915050565b6000620006e982620006f0565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60005b838110156200073a5780820151818401526020810190506200071d565b838111156200074a576000848401525b50505050565b6200075b82620007e4565b810181811067ffffffffffffffff821117156200077d576200077c620007b5565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60008201527f6f74206120636f6e747261637400000000000000000000000000000000000000602082015250565b7f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f60008201527f6e74726163740000000000000000000000000000000000000000000000000000602082015250565b6200089e81620006dc565b8114620008aa57600080fd5b50565b61044b80620008bd6000396000f3fe6080604052366100135761001161001d565b005b61001b61001d565b005b610025610081565b610035610030610083565b610092565b565b606061005c83836040518060600160405280602781526020016103ef602791396100b8565b905092915050565b600080823b905060008111915050919050565b6000819050919050565b565b600061008d610185565b905090565b3660008037600080366000845af43d6000803e80600081146100b3573d6000f35b3d6000fd5b60606100c384610064565b610102576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100f990610309565b60405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff168560405161012a91906102d0565b600060405180830381855af49150503d8060008114610165576040519150601f19603f3d011682016040523d82523d6000602084013e61016a565b606091505b509150915061017a8282866101dc565b925050509392505050565b60006101b37f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b610077565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606083156101ec5782905061023c565b6000835111156101ff5782518084602001fd5b816040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161023391906102e7565b60405180910390fd5b9392505050565b600061024e82610329565b610258818561033f565b935061026881856020860161035b565b80840191505092915050565b600061027f82610334565b610289818561034a565b935061029981856020860161035b565b6102a28161038e565b840191505092915050565b60006102ba60268361034a565b91506102c58261039f565b604082019050919050565b60006102dc8284610243565b915081905092915050565b600060208201905081810360008301526103018184610274565b905092915050565b60006020820190508181036000830152610322816102ad565b9050919050565b600081519050919050565b600081519050919050565b600081905092915050565b600082825260208201905092915050565b60005b8381101561037957808201518184015260208101905061035e565b83811115610388576000848401525b50505050565b6000601f19601f8301169050919050565b7f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f60008201527f6e7472616374000000000000000000000000000000000000000000000000000060208201525056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a2646970667358221220699ffdf10f7e1e16b6fdf7f03a698211878c8b71d506f4560788e23e7453521764736f6c63430008040033416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564";
var ERC1967Proxy__factory = /** @class */ (function (_super) {
    __extends(ERC1967Proxy__factory, _super);
    function ERC1967Proxy__factory(signer) {
        return _super.call(this, _abi, _bytecode, signer) || this;
    }
    ERC1967Proxy__factory.prototype.deploy = function (_logic, _data, overrides) {
        return _super.prototype.deploy.call(this, _logic, _data, overrides || {});
    };
    ERC1967Proxy__factory.prototype.getDeployTransaction = function (_logic, _data, overrides) {
        return _super.prototype.getDeployTransaction.call(this, _logic, _data, overrides || {});
    };
    ERC1967Proxy__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    ERC1967Proxy__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    ERC1967Proxy__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ERC1967Proxy__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ERC1967Proxy__factory.bytecode = _bytecode;
    ERC1967Proxy__factory.abi = _abi;
    return ERC1967Proxy__factory;
}(ethers_1.ContractFactory));
exports.ERC1967Proxy__factory = ERC1967Proxy__factory;
