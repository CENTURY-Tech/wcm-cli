"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Dependencies
 */
const path = require("path");
const lib = require("../lib");
function exec(projectPath, outDestination) {
    "use strict";
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
         * modules listed within this project and recursively within it's dependencies.
         */
        const dependencyGraph = generateGraph(path.normalize(projectPath));
        yield dependencyGraph.copyModules(outDestination);
        yield lib.writeJsonToFile(path.join(projectPath, "manifest.json"), dependencyGraph.toReadable());
        console.log("Done");
    });
}
exports.exec = exec;
/**
 * Build a verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
 * modules listed within this project and recursively within it's dependencies.
 */
function generateGraph(projectPath) {
    "use strict";
    const bowerJson = lib.readBowerJson(projectPath);
    const dependencyGraphVerbose = new lib.DependencyGraph();
    for (let dependency in bowerJson.dependencies) {
        const iterator = traverseModule(path.join(projectPath, "bower_components", dependency), dependencyGraphVerbose);
        for (let dependency of iterator) {
            dependencyGraphVerbose.addDependency(dependency);
        }
    }
    return dependencyGraphVerbose;
}
/**
 * Recursively resolve the dependencies of the bower release/module at the path supplied.
 */
function* traverseModule(modulePath, currentGraph) {
    "use strict";
    const moduleJson = lib.readBowerModuleJson(modulePath);
    yield new lib.DependencyShorthand({
        name: moduleJson.name,
        path: modulePath,
        type: "bower",
        version: moduleJson._release,
        dependencies: moduleJson.dependencies ? Object.keys(moduleJson.dependencies) : []
    });
    for (let dependency in moduleJson.dependencies) {
        if (!currentGraph.hasDependency(dependency)) {
            yield* traverseModule(path.join(modulePath, "..", dependency), currentGraph);
        }
    }
}
