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
const cheerio = require("cheerio");
const filesystem_1 = require("../lib/filesystem");
function exec(entryPath, linkHrefRegex, dependenciesPathRegex) {
    "use strict";
    return __awaiter(this, void 0, void 0, function* () {
        const processedPaths = [];
        for (let linkImport of resolveLinkImports(entryPath, processedPaths, linkHrefRegex, dependenciesPathRegex)) {
            console.log(linkImport["fullPath"]);
            processedPaths.push(linkImport["fullPath"]);
        }
    });
}
exports.exec = exec;
/**
 * Recursively process the link imports from the file at the supplied path.
 */
function* resolveLinkImports(entryPath, processedPaths, linkHrefRegex, dependenciesPathRegex) {
    "use strict";
    const $ = cheerio.load(filesystem_1.readFileSync(entryPath));
    yield {
        fullPath: path.normalize(entryPath)
    };
    for (let link of $("link").toArray()) {
        const linkHref = link.attribs["href"].replace(linkHrefRegex, "");
        const linkPath = path.join(path.dirname(entryPath), linkHref);
        if (!dependenciesPathRegex.test(linkHref) && !processedPaths.includes(linkPath)) {
            yield* resolveLinkImports(linkPath, processedPaths, linkHrefRegex, dependenciesPathRegex);
        }
    }
}
