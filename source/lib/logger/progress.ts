/**
 * Dependencies
 */
import * as ProgressBar from "progress";

type ForEachCallback<T> = (value: any, i?: number, arr?: any[]) => T;

/**
 * A synchronous for each loop.
 */
export function trackForEachSync(message: string, arr: any[], fn: ForEachCallback<any>): void {
  "use strict";

  let i = 0;
  let n = arr.length;

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
  "use strict";

  let i = 0;
  let n = arr.length;

  const bar = new ProgressBar(`${message} [:bar] :percent`, { total: n });

  while (i < n) {
    await fn(arr[i], i++, arr);
    bar.tick();
  }
}

/**
 * An extension of the global Array class with a handful of added methods to integrate with the progress bars.
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
    "use strict";

    await trackForEachAsync(message, this as any, fn);
  }

  static of<T>(...items: T[]): ArrayTracker<T> {
    return new ArrayTracker<T>(...items);
  }

  static from<T>(iterable: T[]): ArrayTracker<T> {
    return new ArrayTracker<T>(...iterable);
  }

}
