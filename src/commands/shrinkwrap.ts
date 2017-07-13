/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { Writable } from "stream";
import { readDir, writeJsonToFile } from "../utilities/filesystem";
import { warn } from "../utilities/logger";

/**
 * A representation of the required keys expected to be present in the Manifest JSON.
 */
export interface Manifest {
  uri: string;
  shrinkwrap: Dependency[];
}

/**
 * A representation of the expected keys that a Dependency must have.
 */
export interface Dependency {
  uri?: string;
  rel?: string;
  name: string;
  version: string;
}

export async function exec(projectPath: string, uriPrefix: string): Promise<any> {
  const componentsPath = path.resolve(projectPath, "web_components");
  const componentsManifest: Manifest = {
    uri: `${uriPrefix}/<name>/<version>/<path>`,
    shrinkwrap: [],
  };

  for (const component of await readDir(componentsPath)) {
    componentsManifest.shrinkwrap.push({
      name: component,
      version: (await readDir(path.resolve(componentsPath, component)))[0],
    });
  }

  return writeJsonToFile(path.resolve(projectPath, "wcm-shrinkwrap.json"), componentsManifest);
}
