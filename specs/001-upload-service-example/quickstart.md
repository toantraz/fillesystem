# Upload Service Example - Quickstart

**Feature Branch**: `001-upload-service-example`
**Status**: Development (Updated with server-side progress tracking)

## Overview

The Upload Service Example demonstrates how to inject the FilesystemComponent into an Ignis REST API application to handle file uploads with server-side progress tracking. This example showcases:

- Dependency injection of FilesystemComponent
- Multipart/form-data file upload handling with Hono
- Single and multiple file uploads
- Server-side progress tracking with polling
- File type and size validation
- Filename sanitization (unsafe characters → underscore)
- Proper error handling with context

## Prerequisites

- Node.js 18+
- npm or bun
- Git

## Setup

### 1. Clone and Navigate

```bash
cd examples/upload-service-application
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using bun
bun install
```

### 3. Configure (Optional)

Edit `src/index.ts` to customize upload settings:

```typescript
const uploadConfig: TUploadConfiguration = {
  targetDirectory: "./uploads",           // Where files are stored
  autoCreateDirectory: true,              // Create dir if missing
  allowedFileTypes: null,                 // null = all types allowed
  maxFileSize: 100 * 1024 * 1024,         // 100MB max
  maxConcurrentUploads: 10,               // Concurrent upload limit
  enableProgressTracking: true,            // Enable progress endpoint
};
```

### 4. Build TypeScript

```bash
npm run build
```

## Running the Service

### Development Mode

```bash
npm run dev
```

The service starts at `http://localhost:3000`

### Production Mode

```bash
npm start
```

## Usage

### Web Interface

1. Open browser to `http://localhost:3000`
2. Select file(s) to upload
3. Click "Upload"
4. View progress bar and results

### REST API Examples

#### Single File Upload

```bash
# Upload and capture the X-Upload-Id header
UPLOAD_RESPONSE=$(curl -i -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf")

# Extract upload ID from response header
UPLOAD_ID=$(echo "$UPLOAD_RESPONSE" | grep -i "x-upload-id" | awk '{print $2}' | tr -d '\r')

echo "Upload ID: $UPLOAD_ID"

# Check progress
curl http://localhost:3000/api/upload/progress/$UPLOAD_ID
```

#### Upload to Subdirectory

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@photo.jpg" \
  -F "path=photos/vacation"
```

#### Multiple Files

```bash
curl -X POST http://localhost:3000/api/upload/batch \
  -F "files=@file1.jpg" \
  -F "files=@file2.jpg" \
  -F "files=@file3.jpg"
```

### JavaScript Example with Progress Polling

```javascript
// Upload file with server-side progress tracking
async function uploadFileWithProgress(file) {
  // Step 1: Start upload
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: async () => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Extract upload ID from response header
      const uploadId = response.headers.get('X-Upload-Id');
      return { response, uploadId };
    },
  });

  const { response: uploadResponse, uploadId } = await response.body.json();

  if (!uploadResponse.ok) {
    throw new Error(await uploadResponse.text());
  }

  // Step 2: Poll for progress
  const progressInterval = setInterval(async () => {
    const progressResponse = await fetch(`/api/upload/progress/${uploadId}`);

    if (!progressResponse.ok) {
      clearInterval(progressInterval);
      console.error('Progress check failed');
      return;
    }

    const progress = await progressResponse.json();

    // Update progress bar
    updateProgressBar(progress.percentage);

    // Check if complete
    if (progress.status === 'completed') {
      clearInterval(progressInterval);
      console.log('Upload complete!');
      const result = await uploadResponse.json();
      console.log('Stored at:', result.storagePath);
    } else if (progress.status === 'failed') {
      clearInterval(progressInterval);
      console.error('Upload failed');
    }
  }, 500); // Poll every 500ms

  return uploadResponse.json();
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
uploadFileWithProgress(fileInput.files[0])
  .then(result => console.log('Final result:', result))
  .catch(error => console.error('Upload failed:', error));
```

### XMLHttpRequest Example

```javascript
// XHR-based upload with progress polling
function uploadWithXHR(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    let uploadId = null;

    // Track upload completion to get upload ID
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        uploadId = xhr.getResponseHeader('X-Upload-Id');
        const result = JSON.parse(xhr.response);

        // Start polling for progress
        if (uploadId) {
          pollProgress(uploadId, result);
        }

        resolve(result);
      } else {
        reject(new Error(xhr.responseText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', '/api/upload');
    xhr.responseType = 'json';
    xhr.send(formData);
  });
}

function pollProgress(uploadId, finalResult) {
  const interval = setInterval(async () => {
    try {
      const response = await fetch(`/api/upload/progress/${uploadId}`);

      if (!response.ok) {
        clearInterval(interval);
        return;
      }

      const progress = await response.json();

      updateProgressBar(progress.percentage);

      if (progress.status === 'completed' || progress.status === 'failed') {
        clearInterval(interval);
        console.log('Progress final:', progress);
      }
    } catch (error) {
      clearInterval(interval);
      console.error('Progress polling error:', error);
    }
  }, 500);
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
uploadWithXHR(fileInput.files[0])
  .then(result => console.log('Upload complete:', result))
  .catch(error => console.error('Upload failed:', error));
```

## Project Structure

```
upload-service-application/
├── src/
│   ├── index.ts                          # Entry point
│   ├── app.ts                            # Ignis Application class
│   ├── controllers/
│   │   └── upload.controller.ts          # REST API route handlers
│   ├── services/
│   │   ├── upload-service.service.ts     # Upload handling with DI
│   │   └── upload-session.service.ts     # Session management for progress
│   ├── types/
│   │   ├── upload.types.ts               # Upload-specific types
│   │   ├── validation.types.ts           # Validation schema types
│   │   └── session.types.ts              # Upload session types
│   └── utils/
│       ├── file-validation.util.ts       # File type/size validation
│       └── filename-sanitizer.util.ts    # Filename sanitization
├── public/
│   ├── index.html                        # Web interface
│   └── upload.js                         # Frontend upload logic with polling
├── uploads/                              # Default target directory
├── package.json
├── tsconfig.json
└── README.md
```

## Key Patterns

### Dependency Injection

```typescript
// In upload-service.service.ts
import { Inject } from "@venizia/ignis";

export class UploadService {
  constructor(
    @Inject("filesystem.instance.default")
    private filesystem: Filesystem,
    private config: TUploadConfiguration,
  ) {}

  async uploadFile(file: File, path: string): Promise<TUploadResult> {
    // Sanitize filename
    const sanitized = sanitizeFilename(file.name);

    // Use injected filesystem instance
    const buffer = await file.arrayBuffer();
    const targetPath = join(this.config.targetDirectory, path, sanitized);

    await this.filesystem.writeFile(targetPath, Buffer.from(buffer));

    return {
      success: true,
      storagePath: targetPath,
      fileMetadata: {
        filename: sanitized,
        originalFilename: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    };
  }
}
```

### Session Management

```typescript
// In upload-session.service.ts
export class UploadSessionService {
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
      session.status = bytesReceived > 0 ? 'in_progress' : 'pending';
    }
  }

  completeSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (session) {
      session.status = 'completed';
      // Auto-delete after short TTL
      setTimeout(() => this.deleteSession(uploadId), 60000);
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
```

### Error Handling

```typescript
import { getError } from "@venizia/ignis";

try {
  await this.filesystem.writeFile(path, content);
} catch (error) {
  this.logger.error(`[UploadService][uploadFile] Upload failed: ${error.message}`);
  throw getError(
    "File upload failed",
    "UPLOAD_FAILED",
    { path: targetPath, originalError: error.message }
  );
}
```

### Logging Format

```typescript
this.logger.info("[UploadService][uploadFile] Starting upload", {
  filename: file.name,
  size: file.size,
  path: targetPath,
});
```

## API Endpoints

### POST /api/upload

Upload a single file.

**Request:** `multipart/form-data`
- `file`: The file (required)
- `path`: Subdirectory path (optional)

**Response Headers:**
- `X-Upload-Id`: Upload session identifier for progress tracking

**Response:** `200 OK`
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

### POST /api/upload/batch

Upload multiple files.

**Request:** `multipart/form-data`
- `files[]`: Files (required, multiple)
- `path`: Subdirectory path (optional)

**Response:** `200 OK`
```json
{
  "totalFiles": 3,
  "successfulUploads": 2,
  "failedUploads": 1,
  "results": [...]
}
```

### GET /api/upload/progress/:uploadId

Get upload progress.

**Parameters:**
- `uploadId`: Upload session identifier (from X-Upload-Id header)

**Response:** `200 OK`
```json
{
  "uploadId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "percentage": 45,
  "bytesReceived": 4500000,
  "totalBytes": 10000000,
  "status": "in_progress"
}
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Form data validation failed | 400 |
| `FILE_TOO_LARGE` | File exceeds maxFileSize | 413 |
| `INVALID_FILE_TYPE` | File type not allowed | 415 |
| `UPLOAD_FAILED` | Generic upload failure | 500 |
| `FILE_WRITE_ERROR` | Error writing to storage | 500 |
| `SESSION_NOT_FOUND` | Upload session not found | 404 |

## Development

### Run Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Troubleshooting

### Upload Progress Not Updating

- Check that `enableProgressTracking: true` in config
- Verify the upload ID from `X-Upload-Id` header
- Sessions are deleted after 60 seconds - poll frequently

### Files Not Appearing

- Check `targetDirectory` path in config
- Ensure write permissions on the directory
- Check logs for error messages

### Upload Fails with "File Too Large"

- Increase `maxFileSize` in config
- Or compress the file before uploading

## Next Steps

- Extend with S3 storage by changing adapter config
- Add authentication/authorization middleware
- Implement file deduplication
- Add thumbnail generation for images
- Create admin interface for file management
- Replace in-memory sessions with Redis for multi-instance deployments

## References

- [OpenAPI Specification](./contracts/openapi.yaml)
- [Data Model](./data-model.md)
- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Findings](./research.md)
