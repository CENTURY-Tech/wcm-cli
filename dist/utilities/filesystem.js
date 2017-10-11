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
const fs = require("fs-extra");
const path = require("path");
const ramda_1 = require("ramda");
const errors_1 = require("./errors");
/**
 * Read the file at the supplied path asynchronously and throw an error if the file cannot be found.
 */
function readFile(fullPath) {
    if (!fs.existsSync(fullPath)) {
        errors_1.fileNotFound(fullPath).exit();
    }
    return new Promise((resolve) => {
        void fs.readFile(fullPath, "utf8", (err, data) => {
            if (err) {
                errors_1.upstreamDependencyFailure("fs-extra", err).exit();
            }
            void resolve(data);
        });
    });
}
exports.readFile = readFile;
function readDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        errors_1.directoryNotFound(dirPath).exit();
    }
    return new Promise((resolve) => {
        void fs.readdir(dirPath, (err, files) => {
            if (err) {
                errors_1.upstreamDependencyFailure("fs-extra", err).exit();
            }
            void resolve(files);
        });
    });
}
exports.readDir = readDir;
/**
 * Read the file at the supplied path synchronously and throw an error if the file cannot be found.
 */
function readFileSync(fullPath) {
    if (!fs.existsSync(fullPath)) {
        errors_1.fileNotFound(fullPath).exit();
    }
    return fs.readFileSync(fullPath, "utf8");
}
exports.readFileSync = readFileSync;
/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
function readFileAsJson(fullPath) {
    return readFile(path.resolve(fullPath)).then(JSON.parse);
}
exports.readFileAsJson = readFileAsJson;
/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
function readFileAsJsonSync(fullPath) {
    if (!fs.existsSync(fullPath)) {
        errors_1.fileNotFound(fullPath).exit();
    }
    return fs.readJsonSync(fullPath);
}
exports.readFileAsJsonSync = readFileAsJsonSync;
function writeToFile(fullPath, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureDirectoryExists(getPathParent(fullPath));
        return new Promise((resolve) => {
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
            void fs.writeFile(fullPath, data, (err) => {
                if (err) {
                    errors_1.upstreamDependencyFailure("fs-extra", err).exit();
                }
                void resolve();
            });
        });
    });
}
exports.writeToFile = writeToFile;
function writeJSONToFile(filePath, json) {
    return writeToFile(filePath, JSON.stringify(json, null, 2));
}
exports.writeJSONToFile = writeJSONToFile;
/**
 * Write the supplied JSON to a new file at the path provided.
 */
function writeJsonToFile(fullPath, json) {
    return writeToFile(fullPath, JSON.stringify(json, null, 2));
}
exports.writeJsonToFile = writeJsonToFile;
/**
 * Read and parse the bower JSON file at the supplied path.
 */
function readBowerJsonSync(projectPath) {
    return readFileAsJsonSync(path.resolve(projectPath, "bower.json"));
}
exports.readBowerJsonSync = readBowerJsonSync;
/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
function readBowerModuleJson(modulePath) {
    return readFileAsJson(path.resolve(modulePath, ".bower.json"));
}
exports.readBowerModuleJson = readBowerModuleJson;
/**
 * Read and parse the release/module bower JSON file at the supplied path.
 */
function readBowerModuleJsonSync(modulePath) {
    return readFileAsJsonSync(path.resolve(modulePath, ".bower.json"));
}
exports.readBowerModuleJsonSync = readBowerModuleJsonSync;
function ensureDirectoryExists(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            fs.mkdirp(dirPath, (err) => {
                if (err) {
                    errors_1.upstreamDependencyFailure("fs-extra", err).exit();
                }
                resolve();
            });
        });
    });
}
exports.ensureDirectoryExists = ensureDirectoryExists;
function fileExists(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.R_OK, (err) => {
            resolve(!err);
        });
    });
}
exports.fileExists = fileExists;
function removeDirectory(directoryPath) {
    return new Promise((resolve) => {
        fs.remove(directoryPath, (err) => {
            if (err) {
                errors_1.upstreamDependencyFailure("fs", err).exit();
            }
            resolve();
        });
    });
}
exports.removeDirectory = removeDirectory;
function isDirectory(directoryPath) {
    return new Promise((resolve) => {
        fs.stat(directoryPath, (err, stats) => {
            if (err) {
                errors_1.upstreamDependencyFailure("fs", err).exit();
            }
            void resolve(stats.isDirectory());
        });
    });
}
exports.isDirectory = isDirectory;
function readWCMJSON(projectPath) {
    return readFileAsJson(path.resolve(projectPath, "wcm.json"));
}
exports.readWCMJSON = readWCMJSON;
function readPackageJSON(projectPath) {
    return readFileAsJson(path.resolve(projectPath, "package.json"));
}
exports.readPackageJSON = readPackageJSON;
function readPackageJSONSync(projectPath) {
    return readFileAsJsonSync(path.resolve(projectPath, "package.json"));
}
exports.readPackageJSONSync = readPackageJSONSync;
/**
 * Copy the directory from the path supplied to the destination path supplied and throw an error if an issue is
 * encountered.
 */
function copy(sourcePath, outputPath) {
    return new Promise((resolve) => {
        void fs.copy(sourcePath, outputPath, (err) => {
            if (err) {
                errors_1.upstreamDependencyFailure("fs-extra", err).exit();
            }
            void resolve();
        });
    });
}
exports.copy = copy;
function getPathParent(pathname) {
    return ramda_1.compose(ramda_1.join(path.sep), ramda_1.init, ramda_1.split(path.sep))(pathname);
}
