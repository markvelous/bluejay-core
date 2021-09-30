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
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            },
        ],
        name: "collateralTypes",
        outputs: [
            {
                internalType: "contract OracleLike",
                name: "",
                type: "address"
            },
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
        name: "redemptionPrice",
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
var OracleRelayerLike__factory = /** @class */ (function () {
    function OracleRelayerLike__factory() {
    }
    OracleRelayerLike__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    OracleRelayerLike__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    OracleRelayerLike__factory.abi = _abi;
    return OracleRelayerLike__factory;
}());
exports.OracleRelayerLike__factory = OracleRelayerLike__factory;
