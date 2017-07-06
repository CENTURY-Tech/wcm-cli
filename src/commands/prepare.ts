/**
 * Dependencies
 */
import { Writable } from "stream";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { fileNotFound } from "../utilities/errors";
import { warn } from "../utilities/logger";
import { copy, ensureDirectoryExists, readBowerModuleJson, readDir, readFileAsJson, writeToFile } from "../utilities/filesystem";

interface WCMConfig {
  main: string;
  version: string;
  componentOptions: {
    rootDir: string;
    outDir: string;
  };
  packageManager: PackageManager;
}

type PackageManager = "bower" | "npm"

export async function exec(projectPath: string, optimise: boolean): Promise<any> {
  const wcmConfig = await readFileAsJson<WCMConfig>(path.resolve(projectPath, "wcm.json"));
  const rootDir = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
  const outDir = path.resolve(projectPath, wcmConfig.componentOptions.outDir);

  await processFile(rootDir, outDir, wcmConfig.main, []);

  const sourcePath = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
  const dependenciesPath = path.resolve(projectPath, resolvePackageManagerDirectory(wcmConfig.packageManager));
  const outputPath = path.resolve(projectPath, "web_components");

  const processedPaths = []

  for (const dependency of await readDir(dependenciesPath)) {
    const sourceDirectory = path.join(dependenciesPath, dependency);

    if (!fs.statSync(sourceDirectory).isDirectory()) {
      continue;
    }

    const bowerJson = await readBowerModuleJson(path.join(dependenciesPath, dependency));
    const outputDirectory = path.join(outputPath, dependency, bowerJson._release);

    if (optimise) {
      if (!bowerJson.main) {
        warn("'%s' has not declared an entry file, skipping optimisation", dependency);
        await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
        continue;
      }

      for (const entryPath of typeof bowerJson.main === "string" ? [bowerJson.main] : bowerJson.main) {
        if (!fs.existsSync(path.join(sourceDirectory, entryPath))) {
          warn("'%s' has an entry file '%s' that does not exist, skipping optimisation", dependency, entryPath);

          await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
          break;
        }

        await processFile(path.resolve(sourceDirectory), path.resolve(outputDirectory), entryPath, processedPaths);
      }
    } else {
      await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
    }
  }
}

async function processDir(sourceDir: string, outputDir: string, dirPath: string, processedPaths: string[]): Promise<void> {
  const files = fs.readdirSync(path.join(sourceDir, dirPath));

  files.forEach(async (file) => {
    if (fs.statSync(path.join(sourceDir, dirPath, file)).isDirectory()) {
      await processDir(sourceDir, outputDir, path.join(dirPath, file), processedPaths);
    } else {
      await processFile(path.resolve(sourceDir), path.resolve(outputDir), path.join(dirPath, file), processedPaths);
    }
  });
}

async function processFile(sourceDir: string, outputDir: string, filePath: string, processedPaths: string[]): Promise<void> {
  if (processedPaths.includes(path.resolve(sourceDir, filePath))) {
    return Promise.resolve();
  } else {
    processedPaths.push(path.resolve(sourceDir, filePath));
  }

  if (!fs.existsSync(path.join(sourceDir, filePath))) {
    return fileNotFound(path.join(sourceDir, filePath)).handled();
  }

  await ensureDirectoryExists(path.dirname(path.join(outputDir, filePath)));

  switch (path.extname(filePath)) {
    case ".html":
      return new Promise<void>((resolve): void => {
        const input = fs.createReadStream(path.join(sourceDir, filePath));
        const output = fs.createWriteStream(path.join(outputDir, filePath));
        const subfiles = [];

        let inScript = 0;
        let inComment = 0;
        let lineNumber = 0;

        readline.createInterface({ input })
          .on("line", async (line: string): Promise<any> => {
            lineNumber++;

            if (!inScript) {
              /<!--/.test(line) && inComment++;
              /-->/.test(line) && inComment--;
            }

            if (!inComment) {
              /<script>?/.test(line) && inScript++;
              /<\/script>/.test(line) && inScript--;
            }

            if (!inScript && !inComment) {
              if (/<link .*>/.test(line)) {
                const [, href] = /href="([^"]*)"/.exec(line);

                if (!/http(s)?:\/\//.test(href) && !path.resolve(path.dirname(path.join(sourceDir, filePath)), href).includes(sourceDir + path.sep)) {
                  try {
                    line = `<wcm-link rel="${/rel="([A-z]*)"/.exec(line)[1]}" for="${getDependencyName(href)}" lookup="${getDependencyLookup(href)}"></wcm-link>`;
                  } catch (err) {
                    warn("'%s' has no rel attribute in file '%s' at line %s, skipping", input.path, filePath, lineNumber);
                  }
                } else {
                  subfiles.push(href);
                }
              } else if (/<script.*src="[^"]*".*><\/script>/.test(line)) {
                const [, src] = /src="([^"]*)"/.exec(line);

                if (!/http(s)?:\/\//.test(src)) {
                  if (!path.resolve(path.dirname(path.join(sourceDir, filePath)), src).includes(sourceDir)) {
                    line = `<wcm-script for="${getDependencyName(src)}" lookup="${getDependencyLookup(src)}"></wcm-script>`;
                  } else {
                    line = `<wcm-script lookup="${src}"></wcm-script>`;
                  }
                }
              }
            }

            output.write(`${line}\n`);
          })
          .on("close", async () => {
            for (const href of subfiles) {
              await processFile(sourceDir, outputDir, path.join(path.dirname(filePath), href), processedPaths);
            }

            resolve();
          });
      });

    case ".js":
      const fileName = path.join(outputDir, filePath.replace(".js", ".html"));
      if (!fs.existsSync(fileName)) {
        await writeToFile(path.join(outputDir, filePath.replace(".js", ".html")), `<wcm-script lookup="${filePath}"></wcm-script>`);
      }

    default:
      return copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
  }

}

function getHref(tag: string): string {
  return /(href|src)="(.*)"/.exec(tag)[2];
}

function resolvePackageManagerDirectory(packageManager: PackageManager): string {
  return ["bower_components", "node_modules"][["bower", "npm"].indexOf(packageManager)]
}

function getDependencyName(url: string): string {
  return /([^./]+)/.exec(url)[0];
}

function getDependencyLookup(url: string): string {
  return /[^./]+\/(.*)/.exec(url)[1];
}
