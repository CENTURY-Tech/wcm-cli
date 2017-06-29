"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exitable_error_1 = require("./exitable-error");
class DirectoryNotFoundError extends exitable_error_1.ExitableError {
    constructor(dirPath) {
        super(`No directory found at path: ${dirPath}`);
    }
}
exports.DirectoryNotFoundError = DirectoryNotFoundError;
