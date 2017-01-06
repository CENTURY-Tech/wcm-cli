#!/usr/bin/env node

/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";
import { exec as inspectExec } from "./inspect";
import { exec as prepareExec } from "./prepare";
import { exec as shrinkwrapExec } from "./shrinkwrap";

/**
 * Shims
 */
import "./shims";

const pkg: Object = fs.readFileSync("package.json");

program
  .version(pkg["version"])
  .option("-p, --path <path>", "specify a custom path to your project", __dirname);

/**
 * wcm-cli-inspect
 */
program
  .command("inspect")
  .description("generate inspection details for a module or project")
  .option("-P, --project <path>", "specify a path to a project")
  .option("-M, --module  <path>", "specify a path to a module")
  .action((opts: { project?: string, module?: string }): void => {
    void inspectExec({ projectPath: opts.project, modulePath: opts.module });
  });

/**
 * wcm-cli-prepare
 */
program
  .command("prepare")
  .description("replace all link tags within the project with manifest links")
  .option("-e, --entry          <path>", "specify a custom entry point", path.join(__dirname, "index.html"))
  .option("-H, --href-transform <regexp>", "specify a regex to be used on link import hrefs for resolutions", "")
  .option("-D, --deps-location  <regexp>", "specify a regex with which to identify dependencies imports", "node_modules|bower_components")
  .action((opts: { entry: string, hrefTransform: string, depsLocation: string }): void => {
    /**
     * If the project path has been set to a non default value, and the entry path has been left as the default value,
     * ensure that the entry path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && opts.entry === path.join(__dirname, "index.html")) {
      console.log("Rebinding preparation entry path");
      opts.entry = path.join(program["path"], "index.html");
    }

    void prepareExec(opts.entry, new RegExp(opts.hrefTransform), new RegExp(opts.depsLocation));
  });

/**
 * wcm-cli-shrinkwrap
 */
program
  .command("shrinkwrap")
  .description("reduce dependencies to a versioned directory structure")
  .option("-d, --dest <path>", "specify a custom output destination", path.join(__dirname, "deps"))
  .action((opts: { dest: string }): void => {
    /**
     * If the project path has been set to a non default value, and the destination path has been left as the default
     * value, ensure that the destination path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && opts["dest"] === path.join(__dirname, "deps")) {
      console.log("Rebinding shrinkwrapping destination path");
      opts.dest = path.join(program["path"], "deps");
    }

    void shrinkwrapExec(program["path"], opts.dest);
  });

program.parse(process.argv);
