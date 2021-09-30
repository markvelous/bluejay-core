"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
exports.__esModule = true;
var ethers_1 = require("ethers");
var _abi = [
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
        inputs: [
            {
                internalType: "address",
                name: "stablecoinReceiver",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "initialGovernanceTokenBid",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "debtLotSize",
                type: "uint256"
            },
        ],
        name: "startAuction",
        outputs: [
            {
                internalType: "uint256",
                name: "auctionId",
                type: "uint256"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var DebtAuctionLike__factory = /** @class */ (function () {
    function DebtAuctionLike__factory() {
    }
    DebtAuctionLike__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    DebtAuctionLike__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    DebtAuctionLike__factory.abi = _abi;
    return DebtAuctionLike__factory;
}());
exports.DebtAuctionLike__factory = DebtAuctionLike__factory;