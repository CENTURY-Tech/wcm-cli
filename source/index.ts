#!/usr/bin/env node

/**
 * Dependencies
 */
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";
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
 * wcm-cli-shrinkwrap
 */
program
  .command("shrinkwrap")
  .description("reduce dependencies to versioned directory structure")
  .option("-d, --dest <path>", "specify a custom output destination", path.join(__dirname, "deps"))
  .action((): void => {
    /**
     * If the project path has been set to a non default value, and the destination path has been left as the default
     * value, ensure that the destination path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && path.join(__dirname, "deps")) {
      program["dest"] = path.join(program["path"], "deps");
    }

    void shrinkwrapExec(program);
  });

program.parse(process.argv);
