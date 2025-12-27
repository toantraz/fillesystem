/**
 * Upload Controller
 *
 * REST API endpoints for file upload operations using Ignis BaseController.
 * Demonstrates proper controller pattern:
 * - Extends BaseController for routing
 * - Uses @controller decorator for registration
 * - Uses @get/@post decorators for route definitions
 * - Uses @inject for dependency injection of services
 * - Follows [ClassName][methodName] logging format
 *
 * @see https://github.com/VENIZIA-AI/ignis
 */

import {
  BaseController,
  controller,
  get,
  post,
  inject,
  HTTP,
  jsonContent,
  TRouteContext,
} from "@venizia/ignis";
import { z } from "@hono/zod-openapi";
import type { UploadService } from "../services/upload-service.service";
import type { UploadSessionService } from "../services/upload-session.service";
import type { TUploadResult, TMultiUploadResult } from "../types/upload.types";

// --------------------------------------------------------------------------------
/** Base path for upload endpoints */
const BASE_PATH = "/upload";

// --------------------------------------------------------------------------------
/**
 * Upload Controller Class
 *
 * Handles HTTP requests for file upload operations.
 * Dependencies injected via constructor:
 * - uploadService: Business logic for file uploads
 * - sessionService: Progress tracking management
 */
@controller({ path: BASE_PATH })
export class UploadController extends BaseController {
  constructor(
    @inject({ key: "services.UploadService" })
    private uploadService: UploadService,
    @inject({ key: "services.UploadSessionService" })
    private sessionService: UploadSessionService,
  ) {
    super({ scope: "UploadController", path: BASE_PATH });
  }

  // --------------------------------------------------------------------------------
  /**
   * Abstract method implementation - routes are defined via decorators
   */
  override binding(): void {
    // Routes are defined using @get and @post decorators above
  }

  // --------------------------------------------------------------------------------
  /**
   * POST /api/upload
   *
   * Single file upload endpoint.
   * Returns X-Upload-Id header for progress tracking.
   */
  @post({
    configs: {
      method: HTTP.Methods.POST,
      path: "/",
      responses: {
        [HTTP.ResultCodes.RS_2.Ok]: jsonContent({
          description: "File uploaded successfully",
          schema: z.object({
            success: z.boolean(),
            storagePath: z.string().nullable(),
            errorMessage: z.string().nullable(),
            errorCode: z.string().nullable(),
            fileMetadata: z.object({
              filename: z.string(),
              originalFilename: z.string(),
              size: z.number(),
              contentType: z.string(),
              uploadedAt: z.string(),
            }).nullable(),
          }),
        }),
        [HTTP.ResultCodes.RS_4.BadRequest]: jsonContent({
          description: "Bad request - no file provided or validation failed",
          schema: z.object({
            success: z.boolean(),
            storagePath: z.string().nullable(),
            errorMessage: z.string().nullable(),
            errorCode: z.string().nullable(),
            fileMetadata: z.null(),
          }),
        }),
      },
    } as any,
  })
  async uploadFile(c: TRouteContext<any>) {
    this.logger.info("[UploadController][uploadFile] Received upload request");

    try {
      // Parse multipart form data
      const body = await c.req.parseBody();

      // Extract file from form data
      const file = body["file"] as File;

      if (!file) {
        return c.json(
          {
            success: false,
            storagePath: null,
            errorMessage: "No file provided in request",
            errorCode: "VALIDATION_ERROR",
            fileMetadata: null,
          } as TUploadResult,
          HTTP.ResultCodes.RS_4.BadRequest,
        );
      }

      // Extract optional subdirectory path
      const subpath = (body["path"] as string) || "";

      // Create upload session for progress tracking
      const uploadId = this.sessionService.createSession(file.size);

      this.logger.info("[UploadController][uploadFile] Upload session created", { uploadId });

      // Perform upload
      const result = await this.uploadService.uploadFile(file, subpath, uploadId);

      // Complete session on success
      this.sessionService.completeSession(uploadId);

      // Return response with X-Upload-Id header
      return c.json(result, HTTP.ResultCodes.RS_2.Ok, {
        "X-Upload-Id": uploadId,
      });
    } catch (error) {
      this.logger.error(`[UploadController][uploadFile] Upload failed: ${(error as Error).message}`);

      // Parse error for proper response
      const errorCode = (error as any)?.code || "UPLOAD_FAILED";
      const errorMessage = (error as Error)?.message || "File upload failed";

      const statusCode =
        errorCode === "FILE_TOO_LARGE"
          ? HTTP.ResultCodes.RS_4.ContentTooLarge
          : errorCode === "INVALID_FILE_TYPE"
          ? HTTP.ResultCodes.RS_4.UnsupportedMediaType
          : HTTP.ResultCodes.RS_5.InternalServerError;

      return c.json(
        {
          success: false,
          storagePath: null,
          errorMessage,
          errorCode,
          fileMetadata: null,
        } as TUploadResult,
        statusCode,
      );
    }
  }

  // --------------------------------------------------------------------------------
  /**
   * GET /api/upload/progress/:uploadId
   *
   * Get upload progress endpoint.
   * Returns current progress for an active upload session.
   */
  @get({
    configs: {
      method: HTTP.Methods.GET,
      path: "/progress/:uploadId",
      responses: {
        [HTTP.ResultCodes.RS_2.Ok]: jsonContent({
          description: "Upload progress retrieved successfully",
          schema: z.object({
            uploadId: z.string(),
            percentage: z.number(),
            bytesReceived: z.number(),
            totalBytes: z.number(),
            status: z.enum(["pending", "in_progress", "completed", "failed"]),
          }),
        }),
        [HTTP.ResultCodes.RS_4.NotFound]: jsonContent({
          description: "Upload session not found",
          schema: z.object({
            success: z.boolean(),
            errorMessage: z.string(),
            errorCode: z.string(),
            context: z.object({
              uploadId: z.string(),
            }),
          }),
        }),
      },
    } as any,
  })
  getProgress(c: TRouteContext<any>) {
    const uploadId = c.req.param("uploadId");

    this.logger.info("[UploadController][getProgress] Progress check requested", { uploadId });

    const progress = this.sessionService.getProgress(uploadId);

    if (!progress) {
      return c.json(
        {
          success: false,
          errorMessage: "Upload session not found",
          errorCode: "SESSION_NOT_FOUND",
          context: { uploadId },
        },
        HTTP.ResultCodes.RS_4.NotFound,
      );
    }

    return c.json(progress);
  }

  // --------------------------------------------------------------------------------
  /**
   * POST /api/upload/batch
   *
   * Multiple file upload endpoint.
   * Processes each file independently with partial success support.
   */
  @post({
    configs: {
      method: HTTP.Methods.POST,
      path: "/batch",
      responses: {
        [HTTP.ResultCodes.RS_2.Ok]: jsonContent({
          description: "Batch upload completed",
          schema: z.object({
            totalFiles: z.number(),
            successfulUploads: z.number(),
            failedUploads: z.number(),
            results: z.array(z.object({
              success: z.boolean(),
              storagePath: z.string().nullable(),
              errorMessage: z.string().nullable(),
              errorCode: z.string().nullable(),
              fileMetadata: z.object({
                filename: z.string(),
                originalFilename: z.string(),
                size: z.number(),
                contentType: z.string(),
                uploadedAt: z.string(),
              }).nullable(),
            })),
          }),
        }),
        [HTTP.ResultCodes.RS_4.BadRequest]: jsonContent({
          description: "Bad request - no files provided",
          schema: z.object({
            totalFiles: z.number(),
            successfulUploads: z.number(),
            failedUploads: z.number(),
            results: z.array(z.object({
              success: z.boolean(),
              storagePath: z.string().nullable(),
              errorMessage: z.string().nullable(),
              errorCode: z.string().nullable(),
              fileMetadata: z.object({
                filename: z.string(),
                originalFilename: z.string(),
                size: z.number(),
                contentType: z.string(),
                uploadedAt: z.string(),
              }).nullable(),
            })),
          }),
        }),
      },
    } as any,
  })
  async uploadBatch(c: TRouteContext<any>) {
    this.logger.info("[UploadController][uploadBatch] Received batch upload request");

    try {
      // Parse multipart form data with all files
      const body = await c.req.parseBody({ all: true });

      // Extract files from form data
      const filesData = body["files"];

      // Handle both single file and array of files
      let files: File[];
      if (filesData instanceof File) {
        files = [filesData];
      } else if (Array.isArray(filesData)) {
        files = filesData.filter((f) => f instanceof File);
      } else {
        files = [];
      }

      if (files.length === 0) {
        return c.json(
          {
            totalFiles: 0,
            successfulUploads: 0,
            failedUploads: 0,
            results: [],
          } as TMultiUploadResult,
          HTTP.ResultCodes.RS_4.BadRequest,
        );
      }

      // Extract optional subdirectory path
      const subpath = (body["path"] as string) || "";

      // Process each file independently
      const results: TUploadResult[] = [];
      let firstUploadId: string | null = null;

      for (const file of files) {
        // Create session for each file
        const uploadId = this.sessionService.createSession(file.size);
        if (!firstUploadId) {
          firstUploadId = uploadId;
        }

        try {
          // Perform upload
          const result = await this.uploadService.uploadFile(file, subpath, uploadId);
          results.push(result);

          // Complete session
          this.sessionService.completeSession(uploadId);
        } catch (error) {
          // Log error but continue with other files
          this.logger.error(`[UploadController][uploadBatch] File upload failed: ${(error as Error).message}`, {
            filename: file.name,
          });

          const errorCode = (error as any)?.code || "UPLOAD_FAILED";
          const errorMessage = (error as Error)?.message || "File upload failed";

          results.push({
            success: false,
            storagePath: null,
            errorMessage,
            errorCode,
            fileMetadata: null,
          } as TUploadResult);

          // Fail session
          this.sessionService.failSession(uploadId);
        }
      }

      // Aggregate results
      const totalFiles = files.length;
      const successfulUploads = results.filter((r) => r.success).length;
      const failedUploads = totalFiles - successfulUploads;

      const batchResult: TMultiUploadResult = {
        totalFiles,
        successfulUploads,
        failedUploads,
        results,
      };

      // Return response with first file's uploadId for progress tracking
      return c.json(batchResult, HTTP.ResultCodes.RS_2.Ok, {
        ...(firstUploadId ? { "X-Upload-Id": firstUploadId } : {}),
      });
    } catch (error) {
      this.logger.error(`[UploadController][uploadBatch] Batch upload failed: ${(error as Error).message}`);

      return c.json(
        {
          success: false,
          storagePath: null,
          errorMessage: (error as Error)?.message || "Batch upload failed",
          errorCode: "UPLOAD_FAILED",
          fileMetadata: null,
        } as TUploadResult,
        HTTP.ResultCodes.RS_5.InternalServerError,
      );
    }
  }
}
