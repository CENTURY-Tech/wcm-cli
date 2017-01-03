export class ExitableError extends Error {

  /**
   * Exit with this error
   */
  public exit(): never {
    return exitWithError(this);
  }

}

export class FileNotFoundError extends ExitableError {

  constructor(filePath: string) {
    super(`No file found at path: ${filePath}`);
  }

}

export class UpstreamDependencyError extends ExitableError {

  constructor(dependencyName: string, err) {
    super(`Error recieved from upstream dependency "${dependencyName}": ${err.message}`);
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
 * Create a UpstreamDependencyError error for a dependency
 */
export function upstreamDependencyFailure(dependencyName: string, err: Error): FileNotFoundError {
  "use strict";

  return new UpstreamDependencyError(dependencyName, err);
}

/**
 * Terminate the program with the error supplied
 */
export function exitWithError(err: Error): never {
  "use strict";

  console.error(err.message);
  return process.exit(1) as never;
}
