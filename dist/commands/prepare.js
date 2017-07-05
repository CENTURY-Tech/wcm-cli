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
const errors_1 = require("../utilities/errors");
const logger_1 = require("../utilities/logger");
const filesystem_1 = require("../utilities/filesystem");
function exec(projectPath, optimise) {
    return __awaiter(this, void 0, void 0, function* () {
        const wcmConfig = yield filesystem_1.readFileAsJson(path.resolve(projectPath, "wcm.json"));
        const rootDir = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
        const outDir = path.resolve(projectPath, wcmConfig.componentOptions.outDir);
        yield processFile(rootDir, outDir, wcmConfig.main, []);
        const sourcePath = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
        const dependenciesPath = path.resolve(projectPath, resolvePackageManagerDirectory(wcmConfig.packageManager));
        const outputPath = path.resolve(projectPath, "web_components");
        const processedPaths = [];
        for (const dependency of yield filesystem_1.readDir(dependenciesPath)) {
            const sourceDirectory = path.join(dependenciesPath, dependency);
            if (!fs.statSync(sourceDirectory).isDirectory()) {
                continue;
            }
            const bowerJson = yield filesystem_1.readBowerModuleJson(path.join(dependenciesPath, dependency));
            const outputDirectory = path.join(outputPath, dependency, bowerJson._release);
            if (optimise) {
                if (!bowerJson.main) {
                    logger_1.warn("'%s' has not declared an entry file, skipping optimisation", dependency);
                    yield processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
                    continue;
                }
                for (const entryPath of typeof bowerJson.main === "string" ? [bowerJson.main] : bowerJson.main) {
                    if (!fs.existsSync(path.join(sourceDirectory, entryPath))) {
                        logger_1.warn("'%s' has an entry file '%s' that does not exist, skipping optimisation", dependency, entryPath);
                        yield processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
                        break;
                    }
                    yield processFile(path.resolve(sourceDirectory), path.resolve(outputDirectory), entryPath, processedPaths);
                }
            }
            else {
                yield processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
            }
        }
    });
}
exports.exec = exec;
function processDir(sourceDir, outputDir, dirPath, processedPaths) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs.readdirSync(path.join(sourceDir, dirPath));
        files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
            if (fs.statSync(path.join(sourceDir, dirPath, file)).isDirectory()) {
                yield processDir(sourceDir, outputDir, path.join(dirPath, file), processedPaths);
            }
            else {
                yield processFile(path.resolve(sourceDir), path.resolve(outputDir), path.join(dirPath, file), processedPaths);
            }
        }));
    });
}
function processFile(sourceDir, outputDir, filePath, processedPaths) {
    return __awaiter(this, void 0, void 0, function* () {
        if (processedPaths.includes(path.resolve(sourceDir, filePath))) {
            return Promise.resolve();
        }
        else {
            processedPaths.push(path.resolve(sourceDir, filePath));
        }
        if (!fs.existsSync(path.join(sourceDir, filePath))) {
            return errors_1.fileNotFound(path.join(sourceDir, filePath)).handled();
        }
        yield filesystem_1.ensureDirectoryExists(path.dirname(path.join(outputDir, filePath)));
        switch (path.extname(filePath)) {
            case ".html":
                return new Promise((resolve) => {
                    const input = fs.createReadStream(path.join(sourceDir, filePath));
                    const output = fs.createWriteStream(path.join(outputDir, filePath));
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
                            /<script>?/.test(line) && inScript++;
                            /<\/script>/.test(line) && inScript--;
                        }
                        if (!inScript && !inComment) {
                            if (/<link .*>/.test(line)) {
                                const [, href] = /href="([^"]*)"/.exec(line);
                                if (!/http(s)?:\/\//.test(href) && !path.resolve(path.dirname(path.join(sourceDir, filePath)), href).includes(sourceDir)) {
                                    try {
                                        line = `<wcm-link rel="${/rel="([A-z]*)"/.exec(line)[1]}" for="${getDependencyName(href)}" lookup="${getDependencyLookup(href)}"></wcm-link>`;
                                    }
                                    catch (err) {
                                        logger_1.warn("'%s' has no rel attribute in file '%s' at line %s, skipping", input.path, filePath, lineNumber);
                                    }
                                }
                                else {
                                    subfiles.push(href);
                                }
                            }
                            else if (/<script.*src="[^"]*".*><\/script>/.test(line)) {
                                const [, src] = /src="([^"]*)"/.exec(line);
                                if (!/http(s)?:\/\//.test(src)) {
                                    if (!path.resolve(path.dirname(path.join(sourceDir, filePath)), src).includes(sourceDir)) {
                                        line = `<wcm-script for="${getDependencyName(src)}" lookup="${getDependencyLookup(src)}"></wcm-script>`;
                                    }
                                    else {
                                        line = `<wcm-script lookup="${src}"></wcm-script>`;
                                    }
                                }
                            }
                        }
                        output.write(`${line}\n`);
                    }))
                        .on("close", () => __awaiter(this, void 0, void 0, function* () {
                        for (const href of subfiles) {
                            yield processFile(sourceDir, outputDir, path.join(path.dirname(filePath), href), processedPaths);
                        }
                        resolve();
                    }));
                });
            case ".js":
                const fileName = path.join(outputDir, filePath.replace(".js", ".html"));
                if (!fs.existsSync(fileName)) {
                    yield filesystem_1.writeToFile(path.join(outputDir, filePath.replace(".js", ".html")), `<wcm-script lookup="${filePath}"></wcm-script>`);
                }
            default:
                return filesystem_1.copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
        }
    });
}
function getHref(tag) {
    return /(href|src)="(.*)"/.exec(tag)[2];
}
function resolvePackageManagerDirectory(packageManager) {
    return ["bower_components", "node_modules"][["bower", "npm"].indexOf(packageManager)];
}
function getDependencyName(url) {
    return /([^./]+)/.exec(url)[0];
}
function getDependencyLookup(url) {
    return /[^./]+\/(.*)/.exec(url)[1];
}
