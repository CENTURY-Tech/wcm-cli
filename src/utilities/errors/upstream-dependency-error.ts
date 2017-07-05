import { ExitableError } from "./exitable-error";

export class UpstreamDependencyError extends ExitableError {

  constructor(dependencyName: string, err: Error) {
    super(`Error recieved from upstream dependency "${dependencyName}": ${err.message}`);
  }

}
