"use strict";
/**
 * Dependencies
 */
const R = require("ramda");
const path = require("path");
const chalk = require("chalk");
const semver = require("semver");
const cheerio = require("cheerio");
const errors_1 = require("../utilities/errors");
const filesystem_1 = require("../utilities/filesystem");
const logger_1 = require("../utilities/logger");
var DependencyGraph;
(function (DependencyGraph) {
    let graphOpts = {
        bowerJSON: undefined,
        sourcePath: undefined
    };
    /**
     * A collection of DependencyShorthands.
     */
    DependencyGraph.dependencies = {};
    /**
     * A collection of ImportedDependencys.
     */
    DependencyGraph.imports = {};
    class DependencyShorthand {
        constructor(opts) {
            this.dependencies = [];
            this.name = opts.name;
            this.version = semver.clean(opts.version);
            for (let dependency in opts.dependencies) {
                this.dependencies.push({
                    get ref() {
                        let dependencyRef;
                        if (DependencyGraph.dependencies[dependency]) {
                            dependencyRef = DependencyGraph.dependencies[dependency];
                        }
                        else if (DependencyGraph.dependencies[dependency.toLowerCase()]) {
                            logger_1.warn("Dependency with the exact name \"%s\" was not found, however a case insensitive match was found", dependency);
                            dependencyRef = DependencyGraph.dependencies[dependency.toLowerCase()];
                        }
                        if (!dependencyRef) {
                            errors_1.exitWithError(Error(`Unable to find dependency with the name "${dependency}"`));
                        }
                        return dependencyRef;
                    },
                    desiredVersion: opts.dependencies[dependency]
                });
            }
        }
        /**
         * Retrieve a dependency pointer for this Dependency Shorthand.
         */
        getPointer() {
            return DependencyShorthand.generatePointer(this);
        }
        /**
         * Calculate and return the satisfaction value for this Dependency Shorthand.
         */
        getSatisfaction() {
            return R.defaultTo(1, this.dependencies.reduce((currentSatisfaction, dependency) => {
                return semver.satisfies(dependency.ref.version, dependency.desiredVersion) ? currentSatisfaction : currentSatisfaction - 1;
            }, this.dependencies.length) / this.dependencies.length);
        }
        static generatePointer(opts) {
            return `${opts.name}@${opts.version}`;
        }
    }
    class ImportedDependency {
        constructor(opts) {
            this.from = {
                get ref() {
                    return DependencyGraph.dependencies[opts.from.name];
                },
                path: opts.from.path
            };
            this.to = {
                get ref() {
                    return DependencyGraph.dependencies[opts.to.name];
                },
                path: opts.to.path
            };
        }
        getDependantPointer() {
            return DependencyShorthand.generatePointer(this.from.ref);
        }
    }
    function init(projectPath) {
        graphOpts.bowerJSON = filesystem_1.readBowerJsonSync(projectPath);
        graphOpts.sourcePath = projectPath;
    }
    DependencyGraph.init = init;
    /**
     * Parse and register the dependency with the supplied name. Note that the dependency is expected to already exist in
     * the "bower_components" directory.
     */
    function addDependency(name) {
        /**
         * Log a warning if the dependency being added is not defined in the Bower JSON dependency list.
         */
        if (!graphOpts.bowerJSON.dependencies[name]) {
            logger_1.warn("Attempting to add a non-explicit dependency \"%s\"", name);
        }
        const bowerModuleJSON = filesystem_1.readBowerModuleJsonSync(path.resolve(graphOpts.sourcePath, "bower_components", name));
        const dependency = new DependencyShorthand({
            name: bowerModuleJSON.name,
            version: bowerModuleJSON._release,
            dependencies: bowerModuleJSON.dependencies
        });
        DependencyGraph.dependencies[dependency.name] = dependency;
        return DependencyGraph.dependencies[dependency.name];
    }
    DependencyGraph.addDependency = addDependency;
    /**
     * Add an HTML Import from a given dependency to another dependency. Note that both of the dependencies are expected
     * to have been previously registered.
     */
    function addHTMLImport(opts) {
        const HTMLImport = new ImportedDependency(opts);
        return HTMLImport;
    }
    DependencyGraph.addHTMLImport = addHTMLImport;
    function hasDependency(name) {
        return DependencyGraph.dependencies[name] !== undefined;
    }
    DependencyGraph.hasDependency = hasDependency;
})(DependencyGraph || (DependencyGraph = {}));
/**
 * Inspect the project at the path specified and print the results to the command line.
 */
function exec(opts) {
    DependencyGraph.init(opts.projectPath);
    const bowerJSON = filesystem_1.readBowerJsonSync(opts.projectPath);
    for (let dependency in bowerJSON.dependencies) {
        processDependency(dependency);
    }
    void logger_1.table.print([
        logger_1.table.header("Dependency name", "Satisfaction percentage"),
        ...Object.values(DependencyGraph.dependencies).map((dependency) => {
            const satisfaction = (dependency.getSatisfaction() * 100);
            if (satisfaction > 35) {
                return [`"${dependency.name}"`, satisfaction.toFixed(0) + "%"];
            }
            else {
                return [chalk.bgRed(`"${dependency.name}"`), satisfaction.toFixed(0) + "%"];
            }
        })
    ]);
    function processDependency(dependencyName) {
        const bowerModuleJSON = filesystem_1.readBowerModuleJsonSync(path.resolve(opts.projectPath, "bower_components", dependencyName));
        if (!DependencyGraph.hasDependency(bowerModuleJSON.name)) {
            DependencyGraph.addDependency(bowerModuleJSON.name);
        }
        for (let dependency in bowerModuleJSON.dependencies) {
            if (!DependencyGraph.hasDependency(dependency)) {
                void processDependency(dependency);
            }
        }
    }
    /**
     * A private method that will recursively inspect the module and its dependencies at the module path supplied.
     */
    function* resolveHTMLImports(rootPath, entryPath, completedPaths = []) {
        const $ = cheerio.load(filesystem_1.readFileSync(path.resolve(rootPath, entryPath)));
        for (let elem of $("link").toArray()) {
            const link = elem.attribs["href"].replace("{baseUrl}", "../../");
            if (!completedPaths.includes(link) && path.extname(link) === ".html") {
                completedPaths.push(link);
                yield { from: entryPath, to: link };
                yield* resolveHTMLImports(path.resolve(rootPath, path.dirname(entryPath)), link, completedPaths);
            }
        }
    }
}
exports.exec = exec;
/**
 * Retrieve the main Bower filepaths from the Bower JSON as an Array of Strings.
 */
function getBowerMainPaths(modulePath) {
    "use strict";
    const bowerJson = filesystem_1.readBowerJsonSync(modulePath);
    switch (bowerJson.main.constructor) {
        case String:
            return [bowerJson.main];
        case Array:
            return bowerJson.main;
        default:
            errors_1.exitWithError(new Error("No valid \"main\" value found in Bower JSON"));
    }
}
