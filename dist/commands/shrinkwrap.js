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
const path = require("path");
const filesystem_1 = require("../utilities/filesystem");
const scanner_1 = require("../utilities/scanner");
function exec(projectPath, outDestination) {
    "use strict";
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * A verbose dependency graph to be used in the shrinkwrapping process. This graph contains all of the required
         * modules listed within this project and recursively within it's dependencies.
         */
        const dependencyGraph = scanner_1.moduleDependencies.resolveProjectDependencies(path.normalize(projectPath));
        // await dependencyGraph.copyModules(outDestination);
        yield filesystem_1.writeJsonToFile(path.join(projectPath, "manifest.json"), dependencyGraph.toReadable());
        console.log("Done");
    });
}
exports.exec = exec;
