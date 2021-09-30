"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidationAuctionLike__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [],
        name: "collateralType",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "debtToRaise",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "collateralToSell",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "position",
                type: "address",
            },
            {
                internalType: "address",
                name: "keeper",
                type: "address",
            },
        ],
        name: "startAuction",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class LiquidationAuctionLike__factory {
    static abi = _abi;
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.LiquidationAuctionLike__factory = LiquidationAuctionLike__factory;
