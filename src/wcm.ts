#!/usr/bin/env node

import * as program from "commander";
import { resolve } from "path";
import { exec as initExec } from "./commands/init";
import { exec as installExec } from "./commands/install";
import { exec as prepareExec } from "./commands/prepare";
import { exec as shrinkwrapExec } from "./commands/shrinkwrap";
import { applyConfig, CommandLineOptions, ComponentOptions, ShrinkwrapOptions, updateComponentOptions } from "./utilities/config";
import { fileExists, readPackageJSON, readWCMJSON } from "./utilities/filesystem";

(async () => {

  const [pkg, exists] = await Promise.all([
    readPackageJSON(resolve(__dirname, "..")),
    fileExists("wcm.json"),
  ]);

  program
    .version(pkg.version)
    .description(pkg.description)
    .option("-L, --log-level          <level>", "specify the logging level of the CLI", "warn")
    .option("-H, --log-handled-errors        ", "log errors that have been quietly handled", false)
    .option("-D, --debug-enabled             ", "log useful debugging information such as stack traces", false);

  program.command("init")
    .description("Initialise the current project with WCM")
    .action(() => {
      initExec();
    });

  if (exists) {
    applyConfig(await readWCMJSON("."));

    program.command("install")
      .description("Parse the dependencies used by this component")
      .action((): void => {
        installExec();
      });

    /**
     * wcm-cli-prepare
     */
    program.command("prepare")
      .description("Replace all link tags within the project with manifest links")
      .option("--rootDir  <path>", "the root directory")
      .option("--outDir   <path>", "the out directory")
      .option("--optimise       ", "if the component can be optimised")
      .action((opts: ComponentOptions): void => {
        for (const key of ["rootDir", "outDir", "optimise"] as (keyof ComponentOptions)[]) {
          if (opts[key]) {
            updateComponentOptions(key, opts[key]);
          }
        }

        prepareExec();
      });

    /**
     * wcm-cli-shrinkwrap
     */
    program.command("shrinkwrap")
      .option("-u, --uri-prefix <prefix>", "the url of the web components to be used in the uri", "/web_components")
      .action((opts: { parent: CommandLineOptions } & ShrinkwrapOptions): void => {
        shrinkwrapExec();
      });
  }

  program.parse(process.argv);

})();
