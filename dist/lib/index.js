"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path = require("path");
const logger_1 = require("./logger");
const filesystem_1 = require("./filesystem");
class DependencyShorthand {
    constructor(args) {
        Object.assign(this, args);
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
     * Check to see whether or not a dependency with the supplied name is currently held within this instance of the
     * dependency graph.
     */
    hasDependency(dependencyName) {
        "use strict";
        return this.dependencies[dependencyName] !== undefined;
    }
    /**
     * Copy the modules currently held within this instance of the dependency graph to the output destination supplied.
     * Please note that this function will also clear the contents of the output destination prior to performing this
     * task.
     */
    copyModules(outDestination) {
        "use strict";
        return __awaiter(this, void 0, void 0, function* () {
            yield filesystem_1.removeDirectory(outDestination);
            yield logger_1.progress.ArrayTracker.from(Object.values(this.dependencies))
                .trackForEachAsync("Copying modules", (dependency) => {
                return filesystem_1.copyModule(dependency.path, path.join(outDestination, dependency.name, dependency.version));
            });
        });
    }
    /**
     * Convert this verbose dependency graph into a human readable dependency graph.
     */
    toReadable() {
        "use strict";
        const dependencyGraphReadable = {
            graph: {},
            shrinkwrap: {}
        };
        Object.values(this.dependencies)
            .sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        })
            .forEach((dependency) => {
            dependencyGraphReadable.graph[dependency.name] = dependency.dependencies
                .map((dependency) => {
                return this.dependencies[dependency].name;
            })
                .sort((a, b) => {
                return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
            });
            dependencyGraphReadable.shrinkwrap[dependency.name] = dependency.version;
        });
        return dependencyGraphReadable;
    }
}
exports.DependencyGraph = DependencyGraph;
