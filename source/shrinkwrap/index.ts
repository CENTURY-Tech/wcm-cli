/**
 * Dependencies
 */
import * as path from "path";
import * as bowerJSON from "gist-bower-json";
import { readBowerJsonSync, readBowerModuleJsonSync, writeJsonToFile } from "../lib/filesystem";
import { DependencyGraph, DependencyShorthand, moduleDependencies } from "../lib/scanner";

export async function exec(projectPath: string, outDestination: string): Promise<void> {
  "use strict";

  /**
   * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
   * modules listed within this project and recursively within it's dependencies.
   */
  const dependencyGraph = moduleDependencies.resolveProjectDependencies(path.normalize(projectPath));

  await dependencyGraph.copyModules(outDestination);

  await writeJsonToFile(path.join(projectPath, "manifest.json"), dependencyGraph.toReadable());

  console.log("Done");
}
