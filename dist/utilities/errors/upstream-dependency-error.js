"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exitable_error_1 = require("./exitable-error");
class UpstreamDependencyError extends exitable_error_1.ExitableError {
    constructor(dependencyName, err) {
        super(`Error recieved from upstream dependency "${dependencyName}": ${err.message}`);
    }
}
exports.UpstreamDependencyError = UpstreamDependencyError;
