"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exitable_error_1 = require("./exitable-error");
class FileNotFoundError extends exitable_error_1.ExitableError {
    constructor(filePath) {
        super(`No file found at path: ${filePath}`);
    }
}
exports.FileNotFoundError = FileNotFoundError;
