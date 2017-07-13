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
            if (!sourceDir || !filePath) {
                console.log(sourceDir, filePath);
            }
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
                    const inlineJs = [];
                    readline.createInterface({ input })
                        .on("line", (_line) => {
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
                                    let href;
                                    let rel;
                                    try {
                                        [, href] = /href="([^"]*)"/.exec(line);
                                        [, rel] = /rel="([A-z]*)"/.exec(line);
                                    }
                                    catch (err) {
                                        logger_1.warn("Error whilst processing line %s in file %s", lineNumber, path.join(sourceDir, filePath));
                                    }
                                    if (!/http(s)?:\/\//.test(href)) {
                                        if (isRelative(sourceDir, filePath, href)) {
                                            subfiles.push(href);
                                        }
                                        else {
                                            line = line.replace(/<link .[^>]*>/, `<wcm-link rel="${rel}" for="${getDependencyName(href)}" path="${getDependencyLookup(href)}"></wcm-link>`);
                                        }
                                    }
                                }
                                else if (/<script.*src="[^"]*".*><\/script>/.test(line)) {
                                    let src;
                                    try {
                                        [, src] = /src="([^"]*)"/.exec(line);
                                    }
                                    catch (err) {
                                        logger_1.warn("Error whilst processing line %s in file %s", lineNumber, path.join(sourceDir, filePath));
                                    }
                                    if (!/http(s)?:\/\//.test(src)) {
                                        if (isRelative(sourceDir, filePath, src)) {
                                            line = line.replace(/<script.*src="[^"]*".*><\/script>/, `<wcm-script path="${src}"></wcm-script>`);
                                        }
                                        else {
                                            line = line.replace(/<script.*src="[^"]*".*><\/script>/, `<wcm-script for="${getDependencyName(src)}" path="${getDependencyLookup(src)}"></wcm-script>`);
                                        }
                                    }
                                }
                            }
                            if (inScript) {
                                !/<script>?/.test(line) && inlineJs.push(line);
                            }
                            else {
                                !/^<\/script>/.test(line) && output.write(`${line}\n`);
                            }
                        });
                    })
                        .on("close", () => __awaiter(this, void 0, void 0, function* () {
                        if (inlineJs.length) {
                            let jsOutput = fs.createWriteStream(path.join(outputDir, filePath).replace(".html", ".js"));
                            for (const line of inlineJs) {
                                jsOutput.write(`${line}\n`);
                            }
                            output.write(`<wcm-script path="${path.basename(filePath).replace(".html", ".js")}"></wcm-script>\n`);
                        }
                        for (const href of subfiles) {
                            yield processFile(sourceDir, outputDir, path.join(path.dirname(filePath), href), processedPaths);
                        }
                        resolve();
                    }));
                });
            case ".js":
                const fileName = path.join(outputDir, filePath.replace(".js", ".html"));
                if (!fs.existsSync(fileName)) {
                    yield filesystem_1.writeToFile(path.join(outputDir, filePath.replace(".js", ".html")), `<wcm-script path="${filePath}"></wcm-script>`);
                }
            default:
                return filesystem_1.copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
        }
    });
}
function isRelative(sourcePath, relPathA, relPathB) {
    try {
        return path.resolve(path.dirname(path.join(sourcePath, relPathA)), relPathB).includes(sourcePath + path.sep);
    }
    catch (err) {
        logger_1.warn("Unable to determine relitivity from '%s' between '%s' and '%s'", sourcePath, relPathA, relPathB);
    }
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
    try {
        return /[^./]+\/(.*)/.exec(url)[1];
    }
    catch (err) {
        logger_1.warn("Error whilst retrieving lookup from URL '%s'", url);
    }
}
