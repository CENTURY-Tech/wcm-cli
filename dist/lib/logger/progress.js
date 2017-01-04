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
const ProgressBar = require("progress");
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
exports.trackForEachSync = trackForEachSync;
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
exports.trackForEachAsync = trackForEachAsync;
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
exports.ArrayTracker = ArrayTracker;
