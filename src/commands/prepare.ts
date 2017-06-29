/**
 * Dependencies
 */
import { Writable } from "stream";
import * as fs from "fs";
import * as readline from "readline";
import * as cheerio from "cheerio";
import * as path from "path";
import { warn } from "../utilities/logger";
import { copy, ensureDirectoryExists, readBowerModuleJson, readDir } from "../utilities/filesystem";

export async function exec(projectPath: string): Promise<any> {
  const dependenciesPath = path.join(projectPath, "bower_components");
  const outputPath = path.join(projectPath, "web_components");

  const processedPaths = []

  for (const dependency of await readDir(dependenciesPath)) {
    const bowerJson = await readBowerModuleJson(path.join(dependenciesPath, dependency));
    const sourceDirectory = path.join(dependenciesPath, dependency);
    const outputDirectory = path.join(outputPath, dependency, bowerJson._release);

    if (!bowerJson.main) {
      warn("'%s' has not declared an entry file, skipping", dependency);
      continue;
    }

    for (const entryPath of typeof bowerJson.main === "string" ? [bowerJson.main] : bowerJson.main) {
      if (!fs.existsSync(path.join(sourceDirectory, entryPath))) {
        warn("'%s' has an entry file '%s' that does not exist, skipping", dependency, entryPath)
        continue;
      }

      await processFile(path.resolve(sourceDirectory), path.resolve(outputDirectory), entryPath, processedPaths);
    }
  }
}

async function processFile(sourceDir: string, outputDir: string, entryPath: string, processedPaths: string[]): Promise<void> {
  if (processedPaths.includes(path.resolve(sourceDir, entryPath))) {
    return Promise.resolve();
  } else {
    processedPaths.push(path.resolve(sourceDir, entryPath));
  }

  if (path.extname(entryPath) === ".html") {
    await ensureDirectoryExists(path.dirname(path.join(outputDir, entryPath)));

    return new Promise<void>((resolve): void => {
      const input = fs.createReadStream(path.join(sourceDir, entryPath));
      const output = fs.createWriteStream(path.join(outputDir, entryPath));
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
            /<script>/.test(line) && inScript++;
            /<\/script>/.test(line) && inScript--;
          }

          if (!inScript && !inComment) {
            if (/<link .*>/.test(line)) {
              const [, href] = /href="([^"]*)"/.exec(line);
              const { dependency, lookup } = getMetadata(href);

              console.log(href)

              if (!path.resolve(path.dirname(path.join(sourceDir, entryPath)), href).includes(sourceDir)) {
                try {
                  line = `<wcm-link type="${/rel="([A-z]*)"/.exec(line)[1]}" for="${dependency}" lookup="${lookup}"></wcm-link>`;
                } catch (err) {
                  warn("'%s' has no rel attribute in file '%s' at line %s, skipping", input.path, entryPath, lineNumber);
                }
              } else if (!/http(s)?:\/\//.test(href)) {
                subfiles.push(href);
              }
            } else if (/<script src="([^"]*)"><\/script>/.test(line)) {
              const [, src] = /src="([^"]*)"/.exec(line);
              const { dependency, lookup } = getMetadata(src);

              if (!path.resolve(path.dirname(path.join(sourceDir, entryPath)), src).includes(sourceDir)) {
                line = `<wcm-link type="script" for="${dependency}" lookup="${lookup}"></wcm-link>`;
              } else if (!/http(s)?:\/\//.test(src)) {
                subfiles.push(src);
              }
            }
          }

          output.write(`${line}\n`);
        })
        .on("close", async () => {
          for (const href of subfiles) {
            await processFile(sourceDir, outputDir, path.join(path.dirname(entryPath), href), processedPaths)
          }

          resolve();
        });
    });
  } else {
    return copy(path.join(sourceDir, entryPath), path.join(outputDir, entryPath));
  }

}


function getHref(tag: string): string {
  return /(href|src)="(.*)"/.exec(tag)[2];
}

function getMetadata(href: string): { dependency: string; lookup: string; } {
  const [, dependency, lookup] = /\.\.\/([^./]*)\/(.*)/.exec(href);
  return { dependency, lookup }
}
