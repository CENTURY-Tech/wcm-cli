/**
 * Dependencies
 */
import * as path from "path";
import * as lib from "../lib";
import * as htmlparser from "htmlparser2";

export async function exec(entryPath: string): Promise<any> {
  "use strict";

  for (let file in traverseImports(entryPath)) {
    console.log(file["relpath"]);
  }
}

/**
 * Recursively process the link imports from the file at the supplied path and return a processed version with its
 * relative path. 
 */
function* traverseImports(entryPath: string, rootPath: string = entryPath): IterableIterator<Object> {
  "use strict";

  const file: string = lib.readFileSync(entryPath);
  const html = htmlparser

  yield {
    relpath: path.relative(rootPath, entryPath)
  }

  for (let dependency in moduleJson.dependencies) {
    if (!currentGraph.hasDependency(dependency)) {
      yield* traverseModule(path.join(modulePath, "..", dependency), rootPath);
    }
  }}
}