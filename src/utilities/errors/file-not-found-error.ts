import { ExitableError } from "./exitable-error";

export class FileNotFoundError extends ExitableError {

  constructor(filePath: string) {
    super(`No file found at path: ${filePath}`);
  }

}
