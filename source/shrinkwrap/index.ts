/**
 * Dependencies
 */
import * as path from "path";
import * as program from "commander";
import * as lib from "../lib";

export function exec(program: program.IExportedCommand) {
  "use strict";

  const bowerJson = lib.readBowerJson(program["path"]);

  /**
   * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
   * modules listed within this project and recursively within it's dependencies.
   */
  const dependencyGraphVerbose: lib.IDependencyGraphVerbose = generateGraph(bowerJson);

  /**
   * A human readable dependency graph that will eventually reside in the "manifest.json" file once the shrinkwrapping
   * process has completed.
   */
  const dependencyGraphReadable: lib.IDependencyGraphReadable = dependencyGraphVerbose.toReadable();

  console.log(dependencyGraphReadable);
}

/**
 * Build a verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
 * modules listed within this project and recursively within it's dependencies.
 */
function generateGraph(bowerJson: lib.IBowerJSON): lib.IDependencyGraphVerbose {
  "use strict";

  const dependencyGraphVerbose: lib.IDependencyGraphVerbose = new lib.DependencyGraphVerbose();

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
function* traverseModule(modulePath: string, currentGraph: lib.IDependencyGraphVerbose): IterableIterator<lib.IDependencyShorthand> {
  "use strict";

  const moduleJson: lib.IBowerModuleJSON = lib.readBowerModuleJson(modulePath);

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
