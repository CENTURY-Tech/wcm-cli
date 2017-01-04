#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const program = require("commander");
const prepare_1 = require("./prepare");
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
 * wcm-cli-prepare
 */
program
    .command("prepare")
    .description("replace all link tags within the project with manifest links")
    .option("-e, --entry <path>", "specify a custom entry point", path.join(__dirname, "index.html"))
    .action((options) => {
    /**
     * If the project path has been set to a non default value, and the entry path has been left as the default value,
     * ensure that the entry path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && options.entry === path.join(__dirname, "index.html")) {
        console.log("Rebinding preparation entry path");
        options.entry = path.join(program["path"], "index.html");
    }
    void prepare_1.exec(options.entry);
});
/**
 * wcm-cli-shrinkwrap
 */
program
    .command("shrinkwrap")
    .description("reduce dependencies to a versioned directory structure")
    .option("-d, --dest <path>", "specify a custom output destination", path.join(__dirname, "deps"))
    .action((options) => {
    /**
     * If the project path has been set to a non default value, and the destination path has been left as the default
     * value, ensure that the destination path is reset to ensure that it is relative to the custom project path.
     */
    if (program["path"] !== __dirname && options["dest"] === path.join(__dirname, "deps")) {
        console.log("Rebinding shrinkwrapping destination path");
        options.dest = path.join(program["path"], "deps");
    }
    void shrinkwrap_1.exec(program["path"], options.dest);
});
program.parse(process.argv);
