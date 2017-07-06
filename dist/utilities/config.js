"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The CLI log level.
 */
let logLevel;
let logHandledErrors;
let debugEnabled;
/**
 * The project path.
 */
let projectPath;
/**
 * Retrieve the log level.
 */
function getLogLevel() {
    return logLevel;
}
exports.getLogLevel = getLogLevel;
/**
 * Set the log level.
 */
function setLogLevel(level) {
    logLevel = level;
}
exports.setLogLevel = setLogLevel;
function getLogHandledErrors() {
    return logHandledErrors;
}
exports.getLogHandledErrors = getLogHandledErrors;
function setLogHandledErrors(enabled) {
    logHandledErrors = enabled;
}
exports.setLogHandledErrors = setLogHandledErrors;
function getDebugEnabled() {
    return debugEnabled;
}
exports.getDebugEnabled = getDebugEnabled;
function setDebugEnabled(enabled) {
    debugEnabled = enabled;
}
exports.setDebugEnabled = setDebugEnabled;
/**
 * Retrieve the project path.
 */
function getProjectPath() {
    return projectPath;
}
exports.getProjectPath = getProjectPath;
/**
 * Set the project path.
 */
function setProjectPath(path) {
    projectPath = path;
}
exports.setProjectPath = setProjectPath;
