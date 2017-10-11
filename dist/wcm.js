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
const path_1 = require("path");
const init_1 = require("./commands/init");
const install_1 = require("./commands/install");
const prepare_1 = require("./commands/prepare");
const shrinkwrap_1 = require("./commands/shrinkwrap");
const config_1 = require("./utilities/config");
const filesystem_1 = require("./utilities/filesystem");
(() => __awaiter(this, void 0, void 0, function* () {
    const [pkg, exists] = yield Promise.all([
        filesystem_1.readPackageJSON(path_1.resolve(__dirname, "..")),
        filesystem_1.fileExists("wcm.json"),
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
        init_1.exec();
    });
    if (exists) {
        config_1.applyConfig(yield filesystem_1.readWCMJSON("."));
        program.command("install")
            .description("Parse the dependencies used by this component")
            .action(() => {
            install_1.exec();
        });
        /**
         * wcm-cli-prepare
         */
        program.command("prepare")
            .description("Replace all link tags within the project with manifest links")
            .option("--rootDir  <path>", "the root directory")
            .option("--outDir   <path>", "the out directory")
            .option("--optimise       ", "if the component can be optimised")
            .action((opts) => {
            for (const key of ["rootDir", "outDir", "optimise"]) {
                if (opts[key]) {
                    config_1.updateComponentOptions(key, opts[key]);
                }
            }
            prepare_1.exec();
        });
        /**
         * wcm-cli-shrinkwrap
         */
        program.command("shrinkwrap")
            .option("-u, --uri-prefix <prefix>", "the url of the web components to be used in the uri", "/web_components")
            .action((opts) => {
            shrinkwrap_1.exec();
        });
    }
    program.parse(process.argv);
}))();
