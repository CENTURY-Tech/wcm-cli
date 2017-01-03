"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Dependencies
 */
const fs = require("fs-extra");
const errors_1 = require("./errors");
/**
 * Read and parse the file at the supplied path as JSON and throw an error if the file cannot be found.
 */
function readFileAsJson(fullPath) {
    "use strict";
    if (!fs.existsSync(fullPath)) {
        errors_1.fileNotFound(fullPath).exit();
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}
exports.readFileAsJson = readFileAsJson;
/**
 * Remove the directory at the path specified.
 */
@logProgress("Removing directory at path: %s", 0)
function removeDirectory(directoryPath) {
    "use strict";
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            fs.remove(directoryPath, (err) => {
                if (err) {
                    errors_1.upstreamDependencyFailure("fs-extra", err).exit();
                }
                void resolve();
            });
        });
    });
}
exports.removeDirectory = removeDirectory;
/**
 * Copy the module from the path supplied to the destination path supplied and throw an error if an issue is
 * encountered.
 */
function copyModule(dependencyPath, destinationPath) {
    "use strict";
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            fs.copy(dependencyPath, destinationPath, (err) => {
                if (err) {
                    errors_1.upstreamDependencyFailure("fs-extra", err).exit();
                }
                void resolve();
            });
        });
    });
}
exports.copyModule = copyModule;
function logProgress(message, ...argIndexes) {
    console.log('here')
    return function (target) {
        console.log(message, Array.from(arguments).filter((value, i) => {
            return argIndexes.includes(i);
        }));
        const call = target.apply(this, arguments);
        call.finally(() => {
            console.log(message + " [done]", Array.from(arguments).filter((value, i) => {
                return argIndexes.includes(i);
            }));
        });
        return call;
    };
}
