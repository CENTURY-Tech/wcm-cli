/**
 * Dependencies
 */
import * as fs from "fs-extra";
import * as path from "path";
import { fileNotFound, upstreamDependencyFailure } from "./errors";

/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
export function readFileAsJson<T extends Object>(fullPath: string): T {
  "use strict";

  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

/**
 * Remove the directory at the path specified.
 */
export async function removeDirectory(directoryPath: string): Promise<void> {
  "use strict";

  await new Promise((resolve): void => {
    fs.remove(directoryPath, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

/**
 * Copy the module from the path supplied to the destination path supplied and throw an error if an issue is
 * encountered.
 */
export async function copyModule(dependencyPath: string, destinationPath: string): Promise<void> {
  "use strict";

  await new Promise((resolve): void => {
    fs.copy(dependencyPath, destinationPath, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}
