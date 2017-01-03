/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as errors from "./errors";

/**
 * Read and parse the package JSON file at the supplied path
 */
export function readPackageJson(projectPath: string): IPackageJSON {
  "use strict";

  return readFileAsJson<IPackageJSON>(path.resolve(projectPath, "package.json"));
}

/**
 * Read and parse the bower JSON file at the supplied path
 */
export function readBowerJson(projectPath: string): IBowerJSON {
  "use strict";

  return readFileAsJson<IBowerJSON>(path.resolve(projectPath, "bower.json"));
}

export function readBowerModuleJson(modulePath: string): IBowerModuleJSON {
  "use strict";

  return readFileAsJson<IBowerModuleJSON>(path.resolve(modulePath, ".bower.json"));
}

/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found
 */
export function readFileAsJson<T extends Object>(fullPath: string): T {
  "use strict";

  if (!fs.existsSync(fullPath)) {
    errors.fileNotFound(fullPath).exit();
  }

  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

export interface IPackageJSON extends Object {

  readonly name: string;

  readonly version?: string;

  readonly description?: string;

  readonly keywords?: string[];

  readonly homepage?: string;

  readonly bugs?: string|IBugs;

  readonly license?: string;

  readonly author?: string|IAuthor;

  readonly contributors?: string[]|IAuthor[];

  readonly files?: string[];

  readonly main?: string;

  readonly bin?: string|IBinMap;

  readonly man?: string|string[];

  readonly directories?: IDirectories;

  readonly repository?: string|IRepository;

  readonly scripts?: IScriptsMap;

  readonly config?: IConfig;

  readonly dependencies?: IDependencyMap;

  readonly devDependencies?: IDependencyMap;

  readonly peerDependencies?: IDependencyMap;

  readonly optionalDependencies?: IDependencyMap;

  readonly bundledDependencies?: string[];

  readonly engines?: IEngines;

  readonly os?: string[];

  readonly cpu?: string[];

  readonly preferGlobal?: boolean;

  readonly private?: boolean;

  readonly publishConfig?: IPublishConfig;

}

export interface IBowerJSON extends Object {

  /**
   * The name of the package as stored in the registry
   */
  readonly name: string;

  /**
   * A description of the package limited to 140 characters
   */
  readonly description?: string;

  /**
   * The entry-point files necessary to use your package
   */
  readonly main?: string|string[];

  /**
   * The type of module defined in the main JavaScript file
   */
  readonly moduleType?: BowerModuleType|BowerModuleType[];

  /**
   * SPDX license identifier or path/url to a license
   */
  readonly license?: string|string[];

  /**
   * A list of files for Bower to ignore when installing your package
   */
  readonly ignore?: string[];

  /**
   * Helps make your package easier to discover without people needing to know its name
   */
  readonly keywords?: string[];

  /**
   * A list of people that authored the contents of the package
   */
  readonly authors?: string[]|IAuthor[];

  /**
   * URL to learn more about the package
   */
  readonly homepage?: string;

  /**
   * The repository in which the source code can be found
   */
  readonly repository?: IRepository;

  /**
   * Dependencies are specified with a simple hash of package name to a semver compatible identifier or URL
   */
  readonly dependencies?: IDependencyMap;

  /**
   * Dependencies that are only needed for development of the package, e.g., test framework or building documentation
   */
  readonly devDependencies?: IDependencyMap;

  /**
   * Dependency versions to automatically resolve with if conflicts occur between packages
   */
  readonly resolutions?: IDependencyMap;

  /**
   * If set to true, Bower will refuse to publish it
   */
  readonly private?: boolean;

}

export interface IBowerModuleJSON extends IBowerJSON {
  readonly _release: string;
}

enum BowerModuleType {
  "globals",
  "amd",
  "node",
  "es6",
  "yui"
}

/**
 * An author or contributor
 */
interface IAuthor {
  name: string;
  email?: string;
  homepage?: string;
}

/**
 * A map of exposed bin commands
 */
interface IBinMap {
  [commandName: string]: string;
}

/**
 * A bugs link
 */
interface IBugs {
  email: string;
  url: string;
}

interface IConfig {
  name?: string;
  config?: Object;
}

/**
 * A map of dependencies
 */
export interface IDependencyMap {
  [dependencyName: string]: string;
}

/**
 * CommonJS package structure
 */
interface IDirectories {
  lib?: string;
  bin?: string;
  man?: string;
  doc?: string;
  example?: string;
}

interface IEngines {
  node?: string;
  npm?: string;
}

interface IPublishConfig {
  registry?: string;
}

/**
 * A project repository
 */
interface IRepository {
  type: string;
  url: string;
}

interface IScriptsMap {
  [scriptName: string]: string;
}
