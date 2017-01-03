"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const path = require("path");
const filesystem_1 = require("./filesystem");
class DependencyShorthand {
    constructor(args) {
        Object.assign(this, args);
    }
    /**
     * Generate a dependency pointer for this dependency.
     */
    generateDependencyPointer() {
        "use strict";
        return generateDependencyPointer(this.name, this.version);
    }
}
exports.DependencyShorthand = DependencyShorthand;
class DependencyGraph {
    constructor() {
        this.dependencies = {};
    }
    /**
     * Add a dependency to the dependency graph.
     */
    addDependency(dependency) {
        "use strict";
        this.dependencies[dependency.name] = dependency;
    }
    /**
     * Check to see whether or not a dependency with the supplied name is currently held within the instance of the
     * dependency graph.
     */
    hasDependency(dependencyName) {
        "use strict";
        return this.dependencies[dependencyName] !== undefined;
    }
    /**
     *
     */
    copyModules(outDestination) {
        "use strict";
        return __awaiter(this, void 0, void 0, function* () {
            yield filesystem_1.removeDirectory(outDestination);
            const dependencyPaths = [];
            for (let dependency of Object.values(this.dependencies)) {
                yield filesystem_1.copyModule(dependency.path, path.join(outDestination, dependency.name, dependency.version));
            }
        });
    }
    /**
     * Convert this verbose dependency graph into a human readable dependency graph.
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
exports.DependencyGraph = DependencyGraph;
/**
 * Read and parse the package JSON file at the supplied path.
 */
function readPackageJson(projectPath) {
    "use strict";
    return filesystem_1.readFileAsJson(path.resolve(projectPath, "package.json"));
}
exports.readPackageJson = readPackageJson;
/**
 * Read and parse the bower JSON file at the supplied path.
 */
function readBowerJson(projectPath) {
    "use strict";
    return filesystem_1.readFileAsJson(path.resolve(projectPath, "bower.json"));
}
exports.readBowerJson = readBowerJson;
/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
function readBowerModuleJson(modulePath) {
    "use strict";
    return filesystem_1.readFileAsJson(path.resolve(modulePath, ".bower.json"));
}
exports.readBowerModuleJson = readBowerModuleJson;
/**
 * Generate a dependency pointer.
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
__export(require("./filesystem"));
