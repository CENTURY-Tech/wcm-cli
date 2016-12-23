#!/usr/bin/env node
"use strict";
const fs = require("fs");
const program = require("commander");
const shrinkwrap_1 = require("./shrinkwrap");
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
    .action(() => {
    void shrinkwrap_1.exec(program);
});
program.parse(process.argv);
