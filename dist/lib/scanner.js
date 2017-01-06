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
const logger_1 = require("./logger");
const filesystem_1 = require("./filesystem");
/**
 * A reduced cross-compatible definition for a project dependency.
 */
class DependencyShorthand {
    constructor(moduleJson, modulePath) {
        this.references = 0;
        Object.assign(this, {
            name: moduleJson.name,
            path: modulePath,
            version: moduleJson._release,
            dependencies: moduleJson.dependencies ? Object.keys(moduleJson.dependencies) : []
        });
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
    markReference(moduleName) {
        this.dependencies[moduleName].references++;
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
            dependencyGraphReadable["graph"][dependency.name] = dependency.dependencies
                .map((dependency) => {
                return this.dependencies[dependency].name;
            })
                .sort((a, b) => {
                return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
            });
            dependencyGraphReadable["shrinkwrap"][dependency.name] = dependency.version;
        });
        return dependencyGraphReadable;
    }
}
exports.DependencyGraph = DependencyGraph;
var htmlImports;
(function (htmlImports) {
    /**
     * Recursively resolve all relative HTML imports
     */
    function resolveHtmlImports(sourcePath) {
        "use strict";
        const dependencyGraph = new DependencyGraph();
        for (let file of filesystem_1.walkDirectory(sourcePath)) {
            console.log(file);
        }
        return dependencyGraph;
    }
    htmlImports.resolveHtmlImports = resolveHtmlImports;
    function* traverseImports(sourceFile, dependencyGraph) {
        "use strict";
        /*const $ = cheerio.load(readFileSync(sourceFile));
    
        yield {
          fullPath: path.normalize(entryPath)
    
        };
    
        for (let link of $("link").toArray()) {
          const linkHref = link.attribs["href"].replace(linkHrefRegex, "");
          const linkPath = path.join(path.dirname(entryPath), linkHref);
    
          if (!dependenciesPathRegex.test(linkHref) && !processedPaths.includes(linkPath)) {
            yield* traverseImports(linkPath, processedPaths, linkHrefRegex, dependenciesPathRegex);
          }
      }*/
    }
})(htmlImports = exports.htmlImports || (exports.htmlImports = {}));
/**
 * A set of functions to resolve and copy module dependencies.
 */
var moduleDependencies;
(function (moduleDependencies) {
    /**
     * Recursilvely traverse a projects declared dependencies, and
     */
    function resolveProjectDependencies(projectPath) {
        "use strict";
        const logger = logger_1.thread("Traversing module dependencies");
        const bowerJson = filesystem_1.readBowerJsonSync(projectPath);
        const dependencyGraph = new DependencyGraph();
        for (let dependency in bowerJson.dependencies) {
            const modulePath = path.join(projectPath, "bower_components", dependency);
            const iterator = traverseModule(modulePath, dependencyGraph);
            logger.log("Inspecting \"%s\"", dependency);
            for (let dependency of iterator) {
                dependencyGraph.addDependency(dependency);
            }
        }
        return dependencyGraph;
    }
    moduleDependencies.resolveProjectDependencies = resolveProjectDependencies;
    /**
     * Recursively traverse a modules declared dependencies. This method will inspect the module / release Bower file in
     * each dependency that it encouters and shall return a Dependency graph when complete.
     */
    function resolveModuleDependencies(modulePath) {
        "use strict";
        const dependencyGraph = new DependencyGraph();
        for (let dependency of traverseModule(modulePath, dependencyGraph)) {
            dependencyGraph.addDependency(dependency);
        }
        return dependencyGraph;
    }
    moduleDependencies.resolveModuleDependencies = resolveModuleDependencies;
    /**
     * A private method that will recursively inspect the module and its dependencies at the module path supplied.
     */
    function* traverseModule(modulePath, dependencyGraph) {
        "use strict";
        const moduleJson = filesystem_1.readBowerModuleJsonSync(modulePath);
        yield new DependencyShorthand(moduleJson, modulePath);
        for (let dependency in moduleJson.dependencies) {
            if (!dependencyGraph.hasDependency(dependency)) {
                yield* traverseModule(path.join(modulePath, "..", dependency), dependencyGraph);
            }
            else {
                dependencyGraph.markReference(moduleJson.name);
            }
        }
    }
})(moduleDependencies = exports.moduleDependencies || (exports.moduleDependencies = {}));
