# Upload Service Example

An example upload service REST API demonstrating FilesystemComponent integration with the @venizia/ignis framework and Hono web server.

## Features

- Single file upload via POST /api/upload
- Multiple file upload via POST /api/upload/batch
- Server-side progress tracking via GET /api/upload/progress/:id
- File type and size validation (configurable)
- Filename sanitization (unsafe characters → underscore)
- Web interface for browser-based uploads
- Proper error handling with Ignis coding standards

## Quick Start

```bash
# Install dependencies
bun install
# OR: npm install

# Build TypeScript
bun run build
# OR: npm run build

# Run in development mode
bun run dev
# OR: npm run dev

# Run in production mode
bun start
# OR: npm start
```

The service will start at `http://localhost:3000`

**Requirements:**
- **Bun >= 1.3.0** (recommended - faster startup and runtime)
- **Node.js >= 18.0.0** (alternative runtime)

**Note:** The application code is fully Bun-compatible. However, the Ignis framework includes an MQTT module that has CommonJS dependencies which may cause warnings when running with Bun. These warnings do not affect the upload service functionality. If you encounter any issues, Node.js is recommended as an alternative runtime.

## Configuration

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

## API Endpoints

### POST /api/upload

Upload a single file.

**Request:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf" \
  -F "path=subfolder" \
  -D -
```

**Response Headers:**
- `X-Upload-Id`: Upload session identifier for progress tracking

**Success Response:** `200 OK`
```json
{
  "success": true,
  "storagePath": "/uploads/subfolder/document.pdf",
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

**Error Response - File Too Large:** `413 Payload Too Large`
```json
{
  "success": false,
  "storagePath": null,
  "errorMessage": "File size exceeds 104857600 bytes",
  "errorCode": "FILE_TOO_LARGE",
  "fileMetadata": null
}
```

**Error Response - Invalid File Type:** `415 Unsupported Media Type`
```json
{
  "success": false,
  "storagePath": null,
  "errorMessage": "File type application/pdf not allowed",
  "errorCode": "INVALID_FILE_TYPE",
  "fileMetadata": null
}
```

### POST /api/upload/batch

Upload multiple files with partial success support.

**Request:**
```bash
curl -X POST http://localhost:3000/api/upload/batch \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@document.pdf" \
  -D -
```

**Response:** `200 OK`
```json
{
  "totalFiles": 3,
  "successfulUploads": 2,
  "failedUploads": 1,
  "results": [
    {
      "success": true,
      "storagePath": "/uploads/photo1.jpg",
      "errorMessage": null,
      "errorCode": null,
      "fileMetadata": {
        "filename": "photo1.jpg",
        "originalFilename": "photo1.jpg",
        "size": 1024000,
        "contentType": "image/jpeg",
        "uploadedAt": "2025-12-26T10:30:45.123Z"
      }
    },
    {
      "success": true,
      "storagePath": "/uploads/photo2.jpg",
      "errorMessage": null,
      "errorCode": null,
      "fileMetadata": {
        "filename": "photo2.jpg",
        "originalFilename": "photo2.jpg",
        "size": 2048000,
        "contentType": "image/jpeg",
        "uploadedAt": "2025-12-26T10:30:46.456Z"
      }
    },
    {
      "success": false,
      "storagePath": null,
      "errorMessage": "File size exceeds 104857600 bytes",
      "errorCode": "FILE_TOO_LARGE",
      "fileMetadata": null
    }
  ]
}
```

### GET /api/upload/progress/:uploadId

Get upload progress for an active upload session.

**Request:**
```bash
curl http://localhost:3000/api/upload/progress/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

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

**Status values:**
- `pending`: Upload session created, not started
- `in_progress`: Upload is in progress
- `completed`: Upload finished successfully
- `failed`: Upload failed

**Error Response - Session Not Found:** `404 Not Found`
```json
{
  "success": false,
  "errorMessage": "Upload session not found",
  "errorCode": "SESSION_NOT_FOUND",
  "context": { "uploadId": "invalid-id" }
}
```

## Complete cURL Examples

### Single File Upload with Progress Tracking

```bash
# Upload file and capture upload ID from response header
UPLOAD_RESPONSE=$(curl -X POST http://localhost:3000/api/upload \
  -F "file=@large-file.zip" \
  -D -)

# Extract upload ID
UPLOAD_ID=$(echo "$UPLOAD_RESPONSE" | grep -i "x-upload-id" | awk '{print $2}' | tr -d '\r')

# Poll for progress
watch -n 0.5 "curl -s http://localhost:3000/api/upload/progress/$UPLOAD_ID | jq"
```

### Upload with Custom Subdirectory

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@report.pdf" \
  -F "path=reports/2025"
```

### Multiple File Upload with Mixed Results

```bash
curl -X POST http://localhost:3000/api/upload/batch \
  -F "files=@image1.png" \
  -F "files=@image2.jpg" \
  -F "files=@huge-file.zip" \
  -F "files=@document.pdf" | jq
```

### Upload to Subdirectory via Batch

```bash
curl -X POST http://localhost:3000/api/upload/batch \
  -F "files=@file1.txt" \
  -F "files=@file2.txt" \
  -F "path=documents" | jq
```

## Error Codes

| Code | Description | HTTP Status | Example Scenario |
|------|-------------|-------------|------------------|
| `VALIDATION_ERROR` | Form data validation failed | 400 | No file provided |
| `FILE_TOO_LARGE` | File exceeds maxFileSize | 413 | Uploading 150MB when limit is 100MB |
| `INVALID_FILE_TYPE` | File type not allowed | 415 | PDF when only images allowed |
| `UPLOAD_FAILED` | Generic upload failure | 500 | Network interruption |
| `FILE_WRITE_ERROR` | Error writing to storage | 500 | Insufficient disk space |
| `DIRECTORY_NOT_FOUND` | Target directory cannot be created | 500 | Permission denied |
| `SESSION_NOT_FOUND` | Upload session not found | 404 | Invalid upload ID |

## Storage Adapter Configuration

### Using Local Storage (Default)

```typescript
// src/index.ts
const filesystemConfig: FilesystemConfig = {
  type: "local",
  local: {
    basePath: path.join(process.cwd(), "uploads"),
    createMissingDirs: true,
  },
};
```

### Using S3-Compatible Storage (MinIO/AWS)

To use S3-compatible storage:

1. Install AWS SDK dependencies:
```bash
npm install @aws-sdk/client-s3
```

2. Update `src/index.ts`:
```typescript
import type { FilesystemConfig } from "@ignis/filesystem";

const filesystemConfig: FilesystemConfig = {
  type: "s3",
  s3: {
    region: "us-east-1",
    bucket: "my-upload-bucket",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
    },
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000", // MinIO
    forcePathStyle: true, // Required for MinIO
  },
};
```

3. Run with environment variables:
```bash
# For MinIO (local testing)
S3_ENDPOINT=http://localhost:9000 \
AWS_ACCESS_KEY_ID=minioadmin \
AWS_SECRET_ACCESS_KEY=minioadmin \
npm start

# For AWS S3
AWS_ACCESS_KEY_ID=your-key \
AWS_SECRET_ACCESS_KEY=your-secret \
npm start
```

## Edge Case Handling

The service handles the following edge cases:

- **T061**: Duplicate filenames - Last write wins (existing file is overwritten)
- **T062**: Network interruption - Partial files are automatically cleaned up
- **T063**: Insufficient disk space - Returns `FILE_WRITE_ERROR` with clear message
- **T064**: Files without extensions - Accepted as-is
- **T065**: Directory upload attempts - Rejected with "Only files are allowed"
- **T066**: Session cleanup - Completed sessions expire after 60 seconds

## Development

```bash
# Type checking
bun run type-check

# Build
bun run build

# Clean build artifacts
bun run clean

# Development with hot reload
bun run dev
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
│   └── upload.js                         # Frontend upload logic
├── uploads/                              # Default target directory
└── package.json
```

## Patterns Demonstrated

- **Dependency Injection**: Manual DI with `bind()` for services
- **Service Layer**: Business logic separation with UploadService
- **Session Management**: In-memory Map for progress tracking
- **Error Handling**: `getError()` with context and proper error codes
- **Logging**: `[ClassName][methodName]` format per Ignis standards
- **File Naming**: kebab-case with type suffix (e.g., `upload-service.service.ts`)
