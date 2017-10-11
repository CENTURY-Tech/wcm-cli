import * as chalk from "chalk";
import * as ProgressBar from "progress";
import * as tableLogger from "table";
import { getCommandLineOptions } from "./config";

export interface IThreadLogger {
  log(message: string, ...optionalParams: any[]): void;
  debug(message: string, ...optionalParams: any[]): void;
  info(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: any[]): void;
}

type logFunctionSignature = (message: string, ...optionalParams: any[]) => void;

/**
 * A basic function that will log a debug message to the console.
 */
export function log(message: string, ...optionalParams: any[]): void {
  console.log(message, ...optionalParams);
}

/**
 * A basic function that will log a debug message to the console.
 */
export function debug(message: string, ...optionalParams: any[]): void {
  getCommandLineOptions().logLevel <= 0 && console.log(chalk.gray(message), ...optionalParams);
}

/**
 * A basic function that will log an information message to the console.
 */
export function info(message: string, ...optionalParams: any[]): void {
  getCommandLineOptions().logLevel <= 1 && console.log(chalk.cyan(message), ...optionalParams);
}

/**
 * A basic function that will log a warning message to the console.
 */
export function warn(message: string, ...optionalParams: any[]): void {
  getCommandLineOptions().logLevel <= 2 && console.log(chalk.yellow(message), ...optionalParams);
}

/**
 * A basic function that will log an error message to the console.
 */
export function error(message: string, ...optionalParams: any[]): void {
  console.log(chalk.red(`\n${message}\n`), ...optionalParams);
}

export function thread(openningMessage: string, ...optionalParams: any[]): IThreadLogger {
  info(chalk.bold(openningMessage), ...optionalParams);

  return {
    log: prefix(log, " "),
    debug: prefix(debug, " "),
    info: prefix(info, " "),
    warn: prefix(warn, " "),
    error: prefix(error, " "),
  };
}

function prefix(logMethod: logFunctionSignature, prefixMessage: string): logFunctionSignature {
  return (message: string, ...optionalParams: any[]): void => {
    void logMethod(`${prefixMessage} ${message}`, ...optionalParams);
  };
}

/**
 * A set of progress logging functions extending the "progress" library, allowing iterable objects that are expected to
 * take an unreasonable amount of time to be iterated upon to provide feedback to the developer as each item is
 * completed.
 */
export namespace progress {

  type ForEachCallback<T> = (value: any, i?: number, arr?: any[]) => T;

  /**
   * A synchronous for each loop.
   */
  export function trackForEachSync(message: string, arr: any[], fn: ForEachCallback<any>): void {
    let i = 0;
    const n = arr.length;

    const bar = new ProgressBar(`${message} [:bar] :percent`, { total: n });

    while (i < n) {
      fn(arr[i], i++, arr);
      bar.tick();
    }
  }

  /**
   * An asynchronous for each loop.
   */
  export async function trackForEachAsync(message: string, arr: any[], fn: ForEachCallback<Promise<any>>): Promise<void> {
    let i = 0;
    const n = arr.length;

    const bar = new ProgressBar(`${message} [:bar] :percent`, { total: n });

    while (i < n) {
      await fn(arr[i], i++, arr);
      bar.tick();
    }
  }

  /**
   * An extension of the global Array class with a handful of added methods to integrate with the progress methods
   * defined within this namespace.
   */
  export class ArrayTracker<T> extends Array<T> {

    /**
     * Wrap the progress of a synchronous the for each loop with a progress bar.
     */
    public trackForEachSync(message: string, fn: ForEachCallback<any>): void {
      "use strict";

      void trackForEachSync(message, this, fn);
    }

    /**
     * Wrap the progress of an asynchronous the for each loop with a progress bar.
     */
    public async trackForEachAsync(message: string, fn: ForEachCallback<Promise<any>>): Promise<void> {
      await trackForEachAsync(message, this as any, fn);
    }

    static of<T>(...items: T[]): ArrayTracker<T> {
      return new ArrayTracker<T>(...items);
    }

    static from<T>(iterable: T[]): ArrayTracker<T> {
      return new ArrayTracker<T>(...iterable);
    }

  }

}

export namespace table {

  /**
   * A basic reverse curried method for printing a formatted table.
   */
  export function print(data: any[]): void {
    "use strict";

    const stdout: string = tableLogger.table(data, {
      border: tableLogger.getBorderCharacters("norc"),
    });

    void console.log(stdout);
  }

  export function header(...tableHeadings: string[]): string[] {
    return tableHeadings.map((heading: string) => {
      return chalk.bold(heading);
    });
  }

}
