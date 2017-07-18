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
/**
 * Dependencies
 */
const cheerio = require("cheerio");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const ramda_1 = require("ramda");
const errors_1 = require("../utilities/errors");
const filesystem_1 = require("../utilities/filesystem");
const logger_1 = require("../utilities/logger");
function exec(projectPath, optimise) {
    return __awaiter(this, void 0, void 0, function* () {
        const wcmConfig = yield filesystem_1.readFileAsJson(path.resolve(projectPath, "wcm.json"));
        const rootDir = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
        const outDir = path.resolve(projectPath, wcmConfig.componentOptions.outDir);
        const processedPaths = [];
        for (const entryPath of typeof wcmConfig.main === "string" ? [wcmConfig.main] : wcmConfig.main) {
            for (const filePath of glob.sync(path.join(rootDir, entryPath))) {
                yield processFile(rootDir, outDir, path.relative(rootDir, filePath), processedPaths).catch(() => console.log("oh dear"));
            }
        }
        const sourcePath = path.resolve(projectPath, wcmConfig.componentOptions.rootDir);
        const dependenciesPath = path.resolve(projectPath, resolvePackageManagerDirectory(wcmConfig.packageManager));
        const outputPath = path.resolve(projectPath, "web_components");
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
            return;
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
                return filesystem_1.readFile(path.join(sourceDir, filePath))
                    .then((content) => {
                    const $ = cheerio.load(content);
                    return Promise.all([
                        Promise.all($("link").toArray().map((link) => processLinkElem($, link))),
                        Promise.all($("script").toArray().map((script) => processScriptElem($, script)))
                            .then(ramda_1.compose(ramda_1.reject(ramda_1.isNil), ramda_1.defaultTo([])))
                            .then((scripts) => {
                            if (scripts.length) {
                                const jsFileName = filePath.replace(".html", ".js");
                                $.root()
                                    .append($("<wcm-script></wcm-script>")
                                    .attr("path", jsFileName));
                                return filesystem_1.writeToFile(path.join(outputDir, jsFileName), scripts.join(""));
                            }
                        })
                    ])
                        .then(() => {
                        return filesystem_1.writeToFile(path.join(outputDir, filePath), $.html());
                    });
                });
            case ".js":
                const htmlFileName = path.join(outputDir, filePath.replace(".js", ".html"));
                if (!fs.existsSync(htmlFileName)) {
                    yield filesystem_1.writeToFile(htmlFileName, `<wcm-script path="${filePath}"></wcm-script>`);
                }
            default:
                return filesystem_1.copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
        }
        function processLinkElem($, link) {
            if (isRelative(sourceDir, filePath, link.attribs.href)) {
                return processFile(sourceDir, outputDir, path.join(path.dirname(filePath), link.attribs.href), processedPaths);
            }
            else {
                $(link)
                    .replaceWith($("<wcm-link></wcm-link>")
                    .attr("rel", link.attribs.rel)
                    .attr("for", getDependencyName(link.attribs.href))
                    .attr("path", getDependencyLookup(link.attribs.href)));
            }
        }
        function processScriptElem($, script) {
            if (script.childNodes && script.childNodes.length) {
                $(script).remove();
                return script.childNodes[0]["data"];
            }
            else if (!isHttp(script.attribs.src)) {
                if (isRelative(sourceDir, filePath, script.attribs.src)) {
                    $(script)
                        .replaceWith($("<wcm-script></wcm-script>")
                        .attr("path", script.attribs.src));
                }
                else {
                    $(script)
                        .replaceWith($("<wcm-script></wcm-script>")
                        .attr("for", getDependencyName(script.attribs.src))
                        .attr("path", getDependencyLookup(script.attribs.src)));
                }
            }
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
function isHttp(src) {
    return /http(s)?:\/\//.test(src);
}
function getHref(tag) {
    return /(href|src)="(.*)"/.exec(tag)[2];
}
function resolvePackageManagerDirectory(packageManager) {
    return {
        bower: "bower_components",
        npm: "node_modules",
    }[packageManager];
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
