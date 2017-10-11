import { DirectoryNotFoundError } from "./directory-not-found-error";
import { FileNotFoundError } from "./file-not-found-error";
import { UpstreamDependencyError } from "./upstream-dependency-error";

/**
 * Create a DirectoryNotFound error against the supplied path
 */
export function directoryNotFound(dirPath: string): DirectoryNotFoundError {
  return new DirectoryNotFoundError(dirPath);
}

/**
 * Create a FileNotFound error against the supplied path
 */
export function fileNotFound(filePath: string): FileNotFoundError {
  return new FileNotFoundError(filePath);
}

/**
 * Create a UpstreamDependencyError error for a dependency
 */
export function upstreamDependencyFailure(dependencyName: string, err: Error): UpstreamDependencyError {
  return new UpstreamDependencyError(dependencyName, err);
}
