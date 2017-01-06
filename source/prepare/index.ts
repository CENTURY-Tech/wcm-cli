/**
 * Dependencies
 */
import * as path from "path";
import * as cheerio from "cheerio";
import { readFileSync } from "../lib/filesystem";

export async function exec(entryPath: string, linkHrefRegex: RegExp, dependenciesPathRegex: RegExp): Promise<any> {
  "use strict";

  const processedPaths = [];

  for (let linkImport of resolveLinkImports(entryPath, processedPaths, linkHrefRegex, dependenciesPathRegex)) {
    console.log(linkImport["fullPath"]);
    processedPaths.push(linkImport["fullPath"]);
  }
}

/**
 * Recursively process the link imports from the file at the supplied path.
 */
function* resolveLinkImports(entryPath: string, processedPaths: string[], linkHrefRegex: RegExp, dependenciesPathRegex: RegExp): IterableIterator<Object> {
  "use strict";

  const $ = cheerio.load(readFileSync(entryPath));

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
