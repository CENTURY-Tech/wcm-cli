"use strict";
/**
 * Dependencies
 */
const path = require("path");
const lib = require("../lib");
function exec(program) {
    const bowerJson = lib.readBowerJson(program["path"]);
    const dependencyGraph = {};
    for (let dependency in bowerJson.dependencies) {
        dependencyGraph[dependency] = resolveBowerModule(path.join(__dirname, "bower_components", dependency));
    }
}
exports.exec = exec;
/**
 * Recursively
 */
function resolveBowerModule(modulePath) {
    const bowerModuleJson = lib.readBowerModuleJson(modulePath);
    const dependencyShorthand = { version: bowerModuleJson._release };
    for (let dependency in bowerModuleJson.dependencies) {
        dependencyShorthand[dependency] = resolveBowerModule(path.join(modulePath, "..", dependency));
    }
    return dependencyShorthand;
}
