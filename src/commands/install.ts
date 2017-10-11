import { resolve } from "path";
import { getDependencyManagement, PackageManager } from "../utilities/config";
import { fileExists, isDirectory, readBowerModuleJson, readDir, removeDirectory } from "../utilities/filesystem";
import { warn } from "../utilities/logger";
import { processDir, processFile } from "./prepare";

export async function exec(): Promise<void> {
  const { packageManager, optimise } = getDependencyManagement();

  for (const dependencyName of await readDir(PackageManager[packageManager])) {
    const dependencyPath = resolve(PackageManager[packageManager], dependencyName);

    if (await isDirectory(dependencyPath)) {
      switch (PackageManager[packageManager]) {
        case PackageManager.bower:
          const { main, _release } = await readBowerModuleJson(dependencyPath);

          const sourcePath = resolve(PackageManager[packageManager], dependencyName);
          const outputPath = resolve("web_components", dependencyName, _release);

          if (optimise) {
            await prepareOptimisedAssets(ensureArray(main), sourcePath, outputPath);
          } else {
            await prepareAssets(sourcePath, outputPath);
          }

          break;

        case PackageManager.npm:
        /**
         * @todo Support installs from "node_modules"
         */

      }
    }
  }
}

function prepareAssets(sourcePath: string, outputPath: string): Promise<void> {
  return processDir(sourcePath, outputPath, "", []);
}

async function prepareOptimisedAssets(entryPaths: string[], sourcePath: string, outputPath: string): Promise<void> {
  await removeDirectory(outputPath);

  if (!entryPaths.length) {
    warn("No entry file declared for '%s', skipping optimisation", sourcePath);

    return prepareAssets(sourcePath, outputPath);
  }

  const processedPaths: string[] = [];

  for (const entryPath of entryPaths) {
    if (fileExists(resolve(sourcePath, entryPath))) {
      await processFile(sourcePath, outputPath, entryPath, processedPaths);
    } else {
      warn("One of the entry files for '%s' was not found, skipping optimisation", sourcePath);

      return prepareAssets(sourcePath, outputPath);
    }
  }
}

function ensureArray<T>(val: T[] | T): T[] {
  return typeof val === "object" && val.constructor === Array
    ? val as T[]
    : [val as T];
}
