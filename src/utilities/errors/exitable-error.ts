import { error } from "../logger";
import { getDebugEnabled } from "../config"

export class ExitableError extends Error {

  /**
   * Exit with this error
   */
  public exit(): never {
    if (getDebugEnabled()) {
      error('Fatal: %s\n\n%s', this.message, this.stack);
    } else {
      error('Fatal: %s', this.message);
    }

    return process.exit(1) as never;
  }

  public handled(): void {
    if (getDebugEnabled()) {
      error('Handled: %s\n\n%s', this.message, getDebugEnabled() && this.stack);
    } else {
      error('Handled: %s', this.message);
    }
  }

}
