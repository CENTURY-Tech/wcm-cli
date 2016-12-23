#!/usr/bin/env node

/**
 * Dependencies
 */
import * as fs from "fs";
import * as program from "commander";
import { exec as shrinkwrapExec } from "./shrinkwrap";

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
  .action((): void => {
    void shrinkwrapExec(program);
  });

program.parse(process.argv);
