import { resolve } from "path";
import { getShrinkwrapOptions } from "../utilities/config";
import { readDir, writeJsonToFile } from "../utilities/filesystem";

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

export async function exec(): Promise<void> {
  const componentsManifest: Manifest = {
    uri: `${getShrinkwrapOptions().uriPrefix}/<name>/<version>/<path>`,
    shrinkwrap: [],
  };

  for (const component of await readDir("web_components")) {
    componentsManifest.shrinkwrap.push({
      name: component,
      version: (await readDir(resolve("web_components", component)))[0],
    });
  }

  return writeJsonToFile("wcm-shrinkwrap.json", componentsManifest);
}
