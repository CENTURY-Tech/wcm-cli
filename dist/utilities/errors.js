"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExitableError extends Error {
    /**
     * Exit with this error
     */
    exit() {
        return exitWithError(this);
    }
}
class FileNotFoundError extends ExitableError {
    constructor(filePath) {
        super(`No file found at path: ${filePath}`);
    }
}
class UpstreamDependencyError extends ExitableError {
    constructor(dependencyName, err) {
        super(`Error recieved from upstream dependency "${dependencyName}": ${err.message}`);
    }
}
/**
 * Create a FileNotFound error against the supplied path
 */
function fileNotFound(filePath) {
    "use strict";
    return new FileNotFoundError(filePath);
}
exports.fileNotFound = fileNotFound;
/**
 * Create a UpstreamDependencyError error for a dependency
 */
function upstreamDependencyFailure(dependencyName, err) {
    "use strict";
    return new UpstreamDependencyError(dependencyName, err);
}
exports.upstreamDependencyFailure = upstreamDependencyFailure;
/**
 * Terminate the program with the error supplied
 */
function exitWithError(err) {
    "use strict";
    console.error(err.message);
    return process.exit(1);
}
exports.exitWithError = exitWithError;
