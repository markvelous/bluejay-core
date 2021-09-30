"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
exports.__esModule = true;
var ethers_1 = require("ethers");
var _abi = [
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
];
var IBeaconUpgradeable__factory = /** @class */ (function () {
    function IBeaconUpgradeable__factory() {
    }
    IBeaconUpgradeable__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IBeaconUpgradeable__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IBeaconUpgradeable__factory.abi = _abi;
    return IBeaconUpgradeable__factory;
}());
exports.IBeaconUpgradeable__factory = IBeaconUpgradeable__factory;