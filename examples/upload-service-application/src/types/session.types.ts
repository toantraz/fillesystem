/**
 * Session Types
 *
 * Type definitions for upload session management and progress tracking.
 * Follows Ignis coding standards with T prefix for type aliases.
 */

/**
 * Upload session status enumeration
 */
export type TSessionStatus = "pending" | "in_progress" | "completed" | "failed";

/**
 * Represents an active upload session for progress tracking
 */
export interface TUploadSession {
  uploadId: string;           // UUID v4
  bytesReceived: number;      // Bytes received so far
  totalBytes: number;         // Total bytes (from Content-Length)
  startTime: number;          // Unix timestamp (ms)
  status: TSessionStatus;
}

/**
 * Progress result returned by GET /api/upload/progress/:uploadId
 */
export interface TProgressResult {
  uploadId: string;
  percentage: number;        // 0-100
  bytesReceived: number;
  totalBytes: number;
  status: TSessionStatus;
}
