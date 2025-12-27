/**
 * File Validation Utility
 *
 * Provides file size and type validation functions for upload service.
 * These utilities check files against configured constraints before storage.
 */

import type { TUploadConfiguration } from "../types/upload.types";
import type { TValidationError } from "../types/validation.types";

/**
 * Import getError from Ignis for error handling
 * This is a workaround since it's exported from the main package
 */
function getError(message: string, code: string, context?: Record<string, unknown>): Error {
  const error = new Error(JSON.stringify({ message, code, context })) as any;
  error.code = code;
  error.context = context || {};
  return error;
}

/**
 * Validate file size against configured maximum
 *
 * @param fileSize - Size of the file in bytes
 * @param config - Upload configuration containing maxFileSize
 * @throws Error with FILE_TOO_LARGE code if file exceeds maximum size
 */
export function validateFileSize(fileSize: number, config: TUploadConfiguration): void {
  if (fileSize > config.maxFileSize) {
    throw getError(
      `File size exceeds ${config.maxFileSize} bytes`,
      "FILE_TOO_LARGE",
      {
        maxSize: config.maxFileSize,
        actualSize: fileSize,
      },
    );
  }
}

/**
 * Validate file type against configured allowed types
 *
 * @param fileType - MIME type of the file (e.g., "image/png")
 * @param config - Upload configuration containing allowedFileTypes
 * @throws Error with INVALID_FILE_TYPE code if file type not allowed
 */
export function validateFileType(fileType: string, config: TUploadConfiguration): void {
  // If allowedFileTypes is null, all types are accepted
  if (config.allowedFileTypes === null) {
    return;
  }

  // Check if the file type is in the allowed list
  if (!config.allowedFileTypes.includes(fileType)) {
    throw getError(
      `File type ${fileType} not allowed`,
      "INVALID_FILE_TYPE",
      {
        fileType,
        allowedTypes: config.allowedFileTypes,
      },
    );
  }
}

/**
 * Parse a validation error from thrown error
 *
 * @param error - Error thrown by validation functions
 * @returns Parsed validation error or null
 */
export function parseValidationError(error: unknown): TValidationError | null {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.code && parsed.message) {
        return parsed as TValidationError;
      }
    } catch {
      // Not a JSON error, return null
    }
  }
  return null;
}
