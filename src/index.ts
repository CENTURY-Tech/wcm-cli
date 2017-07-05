#!/usr/bin/env node

/**
 * Dependencies
 */
import * as program from "commander";
import * as fs from "fs";
import * as packageJSON from "gist-package-json";
import * as path from "path";
import { exec as prepareExec } from "./commands/prepare";
import { exec as shrinkwrapExec } from "./commands/shrinkwrap";
import { setLogLevel, setDebugEnabled } from "./utilities/config";

const pkg: packageJSON.IPackageJSON = fs.readFileSync(path.resolve(__dirname, "..", "package.json")) as any;

interface Options extends program.CommandOptions {
  parent: {
    path: string;
    logLevel: string;
    debugEnabled: boolean;
  };
  optimisation?: boolean;
  uriPrefix?: string;
}

program
  .version(pkg.version)
  .option("-p, --path          <path> ", "specify a custom path to your project", process.cwd())
  .option("-L, --log-level     <level>", "specify the logging level of the CLI", "warn")
  .option("-D, --debug-enabled        ", "toggle useful debugging information such as stack traces", false);

/**
 * wcm-cli-prepare
 */
program
  .command("prepare")
  .description("replace all link tags within the project with manifest links")
  .option("--no-optimisation", "disable optimisation steps whilst processing")
  .action((opts: Options): void => {
    return void Promise.resolve(opts)
      .then(setProgramDefaults)
      .then((opts) => prepareExec(opts.parent.path, opts.optimisation));
  });

/**
 * wcm-cli-shrinkwrap
 */
program
  .command("shrinkwrap")
  .option("-u, --uri-prefix <prefix>", "the url of the web components to be used in the uri", "web_components")
  .action((opts: Options): void => {
    return void Promise.resolve(opts)
      .then(setProgramDefaults)
      .then((opts) => shrinkwrapExec(opts.parent.path, opts.uriPrefix));
  });

program.parse(process.argv);

async function setProgramDefaults(opts: Options): Promise<Options> {
  setLogLevel(["debug", "info", "warn", "error"].indexOf(opts.parent.logLevel.toLowerCase()));
  setDebugEnabled(opts.parent.debugEnabled);

  return opts;
}
