#!/usr/bin/env node

/**
 * Dependencies
 */
import * as program from "commander";
import * as fs from "fs";
import * as packageJSON from "gist-package-json";
import * as path from "path";
import { exec as prepareExec } from "./commands/prepare";
import { setLogLevel } from "./utilities/config";

/**
 * Shims
 */
import "./shims";

const pkg: packageJSON.IPackageJSON = fs.readFileSync(path.resolve(__dirname, "..", "package.json")) as any;

interface Options extends program.CommandOptions {
  parent: {
    path: string;
    logLevel: string;
  };
}

program
  .version(pkg.version)
  .option("-p, --path            <path>", "specify a custom path to your project", __dirname)
  .option("-L, --log-level       <level>", "specify the logging level of the CLI", "warn");

/**
 * wcm-cli-prepare
 */
program
  .command("prepare")
  .description("replace all link tags within the project with manifest links")
  .action((opts: Options): void => {
    return void Promise.resolve(opts)
      .then(setProgramDefaults)
      .then((opts) => prepareExec(opts.parent.path));
  });

program.parse(process.argv);

async function setProgramDefaults(opts: Options): Promise<Options> {
  setLogLevel(["debug", "info", "warn", "error"].indexOf(opts.parent.logLevel.toLowerCase()));

  return opts;
}
