/**
 * Dependencies
 */
import * as path from "path";
import * as program from "commander";
import * as lib from "../lib";

export function exec(program: program.IExportedCommand) {
  const bowerJson = lib.readBowerJson(program["path"]);
  const dependencyGraph: IDependencyGraph = {};

  for (let dependency in bowerJson.dependencies) {
    dependencyGraph[dependency] = resolveBowerModule(path.join(__dirname, "bower_components", dependency))
  }
}

/**
 * Recursively 
 */
function resolveBowerModule(modulePath: string): IPackageShorthand {
  const bowerModuleJson: lib.IBowerModuleJSON = lib.readBowerModuleJson(modulePath);
  const dependencyShorthand: IPackageShorthand = { version: bowerModuleJson._release };

  for (let dependency in bowerModuleJson.dependencies) {
    dependencyShorthand[dependency] = resolveBowerModule(path.join(modulePath, "..", dependency));
  }

  return dependencyShorthand;
}

interface IPackageShorthand {
  readonly version: string;
  readonly dependencies?: IDependencyGraph;
}

interface IDependencyGraph {
  [dependencyName: string]: IPackageShorthand;
}
