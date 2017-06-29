export class ExitableError extends Error {

  /**
   * Exit with this error
   */
  public exit(): never {
    return exitWithError(this);
  }

}

/**
 * Terminate the program with the error supplied
 */
export function exitWithError(err: Error): never {
  console.error(err.message); // tslint:disable-line
  return process.exit(1) as never;
}
