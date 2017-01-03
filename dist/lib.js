"use strict";
/**
 * Dependencies
 */
const fs = require("fs");
const path = require("path");
const errors = require("./errors");
/**
 * Read and parse the package JSON file at the supplied path
 */
function readPackageJson(projectPath) {
    "use strict";
    return readFileAsJson(path.resolve(projectPath, "package.json"));
}
exports.readPackageJson = readPackageJson;
/**
 * Read and parse the bower JSON file at the supplied path
 */
function readBowerJson(projectPath) {
    "use strict";
    return readFileAsJson(path.resolve(projectPath, "bower.json"));
}
exports.readBowerJson = readBowerJson;
function readBowerModuleJson(modulePath) {
    "use strict";
    return readFileAsJson(path.resolve(modulePath, ".bower.json"));
}
exports.readBowerModuleJson = readBowerModuleJson;
/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found
 */
function readFileAsJson(fullPath) {
    "use strict";
    if (!fs.existsSync(fullPath)) {
        errors.fileNotFound(fullPath).exit();
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}
exports.readFileAsJson = readFileAsJson;
var BowerModuleType;
(function (BowerModuleType) {
    BowerModuleType[BowerModuleType["globals"] = 0] = "globals";
    BowerModuleType[BowerModuleType["amd"] = 1] = "amd";
    BowerModuleType[BowerModuleType["node"] = 2] = "node";
    BowerModuleType[BowerModuleType["es6"] = 3] = "es6";
    BowerModuleType[BowerModuleType["yui"] = 4] = "yui";
})(BowerModuleType || (BowerModuleType = {}));
