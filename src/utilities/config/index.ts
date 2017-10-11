import * as Ajv from "ajv";
import { merge } from "ramda";

export interface Config {
  componentOptions: ComponentOptions;
  shrinkwrapOptions?: ShrinkwrapOptions;
  commandLineOptions?: CommandLineOptions;
  dependencyManagement: DependencyManagement;
}

export interface ComponentOptions {
  main: string | string[];
  rootDir: string;
  outDir: string;
}

export interface ShrinkwrapOptions {
  uriPrefix?: string;
}

export interface CommandLineOptions {
  debugEnabled?: boolean;
  logLevel?: LogLevel;
  logHandledErrors?: boolean;
}

export interface DependencyManagement {
  packageManager: keyof typeof PackageManager;
  optimise?: boolean;
}

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
}

export enum PackageManager {
  bower = "bower_components",
  npm = "node_modules",
}

const validate = new Ajv().compile({
  properties: {
    componentOptions: {
      properties: {
        main: {
          type: [
            "string",
            "array",
          ],
        },
        rootDir: {
          type: "string",
        },
        outDir: {
          type: "string",
        },
      },
      required: [
        "main",
        "rootDir",
        "outDir",
      ],
      type: "object",
    },
    shrinkwrapOptions: {
      properties: {
        uriPrefix: {
          type: "string",
        },
      },
      type: "object",
      default: {},
    },
    commandLineOptions: {
      properties: {
        debugEnabled: {
          type: "boolean"
        },
        logLevel: {
          enum: [
            "debug",
            "info",
            "warn",
          ],
          type: "string",
          default: "warn",
        },
        logHandledErrors: {
          type: "boolean",
        },
      },
      type: "object",
      default: {},
    },
    dependencyManagement: {
      properties: {
        packageManager: {
          enum: [
            "bower",
            "npm",
          ],
          type: "string",
        },
        optimise: {
          type: "boolean",
        },
      },
      required: [
        "packageManager",
      ],
      type: "object",
    },
  },
  required: [
    "componentOptions",
    "dependencyManagement",
  ],
  type: "object",
});

let config: Config = {} as any;

/**
 * This method will set the default options to the used by the CLI.
 *
 * @param {Config} config - The default options to be applied
 *
 * @returns {Void}
 */
export function applyConfig(value: Config): void {
  config = merge(value, config);
  validateConfig();
}

export function updateComponentOptions<K extends keyof ComponentOptions>(key: K, value: ComponentOptions[K]): void {
  config.componentOptions[key] = value;
  validateConfig();
}

export function getComponentOptions(): ComponentOptions {
  return config.componentOptions;
}

export function getShrinkwrapOptions(): ShrinkwrapOptions {
  return config.shrinkwrapOptions;
}

export function getCommandLineOptions(): CommandLineOptions {
  return config.commandLineOptions;
}

export function getDependencyManagement(): DependencyManagement {
  return config.dependencyManagement;
}

function validateConfig(): void | never {
  if (!validate(config)) {
    console.log("The config file is invalid, please ensure that the WCM file is correctly formatted!");
    process.exit(1);
  }
}
