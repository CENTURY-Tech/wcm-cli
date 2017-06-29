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
exports.ExitableError = ExitableError;
/**
 * Terminate the program with the error supplied
 */
function exitWithError(err) {
    console.error(err.message); // tslint:disable-line
    return process.exit(1);
}
exports.exitWithError = exitWithError;
