"use strict";
/**
 * Dependencies
 */
const path = require("path");
const program = require("commander");
const lib = require("../lib");
function exec(program) {
    "use strict";
    const bowerJson = lib.readBowerJson(program["path"]);
    /**
     * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
     * modules listed within this project and recursively within it's dependencies.
     */
    const dependencyGraphVerbose = generateGraph(bowerJson);
    /**
     * A human readable dependency graph that will eventually reside in the "manifest.json" file once the shrinkwrapping
     * process has completed.
     */
    const dependencyGraphReadable = dependencyGraphVerbose.toReadable();
    console.log(dependencyGraphReadable);
}
exports.exec = exec;
/**
 * Build a verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
 * modules listed within this project and recursively within it's dependencies.
 */
function generateGraph(bowerJson) {
    "use strict";
    const dependencyGraphVerbose = new lib.DependencyGraphVerbose();
    for (let dependency in bowerJson.dependencies) {
        const iterator = traverseModule(path.join(program["path"], "bower_components", dependency), dependencyGraphVerbose);
        for (let dependency of iterator) {
            dependencyGraphVerbose.addDependency(dependency);
        }
    }
    return dependencyGraphVerbose;
}
/**
 * Recursively resolve the dependencies of the bower release/module at the path supplied
 */
function* traverseModule(modulePath, currentGraph) {
    "use strict";
    const moduleJson = lib.readBowerModuleJson(modulePath);
    yield new lib.DependencyShorthand({
        name: moduleJson.name,
        version: moduleJson._release,
        dependencies: moduleJson.dependencies ? Object.keys(moduleJson.dependencies) : []
    });
    for (let dependency in moduleJson.dependencies) {
        if (!currentGraph.hasDependency(dependency)) {
            yield* traverseModule(path.join(modulePath, "..", dependency), currentGraph);
        }
    }
}
