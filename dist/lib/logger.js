"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Dependencies
 */
const chalk = require("chalk");
const ProgressBar = require("progress");
const tableLogger = require("table");
;
/**
 * A basic function that will log a debug message to the console.
 */
function log(message, ...optionalParams) {
    void console.log(message, ...optionalParams);
}
exports.log = log;
/**
 * A basic function that will log a debug message to the console.
 */
function debug(message, ...optionalParams) {
    void console.log(chalk.gray(message), ...optionalParams);
}
exports.debug = debug;
/**
 * A basic function that will log an information message to the console.
 */
function info(message, ...optionalParams) {
    void console.log(chalk.cyan(message), ...optionalParams);
}
exports.info = info;
/**
 * A basic function that will log a warning message to the console.
 */
function warn(message, ...optionalParams) {
    void console.log(chalk.yellow(message), ...optionalParams);
}
exports.warn = warn;
/**
 * A basic function that will log an error message to the console.
 */
function error(message, ...optionalParams) {
    void console.log(chalk.red(message), ...optionalParams);
}
exports.error = error;
function prefix(logMethod, prefixMessage) {
    "use strict";
    return (message, ...optionalParams) => {
        void logMethod(`${prefixMessage} ${message}`, ...optionalParams);
    };
}
/**
 *
 */
function thread(openningMessage, ...optionalParams) {
    info(chalk.bold(openningMessage), ...optionalParams);
    return {
        log: prefix(log, " "),
        debug: prefix(debug, " "),
        info: prefix(info, " "),
        warn: prefix(warn, " "),
        error: prefix(error, " ")
    };
}
exports.thread = thread;
/**
 * A set of progress logging functions extending the "progress" library, allowing iterable objects that are expected to
 * take an unreasonable amount of time to be iterated upon to provide feedback to the developer as each item is
 * completed.
 */
var progress;
(function (progress) {
    /**
     * A synchronous for each loop.
     */
    function trackForEachSync(message, arr, fn) {
        "use strict";
        let i = 0;
        let n = arr.length;
        const bar = new ProgressBar(`${message} [:bar] :percent`, { total: n });
        while (i < n) {
            fn(arr[i], i++, arr);
            bar.tick();
        }
    }
    progress.trackForEachSync = trackForEachSync;
    /**
     * An asynchronous for each loop.
     */
    function trackForEachAsync(message, arr, fn) {
        "use strict";
        return __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            let n = arr.length;
            const bar = new ProgressBar(`${message} [:bar] :percent`, { total: n });
            while (i < n) {
                yield fn(arr[i], i++, arr);
                bar.tick();
            }
        });
    }
    progress.trackForEachAsync = trackForEachAsync;
    /**
     * An extension of the global Array class with a handful of added methods to integrate with the progress methods
     * defined within this namespace.
     */
    class ArrayTracker extends Array {
        /**
         * Wrap the progress of a synchronous the for each loop with a progress bar.
         */
        trackForEachSync(message, fn) {
            "use strict";
            void trackForEachSync(message, this, fn);
        }
        /**
         * Wrap the progress of an asynchronous the for each loop with a progress bar.
         */
        trackForEachAsync(message, fn) {
            "use strict";
            return __awaiter(this, void 0, void 0, function* () {
                yield trackForEachAsync(message, this, fn);
            });
        }
        static of(...items) {
            return new ArrayTracker(...items);
        }
        static from(iterable) {
            return new ArrayTracker(...iterable);
        }
    }
    progress.ArrayTracker = ArrayTracker;
})(progress = exports.progress || (exports.progress = {}));
var table;
(function (table) {
    /**
     * A basic reverse curried method for printing a formatted table.
     */
    function print(data) {
        "use strict";
        const stdout = tableLogger.table(data, {
            border: tableLogger.getBorderCharacters("norc")
        });
        void console.log(stdout);
    }
    table.print = print;
    function header(...tableHeadings) {
        return tableHeadings.map((heading) => {
            return chalk.bold(heading);
        });
    }
    table.header = header;
})(table = exports.table || (exports.table = {}));
