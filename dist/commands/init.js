"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const filesystem_1 = require("../utilities/filesystem");
function exec() {
    return filesystem_1.fileExists("wcm.json")
        .then((exists) => {
        if (exists) {
            return confirmReinitialisation();
        }
        else {
            return inquirer.prompt([
                {
                    type: "input",
                    name: "main",
                    message: "Enter a comma separated list of entry paths (globs are accepted):",
                    validate: (input) => {
                        if (!input.length) {
                            return "Please specify at least one entry path";
                        }
                        else {
                            return true;
                        }
                    },
                },
                {
                    type: "input",
                    name: "rootDir",
                    message: "Specify the component's root directory:",
                    validate: (input) => {
                        if (!input.length) {
                            return "Please provide a path";
                        }
                        else {
                            return true;
                        }
                    },
                },
                {
                    type: "input",
                    name: "outDir",
                    message: "Specify the component's out directory:",
                    validate: (input) => {
                        if (!input.length) {
                            return "Please provide a path";
                        }
                        else {
                            return true;
                        }
                    },
                },
                {
                    type: "list",
                    name: "packageManager",
                    choices: [
                        "bower",
                        "npm",
                    ],
                    message: "Choose which package manager you are currently using:",
                    validate: (input) => {
                        if (!input.length) {
                            return "Please provide a path";
                        }
                        else {
                            return true;
                        }
                    },
                },
            ])
                .then(({ main, rootDir, outDir, packageManager }) => {
                if (main.includes(",")) {
                    main = main.split(",").map((x) => x.trim());
                }
                filesystem_1.writeJSONToFile("wcm.json", {
                    main,
                    componentOptions: {
                        rootDir,
                        outDir,
                    },
                    packageManager,
                });
            });
        }
    });
}
exports.exec = exec;
function confirmReinitialisation() {
    return inquirer.prompt({
        type: "confirm",
        name: "confirmed",
        message: "This component has already been initialised, would you like to reinitialise?",
    })
        .then(({ confirmed }) => {
        if (confirmed) {
            return initialiseComponent();
        }
    });
}
function initialiseComponent() {
    return inquirer.prompt([{
            type: "input",
            name: "main",
            message: "Enter a comma separated list of entry paths (globs are accepted):",
            validate: (input) => {
                if (!input.length) {
                    return "Please specify at least one entry path";
                }
                else {
                    return true;
                }
            },
        }, {
            type: "input",
            name: "rootDir",
            message: "Specify the component's root directory:",
            validate: (input) => {
                if (!input.length) {
                    return "Please provide a path";
                }
                else {
                    return true;
                }
            },
        },
        {
            type: "input",
            name: "outDir",
            message: "Specify the component's out directory:",
            validate: (input) => {
                if (!input.length) {
                    return "Please provide a path";
                }
                else {
                    return true;
                }
            },
        },
        {
            type: "list",
            name: "packageManager",
            choices: [
                "bower",
                "npm",
            ],
            message: "Choose which package manager you are currently using:",
            validate: (input) => {
                if (!input.length) {
                    return "Please provide a path";
                }
                else {
                    return true;
                }
            },
        },
    ])
        .then(({ main, rootDir, outDir, packageManager }) => {
        if (main.includes(",")) {
            main = main.split(",").map((x) => x.trim());
        }
        filesystem_1.writeJSONToFile("wcm.json", {
            main,
            componentOptions: {
                rootDir,
                outDir,
            },
            packageManager,
        });
    });
}
