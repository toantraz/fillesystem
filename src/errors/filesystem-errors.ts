/**
 * Filesystem Component Error Hierarchy
 *
 * Base error class and specific error types for filesystem operations.
 * Follows the error hierarchy defined in contracts/filesystem-api.md
 */

/**
 * Base filesystem error class
 */
export class FilesystemError extends Error {
  public override readonly cause?: Error;

  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = "FilesystemError";
    this.cause = options?.cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilesystemError);
    }

    // Include cause in stack trace if available
    if (this.cause && this.cause.stack) {
      this.stack += `\nCaused by: ${this.cause.stack}`;
    }
  }
}

/**
 * File not found error
 */
export class FileNotFoundError extends FilesystemError {
  constructor(path: string, options?: { cause?: Error }) {
    super(`File not found: ${path}`, options);
    this.name = "FileNotFoundError";
  }
}

/**
 * Permission denied error
 */
export class PermissionError extends FilesystemError {
  constructor(path: string, operation: string, options?: { cause?: Error }) {
    super(`Permission denied for ${operation} on ${path}`, options);
    this.name = "PermissionError";
  }
}

/**
 * Storage backend error (disk full, quota exceeded, etc.)
 */
export class StorageError extends FilesystemError {
  constructor(message: string, options?: { cause?: Error }) {
    super(`Storage error: ${message}`, options);
    this.name = "StorageError";
  }
}

/**
 * Network error (S3 connection issues, timeouts, etc.)
 */
export class NetworkError extends FilesystemError {
  constructor(message: string, options?: { cause?: Error }) {
    super(`Network error: ${message}`, options);
    this.name = "NetworkError";
  }
}

/**
 * Validation error (invalid path, configuration, etc.)
 */
export class ValidationError extends FilesystemError {
  constructor(message: string, options?: { cause?: Error }) {
    super(`Validation error: ${message}`, options);
    this.name = "ValidationError";
  }
}

/**
 * Utility function to map native errors to filesystem errors
 */
export function mapNativeError(
  error: Error,
  context: { path?: string; operation?: string },
): FilesystemError {
  const errorMessage = error.message.toLowerCase();

  // Map common error patterns
  if (errorMessage.includes("enoent") || errorMessage.includes("not found")) {
    return new FileNotFoundError(context.path || "unknown", { cause: error });
  }

  if (errorMessage.includes("eacces") || errorMessage.includes("permission denied")) {
    return new PermissionError(context.path || "unknown", context.operation || "operation", {
      cause: error,
    });
  }

  if (
    errorMessage.includes("enospc") ||
    errorMessage.includes("disk full") ||
    errorMessage.includes("quota")
  ) {
    return new StorageError(errorMessage, { cause: error });
  }

  if (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("socket")
  ) {
    return new NetworkError(errorMessage, { cause: error });
  }

  // Default to generic FilesystemError
  return new FilesystemError(errorMessage, { cause: error });
}
