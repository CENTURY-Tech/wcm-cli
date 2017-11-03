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
const cheerio = require("cheerio");
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const ramda_1 = require("ramda");
const config_1 = require("../utilities/config");
const errors_1 = require("../utilities/errors");
const filesystem_1 = require("../utilities/filesystem");
const logger_1 = require("../utilities/logger");
function exec() {
    return __awaiter(this, void 0, void 0, function* () {
        const { main, rootDir, outDir } = config_1.getComponentOptions();
        const processedPaths = [];
        for (const entryPath of ensureArray(main)) {
            for (const filePath of glob.sync(path.join(rootDir, entryPath))) {
                yield processFile(rootDir, outDir, path.relative(rootDir, filePath), processedPaths);
            }
        }
        // const dependenciesPath = path.resolve(".", getPackageManager().packageManager);
        // const outputPath = path.resolve(".", "web_components");
        // for (const dependency of await readDir(dependenciesPath)) {
        //   const sourceDirectory = path.join(dependenciesPath, dependency);
        //   if (!fs.statSync(sourceDirectory).isDirectory()) {
        //     continue;
        //   }
        //   const bowerJson = await readBowerModuleJson(path.join(dependenciesPath, dependency));
        //   const outputDirectory = path.join(outputPath, dependency, bowerJson._release);
        //   fs.removeSync(outputDirectory);
        //   if (optimise) {
        //     if (!bowerJson.main) {
        //       warn("'%s' has not declared an entry file, skipping optimisation", dependency);
        //       await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
        //       continue;
        //     }
        //     for (const entryPath of typeof bowerJson.main === "string" ? [bowerJson.main] : bowerJson.main) {
        //       if (!fs.existsSync(path.join(sourceDirectory, entryPath))) {
        //         warn("'%s' has an entry file '%s' that does not exist, skipping optimisation", dependency, entryPath);
        //         await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
        //         break;
        //       }
        //       await processFile(path.resolve(sourceDirectory), path.resolve(outputDirectory), entryPath, processedPaths);
        //     }
        //   } else {
        //     await processDir(path.resolve(sourceDirectory), path.resolve(outputDirectory), "", processedPaths);
        //   }
        // }
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
exports.processDir = processDir;
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
            case ".tpl":
                return filesystem_1.readFile(path.join(sourceDir, filePath))
                    .then((content) => {
                    const $ = cheerio.load(content);
                    return Promise.all([
                        Promise.all($("link[rel='import']").not("[wcm-ignore]").toArray().map(ramda_1.curry(processLinkElem)($))),
                        Promise.all($("script").not("[wcm-ignore]").toArray().map(ramda_1.curry(processScriptElem)($)))
                            .then(ramda_1.compose(ramda_1.reject(ramda_1.isNil), ramda_1.defaultTo([])))
                            .then((scripts) => {
                            if (scripts.length) {
                                let i = 0;
                                let jsFileName = filePath.replace(/(.html|.tpl)$/, ".js");
                                while (fs.existsSync(path.join(sourceDir, jsFileName))) {
                                    jsFileName = jsFileName.replace(".js", `_${++i}.js`);
                                }
                                $.root()
                                    .append($("<wcm-script></wcm-script>")
                                    .attr("path", path.basename(jsFileName)));
                                return filesystem_1.writeToFile(path.join(outputDir, jsFileName), scripts.join(""));
                            }
                        }),
                    ])
                        .then(() => {
                        return filesystem_1.writeToFile(path.join(outputDir, filePath), $.html());
                    });
                });
            default:
                return filesystem_1.copy(path.join(sourceDir, filePath), path.join(outputDir, filePath));
        }
        function processLinkElem($, link) {
            const { href, rel } = link.attribs;
            if (isRelative(sourceDir, filePath, href)) {
                $(link)
                    .replaceWith($("<wcm-link></wcm-link>")
                    .attr("rel", rel)
                    .attr("path", href));
                return processFile(sourceDir, outputDir, path.join(path.dirname(filePath), href), processedPaths);
            }
            else {
                $(link)
                    .replaceWith($("<wcm-link></wcm-link>")
                    .attr("rel", rel)
                    .attr("for", getDependencyName(href))
                    .attr("path", getDependencyLookup(href)));
            }
        }
        function processScriptElem($, script) {
            const { src } = script.attribs;
            if (script.childNodes && script.childNodes.length) {
                $(script).remove();
                return script.childNodes[0].data;
            }
            else if (!isHttp(src)) {
                if (isRelative(sourceDir, filePath, src)) {
                    $(script)
                        .replaceWith($("<wcm-script></wcm-script>")
                        .attr("path", src));
                }
                else {
                    $(script)
                        .replaceWith($("<wcm-script></wcm-script>")
                        .attr("for", getDependencyName(src))
                        .attr("path", getDependencyLookup(src)));
                }
            }
        }
    });
}
exports.processFile = processFile;
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
function ensureArray(val) {
    return typeof val === "object" && val.constructor === Array
        ? val
        : [val];
}
