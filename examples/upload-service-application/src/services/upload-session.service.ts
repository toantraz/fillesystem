/**
 * Upload Session Service
 *
 * Manages in-memory upload sessions for server-side progress tracking.
 * Sessions are stored in a Map and cleaned up after completion.
 *
 * @see https://github.com/honojs/hono
 */

import type { TProgressResult, TUploadSession } from "../types/session.types";

/**
 * Upload Session Service
 *
 * Manages active upload sessions for progress tracking.
 * Uses in-memory Map for session storage (suitable for single-instance example).
 */
export class UploadSessionService {
  private sessions: Map<string, TUploadSession> = new Map();
  private readonly SESSION_TTL_MS = 60000; // 60 seconds TTL after completion

  /**
   * Create a new upload session
   *
   * @param totalBytes - Total file size in bytes (from Content-Length header)
   * @returns Upload session ID (UUID v4)
   */
  createSession(totalBytes: number): string {
    const uploadId = crypto.randomUUID();
    const session: TUploadSession = {
      uploadId,
      bytesReceived: 0,
      totalBytes,
      startTime: Date.now(),
      status: "pending",
    };
    this.sessions.set(uploadId, session);
    return uploadId;
  }

  /**
   * Update upload progress
   *
   * @param uploadId - Upload session identifier
   * @param bytesReceived - Number of bytes received so far
   */
  updateProgress(uploadId: string, bytesReceived: number): void {
    const session = this.sessions.get(uploadId);
    if (session) {
      session.bytesReceived = bytesReceived;
      session.status = bytesReceived > 0 ? "in_progress" : "pending";
    }
  }

  /**
   * Get current progress for an upload session
   *
   * @param uploadId - Upload session identifier
   * @returns Progress result or null if session not found
   */
  getProgress(uploadId: string): TProgressResult | null {
    const session = this.sessions.get(uploadId);
    if (!session) {
      return null;
    }

    const percentage = Math.round((session.bytesReceived / session.totalBytes) * 100);

    return {
      uploadId: session.uploadId,
      percentage: Math.min(100, Math.max(0, percentage)),
      bytesReceived: session.bytesReceived,
      totalBytes: session.totalBytes,
      status: session.status,
    };
  }

  /**
   * Mark an upload session as completed
   *
   * @param uploadId - Upload session identifier
   */
  completeSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (session) {
      session.status = "completed";
      // Schedule deletion after TTL
      setTimeout(() => this.deleteSession(uploadId), this.SESSION_TTL_MS);
    }
  }

  /**
   * Mark an upload session as failed
   *
   * @param uploadId - Upload session identifier
   */
  failSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (session) {
      session.status = "failed";
      // Delete failed sessions immediately
      this.deleteSession(uploadId);
    }
  }

  /**
   * Delete an upload session
   *
   * @param uploadId - Upload session identifier
   */
  deleteSession(uploadId: string): void {
    this.sessions.delete(uploadId);
  }

  /**
   * Get the number of active sessions
   *
   * @returns Number of active upload sessions
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Clean up all completed/failed sessions older than TTL
   * Called periodically to prevent memory leaks
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [uploadId, session] of this.sessions.entries()) {
      const sessionAge = now - session.startTime;
      // Clean up sessions older than 2x TTL (safety margin)
      if (sessionAge > this.SESSION_TTL_MS * 2) {
        this.deleteSession(uploadId);
      }
    }
  }
}
