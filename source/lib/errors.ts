export class FileNotFoundError extends Error {

  constructor(filePath: string) {
    super(`No file found at path: ${filePath}`);
  }

  /**
   * Exit with this error
   */
  public exit(): never {
    return exitWithError(this);
  }

}

/**
 * Create a FileNotFound error against the supplied path
 */
export function fileNotFound(filePath: string): FileNotFoundError {
  "use strict";

  return new FileNotFoundError(filePath);
}

/**
 * Terminate the program with the error supplied
 */
export function exitWithError(err: Error): never {
  "use strict";

  void console.error(err.message);
  return process.exit(1) as never;
}
