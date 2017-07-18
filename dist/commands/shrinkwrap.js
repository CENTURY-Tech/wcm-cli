"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const filesystem_1 = require("../utilities/filesystem");
function exec(projectPath, uriPrefix) {
    return __awaiter(this, void 0, void 0, function* () {
        const componentsPath = path.resolve(projectPath, "web_components");
        const componentsManifest = {
            uri: `${uriPrefix}/<name>/<version>/<path>`,
            shrinkwrap: [],
        };
        for (const component of yield filesystem_1.readDir(componentsPath)) {
            componentsManifest.shrinkwrap.push({
                name: component,
                version: (yield filesystem_1.readDir(path.resolve(componentsPath, component)))[0],
            });
        }
        return filesystem_1.writeJsonToFile(path.resolve(projectPath, "wcm-shrinkwrap.json"), componentsManifest);
    });
}
exports.exec = exec;
