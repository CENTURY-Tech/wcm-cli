"use strict";
class FileNotFoundError extends Error {
    constructor(filePath) {
        super(`No file found at path: ${filePath}`);
    }
    /**
     * Exit with this error
     */
    exit() {
        return exitWithError(this);
    }
}
exports.FileNotFoundError = FileNotFoundError;
/**
 * Create a FileNotFound error against the supplied path
 */
function fileNotFound(filePath) {
    "use strict";
    return new FileNotFoundError(filePath);
}
exports.fileNotFound = fileNotFound;
/**
 * Terminate the program with the error supplied
 */
function exitWithError(err) {
    "use strict";
    void console.error(err.message);
    return process.exit(1);
}
exports.exitWithError = exitWithError;
