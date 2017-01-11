/**
 * Dependencies
 */
import * as path from "path";
import * as bowerJSON from "gist-bower-json";
import { thread, IThreadLogger, progress } from "./logger";
import { readFileSync, readBowerJsonSync, readBowerModuleJsonSync, removeDirectory, copyModule, walkDirectory } from "./filesystem";

interface IDependencyShorthand {
  readonly name: string;
  readonly path: string;
  readonly version: string;
  readonly dependencies: string[];
  references: number;
}

interface IDependencyGraph {
  readonly dependencies: {
    [dependencyName: string]: IDependencyShorthand
  };
}

/**
 * A reduced cross-compatible definition for a project dependency.
 */
export class DependencyShorthand implements IDependencyShorthand {

  public readonly name: string;
  public readonly path: string;
  public readonly version: string;
  public readonly dependencies: string[];
  references: number = 0;

  constructor(moduleJson: bowerJSON.IBowerModuleJSON, modulePath: string) {
    Object.assign(this, {
      name: moduleJson.name,
      path: modulePath,
      version: moduleJson._release,
      dependencies: moduleJson.dependencies ? Object.keys(moduleJson.dependencies) : []
    });
  }

}

export class DependencyGraph implements IDependencyGraph {

  readonly dependencies: {
    [dependencyName: string]: IDependencyShorthand
  } = {};

  /**
   * Add a dependency to the dependency graph.
   */
  public addDependency(dependency: IDependencyShorthand): void {
    "use strict";

    this.dependencies[dependency.name.toLowerCase()] = dependency;
  }

  /**
   * Check to see whether or not a dependency with the supplied name is currently held within this instance of the
   * dependency graph.
   */
  public hasDependency(dependencyName: string): boolean {
    "use strict";

    return this.dependencies[dependencyName] !== undefined;
  }

  /**
   * Copy the modules currently held within this instance of the dependency graph to the output destination supplied.
   * Please note that this function will also clear the contents of the output destination prior to performing this
   * task.
   */
  public async copyModules(outDestination: string): Promise<void> {
    "use strict";

    await removeDirectory(outDestination);

    await progress.ArrayTracker.from(Object.values(this.dependencies))
      .trackForEachAsync("Copying modules", (dependency: IDependencyShorthand): Promise<void> => {
        return copyModule(dependency.path, path.join(outDestination, dependency.name, dependency.version));
      });
  }

  public markReference(moduleName): void {
    this.dependencies[moduleName].references++;
  }

  /**
   * Convert this verbose dependency graph into a human readable dependency graph.
   */
  public toReadable(): Object {
    "use strict";

    const dependencyGraphReadable: Object = {
      graph: {},
      shrinkwrap: {}
    };

    Object.values(this.dependencies)
      .sort((a: IDependencyShorthand, b: IDependencyShorthand): number => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      })
      .forEach((dependency: IDependencyShorthand): void => {
        dependencyGraphReadable["graph"][dependency.name] = dependency.dependencies
          .map((childDependency: string): string => {
            if (!this.dependencies[childDependency.toLowerCase()]) {
              throw `Missing dependency with the name ${childDependency} for ${dependency.name}`;
            }

            return this.dependencies[childDependency.toLowerCase()].name;
          })
          .sort((a: string, b: string): number => {
            return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
          });

        dependencyGraphReadable["shrinkwrap"][dependency.name] = dependency.version;
      });

    return dependencyGraphReadable;
  }

}

export namespace htmlImports {

  /**
   * Recursively resolve all relative HTML imports
   */
  export function resolveHtmlImports(sourcePath: string): DependencyGraph {
    "use strict";

    const dependencyGraph: DependencyGraph = new DependencyGraph();

    for (let file of walkDirectory(sourcePath)) {
      console.log(file);
    }

    return dependencyGraph;
  }

  function* traverseImports(sourceFile: string, dependencyGraph: DependencyGraph): IterableIterator<DependencyShorthand> {
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

}

/**
 * A set of functions to resolve and copy module dependencies.
 */
export namespace moduleDependencies {

  /**
   * Recursilvely traverse a projects declared dependencies, and
   */
  export function resolveProjectDependencies(projectPath: string): DependencyGraph {
    "use strict";

    const logger: IThreadLogger = thread("Traversing module dependencies");
    const bowerJson: bowerJSON.IBowerJSON = readBowerJsonSync(projectPath);
    const dependencyGraph: DependencyGraph = new DependencyGraph();

    for (let dependency in bowerJson.dependencies) {
      const modulePath: string = path.join(projectPath, "bower_components", dependency);
      const iterator: IterableIterator<DependencyShorthand> = traverseModule(modulePath, dependencyGraph);

      logger.log("Inspecting \"%s\"", dependency);

      for (let dependency of iterator) {
        logger.info("New dependency found with the name \"%s\"", dependency.name);

        dependencyGraph.addDependency(dependency);
      }
    }

    return dependencyGraph;
  }

  /**
   * Recursively traverse a modules declared dependencies. This method will inspect the module / release Bower file in
   * each dependency that it encouters and shall return a Dependency graph when complete.
   */
  export function resolveModuleDependencies(modulePath: string): DependencyGraph {
    "use strict";

    const dependencyGraph: DependencyGraph = new DependencyGraph();

    for (let dependency of traverseModule(modulePath, dependencyGraph)) {
      dependencyGraph.addDependency(dependency);
    }

    return dependencyGraph;
  }

  /**
   * A private method that will recursively inspect the module and its dependencies at the module path supplied.
   */
  function* traverseModule(modulePath: string, dependencyGraph: DependencyGraph): IterableIterator<DependencyShorthand> {
    "use strict";

    const moduleJson: bowerJSON.IBowerModuleJSON = readBowerModuleJsonSync(modulePath);

    yield new DependencyShorthand(moduleJson, modulePath);

    for (let dependency in moduleJson.dependencies) {
      if (!dependencyGraph.hasDependency(dependency)) {
        yield* traverseModule(path.join(modulePath, "..", dependency), dependencyGraph);
      } else {
        dependencyGraph.markReference(moduleJson.name);
      }
    }
  }

}
