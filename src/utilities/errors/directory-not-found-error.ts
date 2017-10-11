import { ExitableError } from "./exitable-error";

export class DirectoryNotFoundError extends ExitableError {

  constructor(dirPath: string) {
    super(`No directory found at path: ${dirPath}`);
  }

}
