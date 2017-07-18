import * as fs from "fs-extra";
import * as bowerJSON from "gist-bower-json";
import * as path from "path";
import { compose, init, join, split } from "ramda";
import { directoryNotFound, fileNotFound, upstreamDependencyFailure } from "./errors";

/**
 * Read the file at the supplied path asynchronously and throw an error if the file cannot be found.
 */
export function readFile(fullPath: string): Promise<string> {
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

export function readDir(dirPath: string): Promise<string[]> {
  if (!fs.existsSync(dirPath)) {
    directoryNotFound(dirPath).exit();
  }

  return new Promise((resolve): void => {
    void fs.readdir(dirPath, (err: Error, files: string[]): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve(files);
    });
  });
}

/**
 * Read the file at the supplied path synchronously and throw an error if the file cannot be found.
 */
export function readFileSync(fullPath: string): string {
  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return fs.readFileSync(fullPath, "utf8");
}

/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
export function readFileAsJson<T extends object>(fullPath: string): Promise<T> {
  return readFile(path.resolve(fullPath)).then(JSON.parse);
}

/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
export function readFileAsJsonSync<T extends object>(fullPath: string): T {
  if (!fs.existsSync(fullPath)) {
    fileNotFound(fullPath).exit();
  }

  return fs.readJsonSync(fullPath);
}

export async function writeToFile(fullPath: string, data: string): Promise<void> {
  await ensureDirectoryExists(getPathParent(fullPath));

  return new Promise<void>((resolve): void => {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    void fs.writeFile(fullPath, data, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

/**
 * Write the supplied JSON to a new file at the path provided.
 */
export function writeJsonToFile(fullPath: string, json: object): Promise<void> {
  return writeToFile(fullPath, JSON.stringify(json, null, 2));
}

/**
 * Read and parse the bower JSON file at the supplied path.
 */
export function readBowerJsonSync(projectPath: string): bowerJSON.IBowerJSON {
  return readFileAsJsonSync<bowerJSON.IBowerJSON>(path.resolve(projectPath, "bower.json"));
}

/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
export function readBowerModuleJson(modulePath: string): Promise<bowerJSON.IBowerModuleJSON> {
  return readFileAsJson(path.resolve(modulePath, ".bower.json"));
}

/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
export function readBowerModuleJsonSync(modulePath: string): bowerJSON.IBowerModuleJSON {
  return readFileAsJsonSync<bowerJSON.IBowerModuleJSON>(path.resolve(modulePath, ".bower.json"));
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  return new Promise<void>((resolve): void => {
    fs.mkdirp(dirPath, (err) => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

/**
 * Copy the directory from the path supplied to the destination path supplied and throw an error if an issue is
 * encountered.
 */
export function copy(sourcePath: string, outputPath: string): Promise<void> {
  return new Promise<void>((resolve): void => {
    void fs.copy(sourcePath, outputPath, (err: Error): void => {
      if (err) {
        upstreamDependencyFailure("fs-extra", err).exit();
      }

      void resolve();
    });
  });
}

function getPathParent(pathname: string): string {
  return compose<string, string[], string[], string>(
    join(path.sep),
    init,
    split(path.sep),
  )(pathname);
}
