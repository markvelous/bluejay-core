"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
exports.__esModule = true;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [],
        name: "collateralType",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "debtToRaise",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "collateralToSell",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "position",
                type: "address"
            },
            {
                internalType: "address",
                name: "keeper",
                type: "address"
            },
        ],
        name: "startAuction",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var LiquidationAuctionLike__factory = /** @class */ (function () {
    function LiquidationAuctionLike__factory() {
    }
    LiquidationAuctionLike__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    LiquidationAuctionLike__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    LiquidationAuctionLike__factory.abi = _abi;
    return LiquidationAuctionLike__factory;
}());
exports.LiquidationAuctionLike__factory = LiquidationAuctionLike__factory;
