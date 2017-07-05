/**
 * The CLI log level.
 */
let logLevel: number;

let debugEnabled: boolean;

/**
 * The project path.
 */
let projectPath: string;

/**
 * Retrieve the log level.
 */
export function getLogLevel(): number {
  return logLevel;
}

/**
 * Set the log level.
 */
export function setLogLevel(level: number): void {
  logLevel = level;
}

export function getDebugEnabled(): boolean {
  return debugEnabled;
}

export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
}

/**
 * Retrieve the project path.
 */
export function getProjectPath(): string {
  return projectPath;
}

/**
 * Set the project path.
 */
export function setProjectPath(path: string) {
  projectPath = path;
}
