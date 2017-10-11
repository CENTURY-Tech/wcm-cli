import * as inquirer from "inquirer";
import { fileExists, writeJSONToFile } from "../utilities/filesystem";

export function exec(): Promise<any> {
  return fileExists("wcm.json")
    .then((exists) => {
      if (exists) {
        return confirmReinitialisation();
      } else {
        return inquirer.prompt([
          {
            type: "input",
            name: "main",
            message: "Enter a comma separated list of entry paths (globs are accepted):",
            validate: (input: string) => {
              if (!input.length) {
                return "Please specify at least one entry path";
              } else {
                return true;
              }
            },
          },
          {
            type: "input",
            name: "rootDir",
            message: "Specify the component's root directory:",
            validate: (input: string) => {
              if (!input.length) {
                return "Please provide a path";
              } else {
                return true;
              }
            },
          },
          {
            type: "input",
            name: "outDir",
            message: "Specify the component's out directory:",
            validate: (input: string) => {
              if (!input.length) {
                return "Please provide a path";
              } else {
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
            validate: (input: string) => {
              if (!input.length) {
                return "Please provide a path";
              } else {
                return true;
              }
            },
          },
        ])
          .then(({ main, rootDir, outDir, packageManager }: inquirer.Answers) => {
            if (main.includes(",")) {
              main = main.split(",").map((x: string) => x.trim());
            }

            writeJSONToFile("wcm.json", {
              shrinkwrapOptions: {
                uriPrefix: "./web_components"
              },
              componentOptions: {
                main,
                rootDir,
                outDir,
              },
              dependencyManagement: {
                packageManager
              }
            });
          });
      }
    });
}

function confirmReinitialisation(): Promise<void> {
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

function initialiseComponent(): Promise<void> {
  return inquirer.prompt([{
    type: "input",
    name: "main",
    message: "Enter a comma separated list of entry paths (globs are accepted):",
    validate: (input: string) => {
      if (!input.length) {
        return "Please specify at least one entry path";
      } else {
        return true;
      }
    },
  }, {
    type: "input",
    name: "rootDir",
    message: "Specify the component's root directory:",
    validate: (input: string) => {
      if (!input.length) {
        return "Please provide a path";
      } else {
        return true;
      }
    },
  },
  {
    type: "input",
    name: "outDir",
    message: "Specify the component's out directory:",
    validate: (input: string) => {
      if (!input.length) {
        return "Please provide a path";
      } else {
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
    validate: (input: string) => {
      if (!input.length) {
        return "Please provide a path";
      } else {
        return true;
      }
    },
  },
  ])
    .then(({ main, rootDir, outDir, packageManager }: inquirer.Answers) => {
      if (main.includes(",")) {
        main = main.split(",").map((x: string) => x.trim());
      }

      writeJSONToFile("wcm.json", {
        shrinkwrapOptions: {
          uriPrefix: "./web_components"
        },
        componentOptions: {
          main,
          rootDir,
          outDir,
        },
        dependencyManagement: {
          packageManager
        }
      });
    });
}
