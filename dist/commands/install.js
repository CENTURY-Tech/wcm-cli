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
const path_1 = require("path");
const config_1 = require("../utilities/config");
const filesystem_1 = require("../utilities/filesystem");
const logger_1 = require("../utilities/logger");
const prepare_1 = require("./prepare");
function exec() {
    return __awaiter(this, void 0, void 0, function* () {
        const { packageManager, optimise } = config_1.getDependencyManagement();
        for (const dependencyName of yield filesystem_1.readDir(config_1.PackageManager[packageManager])) {
            const dependencyPath = path_1.resolve(config_1.PackageManager[packageManager], dependencyName);
            if (yield filesystem_1.isDirectory(dependencyPath)) {
                switch (config_1.PackageManager[packageManager]) {
                    case config_1.PackageManager.bower:
                        const { main, _release } = yield filesystem_1.readBowerModuleJson(dependencyPath);
                        const sourcePath = path_1.resolve(config_1.PackageManager[packageManager], dependencyName);
                        const outputPath = path_1.resolve("web_components", dependencyName, _release);
                        if (optimise) {
                            yield prepareOptimisedAssets(ensureArray(main), sourcePath, outputPath);
                        }
                        else {
                            yield prepareAssets(sourcePath, outputPath);
                        }
                        break;
                    case config_1.PackageManager.npm:
                }
            }
        }
    });
}
exports.exec = exec;
function prepareAssets(sourcePath, outputPath) {
    return prepare_1.processDir(sourcePath, outputPath, "", []);
}
function prepareOptimisedAssets(entryPaths, sourcePath, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield filesystem_1.removeDirectory(outputPath);
        if (!entryPaths.length) {
            logger_1.warn("No entry file declared for '%s', skipping optimisation", sourcePath);
            return prepareAssets(sourcePath, outputPath);
        }
        const processedPaths = [];
        for (const entryPath of entryPaths) {
            if (filesystem_1.fileExists(path_1.resolve(sourcePath, entryPath))) {
                yield prepare_1.processFile(sourcePath, outputPath, entryPath, processedPaths);
            }
            else {
                logger_1.warn("One of the entry files for '%s' was not found, skipping optimisation", sourcePath);
                return prepareAssets(sourcePath, outputPath);
            }
        }
    });
}
function ensureArray(val) {
    return typeof val === "object" && val.constructor === Array
        ? val
        : [val];
}
