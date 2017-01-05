/**
 * Dependencies
 */
import * as fs from "fs-extra";
import * as path from "path";
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
