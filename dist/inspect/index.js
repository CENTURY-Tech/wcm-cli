"use strict";
const chalk = require("chalk");
const logger_1 = require("../lib/logger");
const scanner_1 = require("../lib/scanner");
function exec(opts) {
    "use strict";
    if (opts.projectPath) {
        void inspectProject(opts.projectPath);
    }
    if (opts.modulePath) {
        void inspectModule(opts.modulePath);
    }
}
exports.exec = exec;
/**
 * Inspect the project at the path specified and print the results to the command line.
 */
function inspectProject(projectPath) {
    "use strict";
    scanner_1.htmlImports.resolveHtmlImports(projectPath);
    /*const dependencyGraph: DependencyGraph = moduleDependencies.resolveProjectDependencies(projectPath);
  
    void table.print([
      table.header("Module name", "Direct references"),
      ...Object.values(dependencyGraph.dependencies).map((dependency: DependencyShorthand) => ([
        `"${dependency.name}"`, dependency.references
      ]))
    ]);*/
}
/**
 * Inspect the module at the path specified and print the results to the command line.
 */
function inspectModule(modulePath) {
    "use strict";
    const dependencyGraph = scanner_1.moduleDependencies.resolveModuleDependencies(modulePath);
    void logger_1.table.print([
        logger_1.table.header("Dependency name", "Direct references"),
        ...Object.values(dependencyGraph.dependencies).map((dependency) => ([
            chalk.bgRed(`"${dependency.name}"`), dependency.references
        ]))
    ]);
}
