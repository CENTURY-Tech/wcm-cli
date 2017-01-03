"use strict";
/**
 * Dependencies
 */
const fs = require("fs");
const path = require("path");
const errors = require("./errors");
class DependencyShorthand {
    constructor(args) {
        Object.assign(this, args);
    }
    /**
     * Generate a dependency pointer for this dependency
     */
    generateDependencyPointer() {
        "use strict";
        return generateDependencyPointer(this.name, this.version);
    }
}
exports.DependencyShorthand = DependencyShorthand;
class DependencyGraphVerbose {
    constructor() {
        this.dependencies = {};
    }
    addDependency(dependency) {
        "use strict";
        this.dependencies[dependency.name] = dependency;
    }
    hasDependency(dependencyName) {
        "use strict";
        return this.dependencies[dependencyName] !== undefined;
    }
    /**
     * Convert this verbose dependency graph into a human readable dependency graph
     */
    toReadable() {
        "use strict";
        const dependencyGraphReadable = {};
        for (let dependency of Object.values(this.dependencies)) {
            dependencyGraphReadable[dependency.generateDependencyPointer()] = dependency.dependencies
                .map((dependency) => {
                return this.dependencies[dependency].generateDependencyPointer();
            });
        }
        return dependencyGraphReadable;
    }
}
exports.DependencyGraphVerbose = DependencyGraphVerbose;
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
/**
 * Read and parse the release/module bower JSON file at the supplied path
 */
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
        void errors.fileNotFound(fullPath).exit();
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}
exports.readFileAsJson = readFileAsJson;
/**
 * Generate a dependency pointer
 */
function generateDependencyPointer(dependencyName, dependencyVersion) {
    "use strict";
    return `${dependencyName}@${dependencyVersion}`;
}
exports.generateDependencyPointer = generateDependencyPointer;
var BowerModuleType;
(function (BowerModuleType) {
    BowerModuleType[BowerModuleType["globals"] = 0] = "globals";
    BowerModuleType[BowerModuleType["amd"] = 1] = "amd";
    BowerModuleType[BowerModuleType["node"] = 2] = "node";
    BowerModuleType[BowerModuleType["es6"] = 3] = "es6";
    BowerModuleType[BowerModuleType["yui"] = 4] = "yui";
})(BowerModuleType || (BowerModuleType = {}));
