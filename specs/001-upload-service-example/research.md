# Research: Upload Service Example

**Feature**: Upload Service Example
**Date**: 2025-12-26
**Status**: Complete (Updated with server-side progress tracking)

## Overview

This document consolidates research findings for implementing the upload service example application with server-side progress tracking. All technical decisions are documented with rationale and alternatives considered.

---

## RQ-1: Multipart/Form-Data Handling in Hono

**Decision**: Use Hono's built-in `parseBody()` utility function

### Rationale

- Hono has native support for multipart/form-data via `c.req.parseBody()`
- Official documentation demonstrates this approach
- No additional dependencies required
- Files are returned as `File` objects with `name`, `type`, and `ArrayBuffer` content
- Supports multiple file uploads through repeated field names

### Implementation Pattern

```typescript
// Parse multipart form data
const body = await c.req.parseBody({ all: true });

// Single file upload
const file = body['file'] as File;

// Multiple file uploads (when same field name used multiple times)
const files = body['files'] as File[];
```

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| `multer` package | Mature, widely used | Express-focused, extra dependency | Hono has native support |
| `@hono/zod-validator` | Type-safe validation | Not designed for file handling | Files aren't JSON-serializable |
| Custom streaming | Maximum control | Complex implementation | Overkill for example |

### Sources

- [Hono Official - File Upload](https://hono.dev/examples/file-upload)
- [Hono文件上传：多部分表单数据处理](https://blog.csdn.net/gitblog_00496/article/details/151112918)
- [Hono Best Practices](https://hono.dev/docs/guides/best-practices)

---

## RQ-2: File Validation Strategy

**Decision**: Two-layer validation - Zod for metadata fields, service layer for file content validation

### Rationale

- **Zod** excels at validating JSON-serializable data (form fields, config options)
- **Service layer** is required for file content validation (size, type detection from magic bytes)
- Separation of concerns: metadata validation at controller level, file validation at service level
- Consistent with existing examples pattern (service layer contains business logic)

### Implementation Pattern

```typescript
// Controller layer - Validate form metadata with Zod
const uploadSchema = z.object({
  file: z.instanceof(File),
  path: z.string().optional(),
});

const result = uploadSchema.safeParse({ file, path });
if (!result.success) {
  throw getError("Invalid form data", "VALIDATION_ERROR", result.error);
}

// Service layer - Validate file content
class UploadService {
  validateFileSize(file: File, maxSize: number): void {
    if (file.size > maxSize) {
      throw getError(
        `File size exceeds ${maxSize} bytes`,
        "FILE_TOO_LARGE",
        { size: file.size, maxSize }
      );
    }
  }

  validateFileType(file: File, allowedTypes: string[] | null): void {
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw getError(
        `File type ${file.type} not allowed`,
        "INVALID_FILE_TYPE",
        { fileType: file.type, allowedTypes }
      );
    }
  }
}
```

### Security Considerations

- **File type validation**: Don't rely solely on file extension; check `file.type` from MIME header
- **Size validation**: Check `file.size` before reading content to prevent memory exhaustion
- **Filename sanitization**: Use path utilities to prevent directory traversal attacks
- **Magic byte validation** (advanced): Read first few bytes to detect actual file type

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Zod for everything | Single validation layer | Zod can't validate File objects | Files aren't JSON-serializable |
| Middleware validation | Reusable across endpoints | Hard to access request body early | Body not parsed yet |
| Client-side only | Reduces server load | Can be bypassed | Not secure |

### Sources

- [Hono Validation Documentation](https://hono.dev/docs/guides/validation)
- [Hacking Hono: Validation Middleware](https://dev.to/fiberplane/hacking-hono-the-ins-and-outs-of-validation-middleware-2jea)
- [GitHub Issue: Multi-field Validation](https://github.com/honojs/middleware/issues/906)
- [Building Production-Ready Hono APIs](https://medium.com/@yannick.burkard/building-production-ready-hono-apis-a-modern-architecture-guide-fed8a415ca96)

---

## RQ-3: Upload Progress Tracking (UPDATED - Server-Side)

**Decision**: Server-side progress endpoint with in-memory session storage and custom request wrapper

### Rationale (Updated per user clarification)

User explicitly chose **Option B** during clarification: Server-side progress endpoint (`/api/upload/progress/:id`) returning upload percentage. This requires:

1. **Session storage**: In-memory Map storing upload sessions by UUID
2. **Progress tracking**: Custom Hono middleware to track bytes received during multipart parsing
3. **Client polling**: Frontend polls `/api/upload/progress/:id` endpoint periodically

### Implementation Pattern

```typescript
// Session service for tracking uploads
class UploadSessionService {
  private sessions = new Map<string, TUploadSession>();

  createSession(totalBytes: number): string {
    const uploadId = crypto.randomUUID();
    this.sessions.set(uploadId, {
      uploadId,
      bytesReceived: 0,
      totalBytes,
      startTime: Date.now(),
      status: 'pending',
    });
    return uploadId;
  }

  updateProgress(uploadId: string, bytesReceived: number): void {
    const session = this.sessions.get(uploadId);
    if (session) {
      session.bytesReceived = bytesReceived;
    }
  }

  getProgress(uploadId: string): TProgressResult | null {
    const session = this.sessions.get(uploadId);
    if (!session) return null;
    return {
      uploadId: session.uploadId,
      percentage: Math.round((session.bytesReceived / session.totalBytes) * 100),
      bytesReceived: session.bytesReceived,
      totalBytes: session.totalBytes,
      status: session.status,
    };
  }
}

// Custom middleware for tracking upload progress
async function trackUploadProgress(c: Context, next: Next) {
  const contentLength = parseInt(c.req.header('content-length') || '0');
  const uploadId = c.req.header('X-Upload-Id') || crypto.randomUUID();

  // Create session
  const sessionService = await c.get('uploadSessionService');
  sessionService.createSession(contentLength);

  // Track bytes received (simplified - actual implementation would stream)
  let bytesReceived = 0;
  const originalJson = c.req.json;
  c.req.json = async () => {
    const result = await originalJson.call(c.req);
    bytesReceived = contentLength; // In reality, track during streaming
    sessionService.updateProgress(uploadId, bytesReceived);
    return result;
  };

  await next();
}
```

### Client-Side Polling Pattern

```javascript
// Frontend polls for progress updates
async function uploadWithProgress(file) {
  const xhr = new XMLHttpRequest();

  // Start upload
  xhr.open('POST', '/api/upload');
  xhr.setRequestHeader('X-Upload-Id', uploadId);

  // Poll for progress
  const progressInterval = setInterval(async () => {
    const response = await fetch(`/api/upload/progress/${uploadId}`);
    const data = await response.json();
    updateProgressBar(data.percentage);

    if (data.status === 'completed' || data.status === 'failed') {
      clearInterval(progressInterval);
    }
  }, 500); // Poll every 500ms

  xhr.send(formData);
}
```

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Client-side XHR progress | Native, simple | User explicitly chose server-side | User preference |
| WebSocket progress | Real-time bidirectional | Complex setup | Unidirectional needed |
| Server-Sent Events | Server push updates | Requires separate endpoint | Polling is sufficient |
| Redis for sessions | Persistent, distributed | Extra dependency | Overkill for example |

### Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Tracking bytes during Hono parsing | Custom middleware wrapping parseBody() |
| Concurrent session access | Map is thread-safe in Node.js single-threaded model |
| Session cleanup | TTL-based cleanup or delete on completion |
| Memory leaks | Clear sessions after completion/timeout |

---

## RQ-4: Concurrent Upload Handling

**Decision**: Rely on Node.js async/await with filesystem write locks from adapter

### Rationale

- Node.js handles concurrent requests via event loop
- Filesystem writes are handled by adapter (LocalAdapter or S3Adapter)
- LocalAdapter uses Node.js `fs.promises` which is thread-safe for operations
- S3Adapter uses AWS SDK which handles concurrent uploads internally
- No additional synchronization needed for the example scope
- If multiple users upload to same filename, "last write wins" (per FR-204)

### Concurrency Patterns

```typescript
// Service handles each upload independently
async uploadFile(file: File, targetPath: string): Promise<TUploadResult> {
  // Each request gets its own async context
  // Filesystem adapter handles write serialization
  await this.filesystem.writeFile(targetPath, buffer);
  return { success: true, path: targetPath };
}
```

### Edge Cases Handled

- **Duplicate filename**: Overwrites existing file (FR-204)
- **Partial upload**: Node.js/Hono handles connection errors cleanly
- **Disk full**: Adapter throws error which we propagate with context

---

## RQ-5: Web UI Framework

**Decision**: Vanilla JavaScript (no framework)

### Rationale

- Existing examples don't have web UIs
- Keeps example focused on backend patterns
- No additional build steps or dependencies
- Demonstrates that Hono/Ignis works with any frontend
- Simpler for developers to understand and modify

---

## RQ-6: Filename Sanitization (NEW)

**Decision**: Replace unsafe characters with underscore

### Rationale

Per user clarification (Option B): Replace unsafe characters with underscore. This approach:
- Preserves readability of filenames
- Ensures filesystem safety
- Prevents path traversal attacks
- Common pattern across file upload systems

### Implementation Pattern

```typescript
function sanitizeFilename(filename: string): string {
  const unsafeChars = /[<>:"/\\|?*#@]/g;
  return filename.replace(unsafeChars, '_');
}

// Examples:
// "my@file#.pdf" → "my_file_.pdf"
// "report:final.docx" → "report_final.docx"
// "data/file.txt" → "data_file.txt"
```

### Unsafe Characters

- Windows: `<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`
- Additional: `@`, `#` (per clarification)
- Path separators: `/`, `\` (prevent directory traversal)

---

## RQ-7: Upload ID Communication (NEW)

**Decision**: Return upload ID in `X-Upload-Id` response header

### Rationale

Per user clarification (Option A): Upload ID returned in `X-Upload-Id` response header, body contains final result. This:
- Separates metadata (header) from data (body)
- Allows header-based client-side tracking
- Keeps response body clean for final results

### Implementation Pattern

```typescript
// In controller
const uploadId = sessionService.createSession(file.size);

// ... perform upload ...

// Return response with header
return c.json({
  success: true,
  storagePath: targetPath,
  // ... other fields
}, 200, {
  'X-Upload-Id': uploadId
});
```

---

## Summary of Technology Choices

| Area | Decision | Justification |
|------|----------|---------------|
| **Framework** | @venizia/ignis with Hono | Project standard, built-in support |
| **Multipart handling** | Hono `parseBody()` | Native, no extra deps |
| **Validation** | Zod (metadata) + Service layer (files) | Type-safe, separation of concerns |
| **Progress tracking** | Server-side endpoint + in-memory sessions | User choice (Option B) |
| **Upload ID** | `X-Upload-Id` response header | User choice (Option A) |
| **Concurrency** | Node.js async/await | Event loop handles it |
| **Filename sanitization** | Replace unsafe chars with underscore | User choice (Option B) |
| **Frontend** | Vanilla JS | Simple, no build step |
| **Session storage** | In-memory Map | Sufficient for example |

---

## Open Questions (None)

All research questions have been resolved. Proceeding to Phase 1 design artifacts.
