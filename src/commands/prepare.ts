/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { Writable } from "stream";
import * as stream from "stream";
import { fileNotFound } from "../utilities/errors";
import { copy, ensureDirectoryExists, readBowerModuleJson, readDir, readFileAsJson, writeToFile } from "../utilities/filesystem";
import { warn } from "../utilities/logger";

interface WCMConfig {
  main: string;
  version: string;
  componentOptions: {
    rootDir: string;
    outDir: string;
  };
  packageManager: PackageManager;
}

type PackageManager = "bower" | "npm";

export async function exec(projectPath: string, optimise: boolean): Promise<any> {
  const wcmConfig = await readFileAsJson<WCMConfig>(path.resolve(projectPath, "wcm.json"));
  const rootDir = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
  const outDir = path.resolve(projectPath, wcmConfig.componentOptions.outDir);

  await processFile(rootDir, outDir, wcmConfig.main, []);

  const sourcePath = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
  const dependenciesPath = path.resolve(projectPath, resolvePackageManagerDirectory(wcmConfig.packageManager));
  const outputPath = path.resolve(projectPath, "web_components");

  const processedPaths = [];

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
    if (!sourceDir || !filePath) {
      console.log(sourceDir, filePath);
    }
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

        const inlineJs = [];

        readline.createInterface({ input })
          .on("line", (_line: string): void => {
            lineNumber++;

            (inScript
              ? _line
                .replace(/<\/script>/g, "\n$&")
              : _line
                .replace(/-->|<script>/g, "$&\n"))
              .split("\n")
              .forEach((line) => {
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
                    let href: string;
                    let rel: string;

                    try {
                      [, href] = /href="([^"]*)"/.exec(line);
                      [, rel] = /rel="([A-z]*)"/.exec(line);
                    } catch (err) {
                      warn("Error whilst processing line %s in file %s", lineNumber, path.join(sourceDir, filePath));
                    }

                    if (!/http(s)?:\/\//.test(href)) {
                      if (isRelative(sourceDir, filePath, href)) {
                        subfiles.push(href);
                      } else {
                        line = line.replace(/<link .[^>]*>/, `<wcm-link rel="${rel}" for="${getDependencyName(href)}" path="${getDependencyLookup(href)}"></wcm-link>`);
                      }
                    }
                  } else if (/<script.*src="[^"]*".*><\/script>/.test(line)) {
                    let src: string;

                    try {
                      [, src] = /src="([^"]*)"/.exec(line);
                    } catch (err) {
                      warn("Error whilst processing line %s in file %s", lineNumber, path.join(sourceDir, filePath));
                    }

                    if (!/http(s)?:\/\//.test(src)) {
                      if (isRelative(sourceDir, filePath, src)) {
                        line = line.replace(/<script.*src="[^"]*".*><\/script>/, `<wcm-script path="${src}"></wcm-script>`);
                      } else {
                        line = line.replace(/<script.*src="[^"]*".*><\/script>/, `<wcm-script for="${getDependencyName(src)}" path="${getDependencyLookup(src)}"></wcm-script>`);
                      }
                    }
                  }
                }

                if (inScript) {
                  !/<script>?/.test(line) && inlineJs.push(line);
                } else {
                  !/^<\/script>/.test(line) && output.write(`${line}\n`);
                }
              });
          })
          .on("close", async () => {
            if (inlineJs.length) {
              const jsOutput = fs.createWriteStream(path.join(outputDir, filePath).replace(".html", ".js"));

              for (const line of inlineJs) {
                jsOutput.write(`${line}\n`);
              }

              output.write(`<wcm-script path="${path.basename(filePath).replace(".html", ".js")}"></wcm-script>\n;`)
            }

            for (const href of subfiles) {
              await processFile(sourceDir, outputDir, path.join(path.dirname(filePath), href), processedPaths);
            }

            resolve();
          });
      });

    case ".js":
      const fileName = path.join(outputDir, filePath.replace(".js", ".html"));
      if (!fs.existsSync(fileName)) {
        await writeToFile(path.join(outputDir, filePath.replace(".js", ".html")), `<wcm-script path="${filePath}"></wcm-script>`);
      }

    default:
      return copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
  }

}

function isRelative(sourcePath: string, relPathA: string, relPathB: string): boolean {
  try {
    return path.resolve(path.dirname(path.join(sourcePath, relPathA)), relPathB).includes(sourcePath + path.sep);
  } catch (err) {
    warn("Unable to determine relitivity from '%s' between '%s' and '%s'", sourcePath, relPathA, relPathB);
  }
}

function getHref(tag: string): string {
  return /(href|src)="(.*)"/.exec(tag)[2];
}

function resolvePackageManagerDirectory(packageManager: PackageManager): string {
  return ["bower_components", "node_modules"][["bower", "npm"].indexOf(packageManager;)]
}

function getDependencyName(url: string): string {
  return /([^./]+)/.exec(url)[0];
}

function getDependencyLookup(url: string): string {
  try {
    return /[^./]+\/(.*)/.exec(url)[1];
  } catch (err) {
    warn("Error whilst retrieving lookup from URL '%s'", url);
  }
}
