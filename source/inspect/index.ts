/**
 * Dependencies
 */
import * as path from "path";
import * as chalk from "chalk";
import * as cheerio from "cheerio";
import { readFileSync } from "../lib/filesystem";
import { table } from "../lib/logger";
import { DependencyGraph, DependencyShorthand, htmlImports, moduleDependencies } from "../lib/scanner";

export function exec(opts: { projectPath?: string, modulePath?: string }): void {
  "use strict";

  if (opts.projectPath) {
    void inspectProject(opts.projectPath);
  }

  if (opts.modulePath) {
    void inspectModule(opts.modulePath);
  }
}

/**
 * Inspect the project at the path specified and print the results to the command line.
 */
function inspectProject(projectPath: string): void {
  "use strict";

  htmlImports.resolveHtmlImports(projectPath);

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
function inspectModule(modulePath: string): void {
  "use strict";

  const dependencyGraph: DependencyGraph = moduleDependencies.resolveModuleDependencies(modulePath);

  void table.print([
    table.header("Dependency name", "Direct references"),
    ...Object.values(dependencyGraph.dependencies).map((dependency: DependencyShorthand) => ([
      chalk.bgRed(`"${dependency.name}"`), dependency.references
    ]))
  ]);
}
