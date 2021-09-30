"use strict";
exports.__esModule = true;
var debug_1 = require("debug");
exports.LOGGER_NAMESPACE = "bluejay";
var logger = debug_1["default"](exports.LOGGER_NAMESPACE);
exports.trace = function (namespace) { return logger.extend("trace:" + namespace); };
exports.info = function (namespace) { return logger.extend("info:" + namespace); };
exports.error = function (namespace) { return logger.extend("error:" + namespace); };
exports.getLogger = function (namespace) { return ({
    trace: exports.trace(namespace),
    info: exports.info(namespace),
    error: exports.error(namespace)
}); };
exports.enableAllLog = function () { return debug_1["default"].enable(exports.LOGGER_NAMESPACE + ":*"); };
exports.enableInfo = function () { return debug_1["default"].enable(exports.LOGGER_NAMESPACE + ":info:*"); };
exports.enableTrace = function () { return debug_1["default"].enable(exports.LOGGER_NAMESPACE + ":trace:*"); };
exports.enableError = function () { return debug_1["default"].enable(exports.LOGGER_NAMESPACE + ":error:*"); };
