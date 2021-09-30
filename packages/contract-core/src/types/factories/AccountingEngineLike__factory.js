"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
exports.__esModule = true;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        name: "settleUnbackedDebtFromAuction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "totalDebtOnAuction",
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
var AccountingEngineLike__factory = /** @class */ (function () {
    function AccountingEngineLike__factory() {
    }
    AccountingEngineLike__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    AccountingEngineLike__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    AccountingEngineLike__factory.abi = _abi;
    return AccountingEngineLike__factory;
}());
exports.AccountingEngineLike__factory = AccountingEngineLike__factory;