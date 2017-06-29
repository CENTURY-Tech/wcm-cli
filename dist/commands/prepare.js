"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const logger_1 = require("../utilities/logger");
const filesystem_1 = require("../utilities/filesystem");
function exec(projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const dependenciesPath = path.join(projectPath, "bower_components");
        const outputPath = path.join(projectPath, "web_components");
        const processedPaths = [];
        for (const dependency of yield filesystem_1.readDir(dependenciesPath)) {
            const bowerJson = yield filesystem_1.readBowerModuleJson(path.join(dependenciesPath, dependency));
            const sourceDirectory = path.join(dependenciesPath, dependency);
            const outputDirectory = path.join(outputPath, dependency, bowerJson._release);
            if (!bowerJson.main) {
                logger_1.warn("'%s' has not declared an entry file, skipping", dependency);
                continue;
            }
            for (const entryPath of typeof bowerJson.main === "string" ? [bowerJson.main] : bowerJson.main) {
                if (!fs.existsSync(path.join(sourceDirectory, entryPath))) {
                    logger_1.warn("'%s' has an entry file '%s' that does not exist, skipping", dependency, entryPath);
                    continue;
                }
                yield processFile(path.resolve(sourceDirectory), path.resolve(outputDirectory), entryPath, processedPaths);
            }
        }
    });
}
exports.exec = exec;
function processFile(sourceDir, outputDir, entryPath, processedPaths) {
    return __awaiter(this, void 0, void 0, function* () {
        if (processedPaths.includes(path.resolve(sourceDir, entryPath))) {
            return Promise.resolve();
        }
        else {
            processedPaths.push(path.resolve(sourceDir, entryPath));
        }
        if (path.extname(entryPath) === ".html") {
            yield filesystem_1.ensureDirectoryExists(path.dirname(path.join(outputDir, entryPath)));
            return new Promise((resolve) => {
                const input = fs.createReadStream(path.join(sourceDir, entryPath));
                const output = fs.createWriteStream(path.join(outputDir, entryPath));
                const subfiles = [];
                let inScript = 0;
                let inComment = 0;
                let lineNumber = 0;
                readline.createInterface({ input })
                    .on("line", (line) => __awaiter(this, void 0, void 0, function* () {
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
                            console.log(href);
                            if (!path.resolve(path.dirname(path.join(sourceDir, entryPath)), href).includes(sourceDir)) {
                                try {
                                    line = `<wcm-link type="${/rel="([A-z]*)"/.exec(line)[1]}" for="${dependency}" lookup="${lookup}"></wcm-link>`;
                                }
                                catch (err) {
                                    logger_1.warn("'%s' has no rel attribute in file '%s' at line %s, skipping", input.path, entryPath, lineNumber);
                                }
                            }
                            else if (!/http(s)?:\/\//.test(href)) {
                                subfiles.push(href);
                            }
                        }
                        else if (/<script src="([^"]*)"><\/script>/.test(line)) {
                            const [, src] = /src="([^"]*)"/.exec(line);
                            const { dependency, lookup } = getMetadata(src);
                            if (!path.resolve(path.dirname(path.join(sourceDir, entryPath)), src).includes(sourceDir)) {
                                line = `<wcm-link type="script" for="${dependency}" lookup="${lookup}"></wcm-link>`;
                            }
                            else if (!/http(s)?:\/\//.test(src)) {
                                subfiles.push(src);
                            }
                        }
                    }
                    output.write(`${line}\n`);
                }))
                    .on("close", () => __awaiter(this, void 0, void 0, function* () {
                    for (const href of subfiles) {
                        yield processFile(sourceDir, outputDir, path.join(path.dirname(entryPath), href), processedPaths);
                    }
                    resolve();
                }));
            });
        }
        else {
            return filesystem_1.copy(path.join(sourceDir, entryPath), path.join(outputDir, entryPath));
        }
    });
}
function getHref(tag) {
    return /(href|src)="(.*)"/.exec(tag)[2];
}
function getMetadata(href) {
    const [, dependency, lookup] = /\.\.\/([^./]*)\/(.*)/.exec(href);
    return { dependency, lookup };
}
