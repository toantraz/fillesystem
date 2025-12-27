/**
 * Upload Service
 *
 * Business logic for handling file uploads with FilesystemComponent.
 * Demonstrates proper Ignis service pattern:
 * - Extends BaseService for logging
 * - Uses @inject decorator for dependency injection
 * - Follows [ClassName][methodName] logging format
 *
 * @see https://github.com/VENIZIA-AI/ignis
 */

import { BaseService, inject } from "@venizia/ignis";
import { FilesystemBindingKeys, type Filesystem } from "@ignis/filesystem";
import type { TUploadConfiguration, TUploadResult } from "../types/upload.types";
import { sanitizeFilename } from "../utils/filename-sanitizer.util";
import { validateFileSize, validateFileType } from "../utils/file-validation.util";
import path from "node:path";

/**
 * Upload Service Class
 *
 * Handles file upload operations with validation, sanitization,
 * and error handling following Ignis coding standards.
 *
 * Dependencies injected via constructor:
 * - filesystem: Filesystem instance from FilesystemComponent
 * - config: Upload configuration bound in application
 */
export class UploadService extends BaseService {
  constructor(
    @inject({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE })
    private filesystem: Filesystem,
    @inject({ key: "upload.configuration" })
    private config: TUploadConfiguration,
  ) {
    super({ scope: "UploadService" });
  }

  /**
   * Validate file before upload
   *
   * Checks if file exists and validates basic properties.
   *
   * @param file - The file to validate
   * @throws Error if file is invalid
   */
  validateFile(file: File): void {
    this.logger.info("[UploadService][validateFile] Validating file", {
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    // Check if file exists
    if (!file || file.size === 0) {
      throw getError("File is empty or does not exist", "VALIDATION_ERROR", {
        filename: file?.name,
      });
    }

    // Check if filename ends with / (indicates directory upload attempt)
    if (file.name.endsWith("/")) {
      throw getError("Only files are allowed, directory upload is not supported", "INVALID_FILE_TYPE", {
        filename: file.name,
      });
    }
  }

  /**
   * Handle upload errors with proper error codes
   *
   * @param error - The error that occurred
   * @param context - Additional context about the error
   * @param targetPath - Path where the file was being written (for cleanup)
   * @throws Formatted error with code and context
   */
  async handleError(
    error: unknown,
    context: Record<string, unknown>,
    targetPath?: string,
  ): Promise<never> {
    this.logger.error("[UploadService][handleError] Upload failed", {
      error: (error as Error)?.message,
      context,
    });

    // Clean up partial file if it exists
    if (targetPath) {
      try {
        const exists = await this.filesystem.exists(targetPath);
        if (exists) {
          this.logger.info("[UploadService][handleError] Cleaning up partial file", { targetPath });
          await this.filesystem.unlink(targetPath);
        }
      } catch {
        // Ignore cleanup errors
      }
    }

    if (error instanceof Error) {
      // Check if it's a validation error from our utilities
      const parsed = this.parseValidationError(error);
      if (parsed) {
        throw getError(parsed.message, parsed.code, { ...context, ...parsed.context });
      }

      // Check for disk space error (ENOSPC)
      if (error.message.includes("ENOSPC") || error.message.includes("No space left")) {
        throw getError("Insufficient disk space", "FILE_WRITE_ERROR", {
          ...context,
          originalError: error.message,
        });
      }

      // Check for network interruption
      if (error.message.includes("ECONNRESET") || error.message.includes("ETIMEDOUT")) {
        throw getError("Network interruption during upload", "UPLOAD_FAILED", {
          ...context,
          originalError: error.message,
        });
      }
    }

    throw getError("File upload failed", "UPLOAD_FAILED", {
      ...context,
      originalError: (error as Error)?.message,
    });
  }

  /**
   * Parse a validation error from thrown error
   *
   * @param error - Error thrown by validation functions
   * @returns Parsed validation error or null
   */
  private parseValidationError(error: Error): { code: string; message: string; context: Record<string, unknown> } | null {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.code && parsed.message) {
        return parsed;
      }
    } catch {
      // Not a JSON error
    }
    return null;
  }

  /**
   * Upload a single file to the target directory
   *
   * @param file - The file to upload
   * @param subpath - Optional subdirectory path within target directory
   * @param uploadId - Optional upload session ID for progress tracking
   * @returns Upload result with storage path and metadata
   */
  async uploadFile(file: File, subpath: string = "", uploadId?: string): Promise<TUploadResult> {
    const originalFilename = file.name;
    const sanitizedFilename = sanitizeFilename(originalFilename);

    this.logger.info("[UploadService][uploadFile] Starting file upload", {
      originalFilename,
      sanitizedFilename,
      size: file.size,
      contentType: file.type,
      subpath,
      uploadId,
    });

    try {
      // Validate file
      this.validateFile(file);

      // Validate file size
      validateFileSize(file.size, this.config);

      // Validate file type
      validateFileType(file.type, this.config);

      // Auto-create target directory if configured
      const fullPath = path.join(this.config.targetDirectory, subpath);
      if (this.config.autoCreateDirectory) {
        await this.ensureDirectoryExists(fullPath);
      }

      // Build target file path
      const targetPath = path.join(fullPath, sanitizedFilename);

      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file using injected filesystem
      await this.filesystem.writeFile(targetPath, buffer);

      this.logger.info("[UploadService][uploadFile] File uploaded successfully", {
        targetPath,
        size: buffer.length,
      });

      // Return success result
      return {
        success: true,
        storagePath: targetPath,
        errorMessage: null,
        errorCode: null,
        fileMetadata: {
          filename: sanitizedFilename,
          originalFilename,
          size: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      const targetPath = path.join(this.config.targetDirectory, subpath, sanitizedFilename);
      throw await this.handleError(error, {
        filename: originalFilename,
        targetPath,
        uploadId,
      }, targetPath);
    }
  }

  /**
   * Ensure directory exists, creating if necessary
   *
   * @param dirPath - Directory path to check/create
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const exists = await this.filesystem.exists(dirPath);
      if (!exists) {
        this.logger.info("[UploadService][ensureDirectoryExists] Creating directory", {
          path: dirPath,
        });
        await this.filesystem.mkdir(dirPath, { recursive: true });
      }
    } catch (error) {
      throw getError("Failed to create target directory", "DIRECTORY_NOT_FOUND", {
        path: dirPath,
        originalError: (error as Error)?.message,
      });
    }
  }
}

// --------------------------------------------------------------------------------
/**
 * Local getError function for error handling
 * Creates an error with code and context attached
 */
function getError(message: string, code: string, context?: Record<string, unknown>): Error {
  const error = new Error(message) as any;
  error.code = code;
  error.context = context || {};
  return error;
}
