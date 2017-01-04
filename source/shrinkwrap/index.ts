/**
 * Dependencies
 */
import * as path from "path";
import * as program from "commander";
import * as lib from "../lib";

export async function exec(program: program.IExportedCommand) {
  "use strict";

  /**
   * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
   * modules listed within this project and recursively within it's dependencies.
   */
  const dependencyGraph = generateGraph(path.normalize(program["path"]));

  await dependencyGraph.copyModules(path.normalize(program["dest"]));
  
  await lib.writeJsonToFile(path.join(program["path"], "manifest.json"), dependencyGraph.toReadable());

  console.log("Done");
}

/**
 * Build a verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
 * modules listed within this project and recursively within it's dependencies.
 */
export function generateGraph(projectPath: string): lib.DependencyGraph {
  "use strict";

  const bowerJson: lib.IBowerJSON = lib.readBowerJson(projectPath);
  const dependencyGraphVerbose: lib.DependencyGraph = new lib.DependencyGraph();

  for (let dependency in bowerJson.dependencies) {
    const iterator = traverseModule(path.join(program["path"], "bower_components", dependency), dependencyGraphVerbose);

    for (let dependency of iterator) {
      dependencyGraphVerbose.addDependency(dependency);
    }
  }

  return dependencyGraphVerbose;
}

/**
 * Recursively resolve the dependencies of the bower release/module at the path supplied.
 */
function* traverseModule(modulePath: string, currentGraph: lib.DependencyGraph): IterableIterator<lib.DependencyShorthand> {
  "use strict";

  const moduleJson: lib.IBowerModuleJSON = lib.readBowerModuleJson(modulePath);

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
