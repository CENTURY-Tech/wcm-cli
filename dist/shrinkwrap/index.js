"use strict";
/**
 * Dependencies
 */
const path = require("path");
const program = require("commander");
const lib = require("../lib");
function exec(program) {
    "use strict";
    /**
     * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
     * modules listed within this project and recursively within it's dependencies.
     */
    const dependencyGraph = generateGraph(path.normalize(program["path"]));
    dependencyGraph.copyModules(path.normalize(program["dest"]))
        .then(() => {
        console.log("Done!");
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
        const iterator = traverseModule(path.join(program["path"], "bower_components", dependency), dependencyGraphVerbose);
        for (let dependency of iterator) {
            dependencyGraphVerbose.addDependency(dependency);
        }
    }
    return dependencyGraphVerbose;
}
exports.generateGraph = generateGraph;
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
