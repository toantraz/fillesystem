/**
 * Upload Types
 *
 * Type definitions for upload service configuration, results, and metadata.
 * Follows Ignis coding standards with T prefix for type aliases.
 */

/**
 * Upload status enumeration
 */
export type TUploadStatus = "success" | "failed" | "pending";

/**
 * File metadata returned on successful upload
 */
export interface TFileMetadata {
  filename: string;
  originalFilename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Upload operation result
 */
export interface TUploadResult {
  success: boolean;
  storagePath: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  fileMetadata: TFileMetadata | null;
}

/**
 * Result of multiple file upload operation
 */
export interface TMultiUploadResult {
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
  results: TUploadResult[];
}

/**
 * Upload service configuration
 */
export interface TUploadConfiguration {
  targetDirectory: string;
  autoCreateDirectory: boolean;
  allowedFileTypes: string[] | null;  // null = all types accepted
  maxFileSize: number;
  maxConcurrentUploads: number;
  enableProgressTracking: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_UPLOAD_CONFIG: TUploadConfiguration = {
  targetDirectory: "./uploads",
  autoCreateDirectory: true,
  allowedFileTypes: null,  // No default restrictions
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxConcurrentUploads: 10,
  enableProgressTracking: true,
};
