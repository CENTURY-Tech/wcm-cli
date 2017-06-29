#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const fs = require("fs");
const path = require("path");
const prepare_1 = require("./commands/prepare");
const config_1 = require("./utilities/config");
/**
 * Shims
 */
require("./shims");
const pkg = fs.readFileSync(path.resolve(__dirname, "..", "package.json"));
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
    .action((opts) => {
    return void Promise.resolve(opts)
        .then(setProgramDefaults)
        .then((opts) => prepare_1.exec(opts.parent.path));
});
program.parse(process.argv);
function setProgramDefaults(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.setLogLevel(["debug", "info", "warn", "error"].indexOf(opts.parent.logLevel.toLowerCase()));
        return opts;
    });
}
