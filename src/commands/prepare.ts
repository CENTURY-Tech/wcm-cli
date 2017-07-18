/**
 * Dependencies
 */
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as readline from "readline";
import { compose, defaultTo, isNil, reject } from "ramda";
import { fileNotFound } from "../utilities/errors";
import { copy, ensureDirectoryExists, readBowerModuleJson, readDir, readFile, readFileAsJson, writeToFile } from "../utilities/filesystem";
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
  const processedPaths = [];

  for (const entryPath of typeof wcmConfig.main === "string" ? [wcmConfig.main] : wcmConfig.main) {
    for (const filePath of glob.sync(path.join(rootDir, entryPath))) {
      await processFile(rootDir, outDir, path.relative(rootDir, filePath), processedPaths).catch(() => console.log("oh dear"))
    }
  }

  const sourcePath = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
  const dependenciesPath = path.resolve(projectPath, resolvePackageManagerDirectory(wcmConfig.packageManager));
  const outputPath = path.resolve(projectPath, "web_components");

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
    return
  } else {
    processedPaths.push(path.resolve(sourceDir, filePath));
  }

  if (!fs.existsSync(path.join(sourceDir, filePath))) {
    return fileNotFound(path.join(sourceDir, filePath)).handled();
  }

  await ensureDirectoryExists(path.dirname(path.join(outputDir, filePath)));

  switch (path.extname(filePath)) {
    case ".html":
      return readFile(path.join(sourceDir, filePath))
        .then((content: string): Promise<void> => {
          const $ = cheerio.load(content);

          return Promise.all([
            Promise.all($("link").toArray().map((link: CheerioElement) => processLinkElem($, link))),
            Promise.all($("script").toArray().map((script: CheerioElement) => processScriptElem($, script)))
              .then(compose(reject(isNil), defaultTo([])))
              .then((scripts: string[]): Promise<void> => {
                if (scripts.length) {
                  const jsFileName = filePath.replace(".html", ".js");

                  $.root()
                    .append($("<wcm-script></wcm-script>")
                      .attr("path", jsFileName));

                  return writeToFile(path.join(outputDir, jsFileName), scripts.join(""));
                }
              })
          ])
            .then(() => {
              return writeToFile(path.join(outputDir, filePath), $.html());
            })
        });

    case ".js":
      const htmlFileName = path.join(outputDir, filePath.replace(".js", ".html"));

      if (!fs.existsSync(htmlFileName)) {
        await writeToFile(htmlFileName, `<wcm-script path="${filePath}"></wcm-script>`);
      }

    default:
      return copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
  }

  function processLinkElem($: CheerioStatic, link: CheerioElement): Promise<void> {
    if (isRelative(sourceDir, filePath, link.attribs.href)) {
      return processFile(sourceDir, outputDir, path.join(path.dirname(filePath), link.attribs.href), processedPaths);
    } else {
      $(link)
        .replaceWith($("<wcm-link></wcm-link>")
          .attr("rel", link.attribs.rel)
          .attr("for", getDependencyName(link.attribs.href))
          .attr("path", getDependencyLookup(link.attribs.href))
        );
    }
  }

  function processScriptElem($: CheerioStatic, script: CheerioElement): string | void {
    if (script.childNodes && script.childNodes.length) {
      $(script).remove();
      return script.childNodes[0]["data"]
    } else if (!isHttp(script.attribs.src)) {
      if (isRelative(sourceDir, filePath, script.attribs.src)) {
        $(script)
          .replaceWith($("<wcm-script></wcm-script>")
            .attr("path", script.attribs.src))
      } else {
        $(script)
          .replaceWith($("<wcm-script></wcm-script>")
            .attr("for", getDependencyName(script.attribs.src))
            .attr("path", getDependencyLookup(script.attribs.src)))
      }
    }
  }

}

function isRelative(sourcePath: string, relPathA: string, relPathB: string): boolean {
  try {
    return path.resolve(path.dirname(path.join(sourcePath, relPathA)), relPathB).includes(sourcePath + path.sep);
  } catch (err) {
    warn("Unable to determine relitivity from '%s' between '%s' and '%s'", sourcePath, relPathA, relPathB);
  }
}

function isHttp(src): boolean {
  return /http(s)?:\/\//.test(src)
}

function getHref(tag: string): string {
  return /(href|src)="(.*)"/.exec(tag)[2];
}

function resolvePackageManagerDirectory(packageManager: PackageManager): string {
  return {
    bower: "bower_components",
    npm: "node_modules",
  }[packageManager];
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
