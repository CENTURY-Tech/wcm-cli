import { getCommandLineOptions } from "../config";
import { error } from "../logger";

export class ExitableError extends Error {

  /**
   * Exit with this error
   */
  public exit(): never {
    if (!getCommandLineOptions()) {
      error("Fatal: %s", this.message);
    } else if (getCommandLineOptions().debugEnabled) {
      error("Fatal: %s\n\n%s", this.message, this.stack);
    } else {
      error("Fatal: %s", this.message);
    }

    return process.exit(1) as never;
  }

  public handled(): void {
    if (!getCommandLineOptions()) {
      error("Handled: %s", this.message);
    } else if (getCommandLineOptions().logHandledErrors) {
      if (getCommandLineOptions().debugEnabled) {
        error("Handled: %s\n\n%s", this.message, getCommandLineOptions().debugEnabled && this.stack);
      } else {
        error("Handled: %s", this.message);
      }
    }
  }

}
