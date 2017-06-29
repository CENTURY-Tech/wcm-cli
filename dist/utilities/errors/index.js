"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const directory_not_found_error_1 = require("./directory-not-found-error");
const file_not_found_error_1 = require("./file-not-found-error");
const upstream_dependency_error_1 = require("./upstream-dependency-error");
/**
 * Create a DirectoryNotFound error against the supplied path
 */
function directoryNotFound(dirPath) {
    return new directory_not_found_error_1.DirectoryNotFoundError(dirPath);
}
exports.directoryNotFound = directoryNotFound;
/**
 * Create a FileNotFound error against the supplied path
 */
function fileNotFound(filePath) {
    return new file_not_found_error_1.FileNotFoundError(filePath);
}
exports.fileNotFound = fileNotFound;
/**
 * Create a UpstreamDependencyError error for a dependency
 */
function upstreamDependencyFailure(dependencyName, err) {
    return new upstream_dependency_error_1.UpstreamDependencyError(dependencyName, err);
}
exports.upstreamDependencyFailure = upstreamDependencyFailure;
