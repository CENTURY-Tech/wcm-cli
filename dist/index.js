#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const program = require("commander");
const shrinkwrap_1 = require("./shrinkwrap");
/**
 * Shims
 */
require("./shims");
const pkg = fs.readFileSync("package.json");
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
    .action(() => {
    /**
     * If the project path has been set to a non default value, and the destination path has been left as the default
     * value, ensure that the destination path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && path.join(__dirname, "deps")) {
        program["dest"] = path.join(program["path"], "deps");
    }
    void shrinkwrap_1.exec(program);
});
program.parse(process.argv);
