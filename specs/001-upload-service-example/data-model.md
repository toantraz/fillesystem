# Data Model: Upload Service Example

**Feature**: Upload Service Example
**Date**: 2025-12-26 (Updated with server-side progress tracking)
**Source**: [spec.md](./spec.md) - Key Entities section

## Overview

This document defines the data model for the upload service example application with server-side progress tracking. Entities are derived from the functional requirements and user stories in the feature specification.

---

## Entity: UploadedFile

Represents a file uploaded through the service. Created for each file upload attempt.

### Fields

| Field | Type | Nullable | Description | Validation |
|-------|------|----------|-------------|------------|
| `originalFilename` | `string` | No | The filename as provided by the client (pre-sanitization) | Must not be empty |
| `sanitizedFilename` | `string` | No | The filename after sanitization (unsafe chars replaced with `_`) | Must not be empty |
| `fileSize` | `number` | No | Size of the file in bytes | Must be >= 0; validated against maxSize |
| `contentType` | `string` | No | MIME type of the file (e.g., "image/png") | From File.type header; validated against allowedTypes |
| `storagePath` | `string` | No | Full path where file is stored | Absolute path in target directory |
| `uploadTimestamp` | `Date` | No | When the upload completed | ISO 8601 format |
| `uploadStatus` | `TUploadStatus` | No | Status of the upload operation | "success" \| "failed" \| "pending" |

### Type Definition

```typescript
/**
 * Upload status enumeration
 */
type TUploadStatus = "success" | "failed" | "pending";

/**
 * Represents a file uploaded through the service
 */
interface TUploadedFile {
  originalFilename: string;
  sanitizedFilename: string;
  fileSize: number;
  contentType: string;
  storagePath: string;
  uploadTimestamp: Date;
  uploadStatus: TUploadStatus;
}
```

### State Transitions

```
pending → success
    ↓
   failed
```

- Initial state: `pending` (when upload begins)
- Success state: `success` (when file successfully stored)
- Failure state: `failed` (when any error occurs)

### Relationships

- **UploadResult**: One UploadedFile is referenced by one UploadResult
- **UploadSession**: One UploadedFile is tracked by one UploadSession during upload

---

## Entity: UploadConfiguration

Represents service settings for the upload service. Created at application startup from environment variables or config file.

### Fields

| Field | Type | Nullable | Description | Default |
|-------|------|----------|-------------|---------|
| `targetDirectory` | `string` | No | Directory path where files are stored | `./uploads` |
| `autoCreateDirectory` | `boolean` | No | Whether to create target directory if missing | `true` (FR-203) |
| `allowedFileTypes` | `string[]` \| `null` | Yes | Allowed MIME types (null = all types) | `null` (no restrictions) |
| `maxFileSize` | `number` | No | Maximum file size in bytes | `104857600` (100MB) |
| `maxConcurrentUploads` | `number` | No | Maximum concurrent upload requests | `10` |
| `enableProgressTracking` | `boolean` | No | Enable server-side progress tracking | `true` |

### Type Definition

```typescript
/**
 * Upload service configuration
 */
interface TUploadConfiguration {
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
const DEFAULT_UPLOAD_CONFIG: TUploadConfiguration = {
  targetDirectory: "./uploads",
  autoCreateDirectory: true,
  allowedFileTypes: null,  // No default restrictions
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxConcurrentUploads: 10,
  enableProgressTracking: true,
};
```

### Validation Rules

- `targetDirectory`: Must be a valid path string (absolute or relative)
- `autoCreateDirectory`: Must be boolean
- `allowedFileTypes`: If provided, each must be a valid MIME type (e.g., "image/jpeg"); `null` means accept all
- `maxFileSize`: Must be positive number
- `maxConcurrentUploads`: Must be positive integer

### Relationships

- **UploadService**: Uses UploadConfiguration for all upload operations
- **UploadSessionService**: Uses `enableProgressTracking` to determine if session tracking is active

---

## Entity: UploadResult

Represents the outcome of an upload operation. Returned to the client after each upload attempt.

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `success` | `boolean` | No | Whether the upload succeeded |
| `storagePath` | `string` \| `null` | Yes | Path where file was stored (null if failed) |
| `errorMessage` | `string` \| `null` | Yes | Human-readable error message (null if success) |
| `errorCode` | `string` \| `null` | Yes | Machine-readable error code (null if success) |
| `fileMetadata` | `TFileMetadata` \| `null` | Yes | File information (null if failed) |

### Nested Type: TFileMetadata

| Field | Type | Description |
|-------|------|-------------|
| `filename` | `string` | Sanitized filename stored |
| `originalFilename` | `string` | Original filename from client |
| `size` | `number` | File size in bytes |
| `contentType` | `string` | MIME type |
| `uploadedAt` | `string` | ISO 8601 timestamp |

### Type Definition

```typescript
/**
 * File metadata returned on successful upload
 */
interface TFileMetadata {
  filename: string;
  originalFilename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Upload operation result
 */
interface TUploadResult {
  success: boolean;
  storagePath: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  fileMetadata: TFileMetadata | null;
}
```

### Success Response Example

```json
{
  "success": true,
  "storagePath": "/uploads/document.pdf",
  "errorMessage": null,
  "errorCode": null,
  "fileMetadata": {
    "filename": "document.pdf",
    "originalFilename": "document.pdf",
    "size": 2458624,
    "contentType": "application/pdf",
    "uploadedAt": "2025-12-26T10:30:45.123Z"
  }
}
```

### Failure Response Example

```json
{
  "success": false,
  "storagePath": null,
  "errorMessage": "File size exceeds 10485760 bytes",
  "errorCode": "FILE_TOO_LARGE",
  "fileMetadata": null
}
```

### Relationships

- **UploadedFile**: References the file that was uploaded
- **UploadService**: Returns UploadResult from all upload methods

---

## Entity: UploadSession (NEW)

Represents an active upload session for server-side progress tracking. Created when upload begins, updated as bytes are received, deleted upon completion.

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `uploadId` | `string` | No | Unique identifier for the upload session (UUID v4) |
| `bytesReceived` | `number` | No | Number of bytes received so far |
| `totalBytes` | `number` | No | Total file size in bytes (from Content-Length header) |
| `startTime` | `number` | No | Unix timestamp when upload started |
| `status` | `TSessionStatus` | No | Current status of the upload session |

### Type Definition

```typescript
/**
 * Upload session status enumeration
 */
type TSessionStatus = "pending" | "in_progress" | "completed" | "failed";

/**
 * Represents an active upload session for progress tracking
 */
interface TUploadSession {
  uploadId: string;           // UUID v4
  bytesReceived: number;      // Bytes received so far
  totalBytes: number;         // Total bytes (from Content-Length)
  startTime: number;          // Unix timestamp (ms)
  status: TSessionStatus;
}
```

### State Transitions

```
pending → in_progress → completed
            ↓
          failed
```

- Initial state: `pending` (session created, waiting for data)
- Upload starts: `in_progress` (receiving bytes)
- Success state: `completed` (all bytes received and stored)
- Failure state: `failed` (error during upload)

### Session Lifecycle

```typescript
// 1. Session created when upload request received
const uploadId = sessionService.createSession(contentLength);

// 2. Session updated as bytes received
sessionService.updateProgress(uploadId, bytesReceived);

// 3. Session marked completed on success
sessionService.completeSession(uploadId);

// 4. Session deleted after TTL or on failure
sessionService.deleteSession(uploadId);
```

### Relationships

- **UploadSessionService**: Manages all UploadSession instances in memory
- **ProgressResult**: Derived from UploadSession for client responses

---

## Entity: ProgressResult

Represents the progress information returned by the `/api/upload/progress/:id` endpoint.

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `uploadId` | `string` | No | Upload session identifier |
| `percentage` | `number` | No | Upload progress percentage (0-100) |
| `bytesReceived` | `number` | No | Number of bytes received |
| `totalBytes` | `number` | No | Total file size in bytes |
| `status` | `TSessionStatus` | No | Current status of the upload |

### Type Definition

```typescript
/**
 * Progress result returned by GET /api/upload/progress/:id
 */
interface TProgressResult {
  uploadId: string;
  percentage: number;        // 0-100
  bytesReceived: number;
  totalBytes: number;
  status: TSessionStatus;
}
```

### Example Response

```json
{
  "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "percentage": 45,
  "bytesReceived": 4500000,
  "totalBytes": 10000000,
  "status": "in_progress"
}
```

### Relationships

- **UploadSession**: ProgressResult is derived from current UploadSession state
- **Progress Endpoint**: Returns ProgressResult for polling clients

---

## Entity: MultiUploadResult

Represents the outcome of a multiple file upload operation. Contains individual results for each file.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalFiles` | `number` | Total number of files uploaded |
| `successfulUploads` | `number` | Number of files successfully stored |
| `failedUploads` | `number` | Number of files that failed |
| `results` | `TUploadResult[]` | Individual result for each file |

### Type Definition

```typescript
/**
 * Result of multiple file upload operation
 */
interface TMultiUploadResult {
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
  results: TUploadResult[];
}
```

---

## Entity: ValidationError

Represents a validation error that occurs during file upload. Used internally and returned as part of error responses.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Machine-readable error code |
| `message` | `string` | Human-readable error description |
| `context` | `Record<string, unknown>` | Additional error context |

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Form data validation failed | 400 |
| `FILE_TOO_LARGE` | File exceeds maxFileSize | 413 |
| `INVALID_FILE_TYPE` | File type not in allowedFileTypes | 415 |
| `UPLOAD_FAILED` | Generic upload failure | 500 |
| `DIRECTORY_NOT_FOUND` | Target directory doesn't exist (when autoCreateDirectory=false) | 500 |
| `FILE_WRITE_ERROR` | Error writing file to storage | 500 |
| `SESSION_NOT_FOUND` | Upload session not found | 404 |

### Type Definition

```typescript
/**
 * Validation error details
 */
interface TValidationError {
  code: string;
  message: string;
  context: Record<string, unknown>;
}
```

---

## Entity Relationships Diagram

```
┌─────────────────────┐
│ UploadConfiguration │
├─────────────────────┤
│ targetDirectory     │
│ autoCreateDirectory │
│ allowedFileTypes    │──┐ (null = all types)
│ maxFileSize         │  │
│ enableProgress      │──┤
└─────────────────────┘  │
         │               │
         │ uses          │
         ▼               │
   ┌─────────────────────┤
   │ UploadSessionService│ ───────────┐
   └─────────────────────┘            │ manages
                                        │
   ┌─────────────┐    ┌───────────────┴───────────────┐
   │ UploadService│    │ UploadSession                │
   └─────────────┘    ├───────────────────────────────┤
         │            │ uploadId (UUID)               │
         │ processes  │ bytesReceived                 │
         │            │ totalBytes                    │
         │            │ status                        │
         ▼            └───────────────────────────────┘
   ┌─────────────┐                 │
   │ UploadedFile│◄────────────────┘ (tracked during upload)
   ├─────────────┤
   │ originalFilename  │
   │ sanitizedFilename │  (unsafe chars → _)
   │ fileSize         │
   │ contentType      │
   │ storagePath      │
   │ uploadTimestamp  │
   │ uploadStatus     │
   └─────────────┘
         │
         │ produces
         ▼
   ┌─────────────┐      ┌─────────────┐
   │UploadResult │◄─────│ProgressResult│ (derived from session)
   ├─────────────┤      └─────────────┘
   │ success     │
   │ storagePath │
   │ errorMessage│
   │ errorCode   │
   │ fileMetadata│
   └─────────────┘
```

---

## Summary

| Entity | Purpose | Lifecycle |
|--------|---------|-----------|
| `TUploadedFile` | Internal representation of uploaded file | Created on upload, stored in filesystem |
| `TUploadConfiguration` | Service settings | Created at startup, never changes |
| `TUploadResult` | Response to client | Created per upload request |
| `TUploadSession` | Track upload progress | Created at upload start, deleted on completion |
| `TProgressResult` | Progress API response | Created per progress request |
| `TMultiUploadResult` | Response for batch uploads | Created per multi-file request |
| `TValidationError` | Error details | Created when validation fails |

All types use `T` prefix per Ignis coding standards. All interfaces use `I` prefix.

---

## Key Changes from Previous Version

| Change | Description |
|--------|-------------|
| **Added `sanitizedFilename`** | Stores filename after sanitization (unsafe chars replaced with `_`) |
| **Added `UploadSession`** | New entity for server-side progress tracking |
| **Added `ProgressResult`** | Response type for `/api/upload/progress/:id` endpoint |
| **Added `enableProgressTracking`** | Configuration flag for enabling/disabling progress tracking |
| **Added `SESSION_NOT_FOUND`** | New error code for invalid upload IDs |
| **Updated `allowedFileTypes` default** | Explicitly `null` (no restrictions) per clarification |
