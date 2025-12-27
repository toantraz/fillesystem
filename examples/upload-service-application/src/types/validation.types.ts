/**
 * Validation Types
 *
 * Type definitions for validation errors.
 * Follows Ignis coding standards with T prefix for type aliases.
 */

/**
 * Validation error details
 */
export interface TValidationError {
  code: string;
  message: string;
  context: Record<string, unknown>;
}

/**
 * Error codes for validation failures
 */
export type TErrorCode =
  | "VALIDATION_ERROR"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "UPLOAD_FAILED"
  | "DIRECTORY_NOT_FOUND"
  | "FILE_WRITE_ERROR"
  | "SESSION_NOT_FOUND";
