/**
 * Error Mapping Utility
 *
 * Provides consistent error mapping between different storage backends.
 * Maps backend-specific errors to common filesystem error types.
 */

import {
  FilesystemError,
  FileNotFoundError,
  PermissionError,
  StorageError,
  NetworkError,
  ValidationError,
} from "../errors/filesystem-errors";

/**
 * Error mapping context
 */
export interface ErrorMappingContext {
  /** File path involved in the operation */
  path?: string;
  /** Operation being performed */
  operation?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Map a native error to appropriate filesystem error
 */
export function mapError(error: any, context: ErrorMappingContext = {}): FilesystemError {
  const errorName = error.name || error.constructor.name;
  const errorMessage = error.message || String(error);
  const errorCode = error.code || error.errorCode;

  // Extract path from context or error
  const path = context.path || error.path || "unknown";
  const operation = context.operation || error.operation || "operation";

  // Common error patterns across backends

  // File not found errors
  if (
    errorName === "ENOENT" ||
    errorCode === "ENOENT" ||
    errorName === "NoSuchKey" ||
    errorName === "NotFound" ||
    errorMessage.includes("not found") ||
    errorMessage.includes("does not exist") ||
    errorMessage.includes("ENOENT")
  ) {
    return new FileNotFoundError(path, {
      cause: error,
    });
  }

  // Permission errors
  if (
    errorName === "EACCES" ||
    errorName === "EPERM" ||
    errorCode === "EACCES" ||
    errorCode === "EPERM" ||
    errorName === "AccessDenied" ||
    errorName === "Forbidden" ||
    errorMessage.includes("permission denied") ||
    errorMessage.includes("access denied") ||
    errorMessage.includes("EACCES") ||
    errorMessage.includes("EPERM")
  ) {
    return new PermissionError(path, operation, {
      cause: error,
    });
  }

  // Network errors
  if (
    errorName === "NetworkError" ||
    errorName === "TimeoutError" ||
    errorName === "ECONNREFUSED" ||
    errorName === "ECONNRESET" ||
    errorCode === "ECONNREFUSED" ||
    errorCode === "ECONNRESET" ||
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("ECONN")
  ) {
    return new NetworkError(errorMessage, {
      cause: error,
    });
  }

  // Validation errors
  if (
    errorName === "EINVAL" ||
    errorCode === "EINVAL" ||
    errorName === "ValidationError" ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("validation") ||
    errorMessage.includes("EINVAL")
  ) {
    return new ValidationError(errorMessage, {
      cause: error,
    });
  }

  // Storage errors (bucket not found, disk full, etc.)
  if (
    errorName === "ENOSPC" ||
    errorCode === "ENOSPC" ||
    errorName === "NoSuchBucket" ||
    errorName === "BucketNotFound" ||
    errorMessage.includes("disk full") ||
    errorMessage.includes("no space") ||
    errorMessage.includes("bucket") ||
    errorMessage.includes("ENOSPC")
  ) {
    return new StorageError(errorMessage, {
      cause: error,
    });
  }

  // Default to generic filesystem error
  return new FilesystemError(errorMessage, {
    cause: error,
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorName = error.name || error.constructor.name;
  const errorCode = error.code || error.errorCode;
  const errorMessage = error.message || String(error);

  // Network errors are usually retryable
  if (
    errorName === "NetworkError" ||
    errorName === "TimeoutError" ||
    errorCode === "ECONNREFUSED" ||
    errorCode === "ECONNRESET" ||
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return true;
  }

  // Throttling/rate limiting errors
  if (
    errorName === "ThrottlingException" ||
    errorName === "TooManyRequests" ||
    errorMessage.includes("throttl") ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  ) {
    return true;
  }

  // Service unavailable
  if (errorName === "ServiceUnavailable" || errorMessage.includes("service unavailable")) {
    return true;
  }

  // Default: not retryable
  return false;
}

/**
 * Get recommended retry delay for an error (in milliseconds)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getRetryDelay(_error: any, attempt: number): number {
  // Exponential backoff with jitter
  const baseDelay = 100; // 100ms base
  const maxDelay = 30000; // 30 seconds max

  // Exponential backoff: base * 2^(attempt-1)
  let delay = baseDelay * Math.pow(2, attempt - 1);

  // Add jitter (±20%)
  const jitter = delay * 0.2;
  delay = delay - jitter + Math.random() * (2 * jitter);

  // Cap at max delay
  return Math.min(delay, maxDelay);
}

/**
 * Wrap an operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    isRetryable?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number, delay: number) => void;
  } = {},
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const isRetryable = options.isRetryable || isRetryableError;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt < maxRetries && isRetryable(error)) {
        const delay = getRetryDelay(error, attempt);

        if (options.onRetry) {
          options.onRetry(error, attempt, delay);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Not retryable or max retries reached
      break;
    }
  }

  throw lastError;
}

/**
 * Create a standardized error message for logging
 */
export function createErrorMessage(error: any, context: ErrorMappingContext = {}): string {
  const errorName = error.name || error.constructor.name;
  const errorMessage = error.message || String(error);
  const path = context.path || "unknown";
  const operation = context.operation || "unknown";

  return `[${operation}] ${path}: ${errorName} - ${errorMessage}`;
}
