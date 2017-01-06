/**
 * Dependencies
 */
import * as fs from "fs-extra";
import * as path from "path";
import * as bowerJSON from "gist-bower-json";
import { fileNotFound, upstreamDependencyFailure } from "./errors";

/**
 * Read the file at the supplied path asynchronously and throw an error if the file cannot be found.
 */
export function readFile(fullPath: string): Promise<string> {
  "use strict";

  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return new Promise((resolve): void => {
    void fs.readFile(fullPath, "utf8", (err: Error, data: string): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve(data);
    });
  });
}

/**
 * Read the file at the supplied path synchronously and throw an error if the file cannot be found.
 */
export function readFileSync(fullPath: string): string {
  "use strict";

  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return fs.readFileSync(fullPath, "utf8");
}

/**
 * Remove the directory at the path specified.
 */
export async function removeDirectory(directoryPath: string): Promise<void> {
  "use strict";

  await new Promise((resolve): void => {
    void fs.remove(directoryPath, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
export function readFileAsJsonSync<T extends Object>(fullPath: string): T {
  "use strict";

  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return fs.readJsonSync(fullPath);
}

/**
 * Write the supplied JSON to a new file at the path provided.
 */
export async function writeJsonToFile(fullPath: string, json: Object): Promise<void> {
  "use strict";

  await new Promise((resolve): void => {
    void fs.writeJson(fullPath, json, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

/**
 * Read and parse the bower JSON file at the supplied path.
 */
export function readBowerJsonSync(projectPath: string): bowerJSON.IBowerJSON {
  "use strict";

  return readFileAsJsonSync<bowerJSON.IBowerJSON>(path.resolve(projectPath, "bower.json"));
}

/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
export function readBowerModuleJsonSync(modulePath: string): bowerJSON.IBowerModuleJSON {
  "use strict";

  return readFileAsJsonSync<bowerJSON.IBowerModuleJSON>(path.resolve(modulePath, ".bower.json"));
}

/**
 * Copy the module from the path supplied to the destination path supplied and throw an error if an issue is
 * encountered.
 */
export async function copyModule(dependencyPath: string, destinationPath: string): Promise<void> {
  "use strict";

  await new Promise((resolve): void => {
    void fs.copy(dependencyPath, destinationPath, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

export function* walkDirectory(directoryPath: string): IterableIterator<{fullPath: string, contents: string }> {
  "use strict";

  for (let filePath of fs["walkSync"](directoryPath)) {
    yield {
      fullPath: filePath,
      contents: readFileSync(filePath)
    };
  }
}
