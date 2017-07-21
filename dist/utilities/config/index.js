"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const ramda_1 = require("ramda");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["debug"] = 0] = "debug";
    LogLevel[LogLevel["info"] = 1] = "info";
    LogLevel[LogLevel["warn"] = 2] = "warn";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var PackageManager;
(function (PackageManager) {
    PackageManager["bower"] = "bower_components";
    PackageManager["npm"] = "node_modules";
})(PackageManager = exports.PackageManager || (exports.PackageManager = {}));
const validate = new Ajv().compile({
    properties: {
        componentOptions: {
            properties: {
                main: {
                    type: [
                        "string",
                        "array",
                    ],
                },
                rootDir: {
                    type: "string",
                },
                outDir: {
                    type: "string",
                },
            },
            required: [
                "main",
                "rootDir",
                "outDir",
            ],
            type: "object",
        },
        shrinkwrapOptions: {
            properties: {
                uriPrefix: {
                    type: "string",
                },
            },
            type: "object",
            default: {},
        },
        commandLineOptions: {
            properties: {
                debugEnabled: {
                    type: "boolean"
                },
                logLevel: {
                    enum: [
                        "debug",
                        "info",
                        "warn",
                    ],
                    type: "string",
                    default: "warn"
                },
                logHandledErrors: {
                    type: "boolean",
                },
            },
            type: "object",
            default: {},
        },
        dependencyManagement: {
            properties: {
                packageManager: {
                    enum: [
                        "bower",
                        "npm",
                    ],
                    type: "string",
                },
                optimise: {
                    type: "boolean",
                },
            },
            required: [
                "packageManager",
            ],
            type: "object",
        },
    },
    required: [
        "componentOptions",
        "dependencyManagement",
    ],
    type: "object",
});
let config = {};
/**
 * This method will set the default options to the used by the CLI.
 *
 * @param {Config} config - The default options to be applied
 *
 * @returns {Void}
 */
function applyConfig(value) {
    config = ramda_1.merge(value, config);
    validateConfig();
}
exports.applyConfig = applyConfig;
function updateComponentOptions(key, value) {
    config.componentOptions[key] = value;
    validateConfig();
}
exports.updateComponentOptions = updateComponentOptions;
function getComponentOptions() {
    return config.componentOptions;
}
exports.getComponentOptions = getComponentOptions;
function getShrinkwrapOptions() {
    return config.shrinkwrapOptions;
}
exports.getShrinkwrapOptions = getShrinkwrapOptions;
function getCommandLineOptions() {
    return config.commandLineOptions;
}
exports.getCommandLineOptions = getCommandLineOptions;
function getDependencyManagement() {
    return config.dependencyManagement;
}
exports.getDependencyManagement = getDependencyManagement;
function validateConfig() {
    if (!validate(config)) {
        console.log("The config file is invalid, please ensure that the WCM file is correctly formatted!");
        process.exit(1);
    }
}
