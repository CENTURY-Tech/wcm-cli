#!/usr/bin/env node

/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";
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
 * wcm-cli-prepare
 */
program
  .command("prepare")
  .description("replace all link tags within the project with manifest links")
  .option("-e, --entry <path>", "specify a custom entry point", path.join(__dirname, "index.html"))
  .action((options: { entry: string }): void => {
    /**
     * If the project path has been set to a non default value, and the entry path has been left as the default value,
     * ensure that the entry path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && options.entry === path.join(__dirname, "index.html")) {
      console.log("Rebinding preparation entry path");
      options.entry = path.join(program["path"], "index.html");
    }

    void prepareExec(options.entry);
  });

/**
 * wcm-cli-shrinkwrap
 */
program
  .command("shrinkwrap")
  .description("reduce dependencies to a versioned directory structure")
  .option("-d, --dest <path>", "specify a custom output destination", path.join(__dirname, "deps"))
  .action((options: { dest: string }): void => {
    /**
     * If the project path has been set to a non default value, and the destination path has been left as the default
     * value, ensure that the destination path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && options["dest"] === path.join(__dirname, "deps")) {
      console.log("Rebinding shrinkwrapping destination path");
      options.dest = path.join(program["path"], "deps");
    }

    void shrinkwrapExec(program["path"], options.dest);
  });

program.parse(process.argv);
