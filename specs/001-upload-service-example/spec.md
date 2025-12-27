# Feature Specification: Upload Service Example

**Feature Branch**: `001-upload-service-example`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Implement an example to act as upload service. It inject filesysem to store file to target directory."

## Clarifications

### Session 2025-12-26

- Q: What security posture should this example application demonstrate? → A: Minimal security only (no auth, no rate limiting, basic validation only - simplest for learning)
- Q: What is the default file type validation behavior? → A: No default restrictions (accept all file types by default, configurable via `allowedFileTypes`)
- Q: How should filename sanitization handle unsafe characters? → A: Replace unsafe characters with underscore (e.g., "my@file#.pdf" → "my_file_.pdf")
- Q: How should upload progress tracking be implemented? → A: Server-side progress endpoint (`/api/upload/progress/{id}` returning upload percentage)
- Q: How should the upload ID be communicated to the client? → A: Return upload ID in `X-Upload-Id` response header, body contains final result

## Technology Stack

- **Framework**: @venizia/ignis (application framework with dependency injection)
- **Web Server**: Hono (HTTP router integrated with Ignis)
- **Language**: TypeScript 5.0+ (Node.js 18+)
- **Validation**: Zod
- **Storage**: FilesystemComponent with LocalAdapter (extensible to S3Adapter)

## REST API Structure

### Application Architecture

```
examples/upload-service-application/
├── src/
│   ├── index.ts                    # Entry point - creates and starts Application
│   ├── app.ts                      # Application class extends BaseApplication
│   ├── controllers/
│   │   └── upload.controller.ts    # REST API route handlers
│   ├── services/
│   │   └── upload-service.service.ts  # Business logic with DI
│   └── types/
│       └── upload.types.ts         # TypeScript type definitions
├── public/
│   └── index.html                  # Web interface
└── uploads/                        # Default target directory
```

### Application Lifecycle

1. **Bootstrap** (`index.ts`): Create Application instance with FilesystemConfig
2. **Configuration** (`app.ts`):
   - `getProjectRoot()`: Return project directory
   - `getAppInfo()`: Return package.json info
   - `setupMiddlewares()`: Configure CORS, static serving
   - `preConfigure()`: Register FilesystemComponent
   - `postConfigure()`: Register REST API routes
3. **Request Handling**: Hono routes → Controller → Service (with injected Filesystem)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Single File Upload (Priority: P1)

A user wants to upload a single file through a web interface and have it stored in a configured target directory using the filesystem component.

**Why this priority**: This is the core functionality - without single file upload working, there is no viable product. Users must be able to store at least one file to consider the service functional.

**Independent Test**: Can be tested by uploading one file through the web interface and verifying it appears in the target directory with correct filename and content.

**Acceptance Scenarios**:

1. **Given** the upload service is running, **When** a user uploads a valid file via the web form, **Then** the file is stored in the configured target directory with its original filename
2. **Given** a file upload is in progress, **When** the upload completes successfully, **Then** the user receives a success confirmation with the stored file path
3. **Given** the target directory does not exist, **When** a file is uploaded, **Then** the directory is created automatically (if configured) and the file is stored

---

### User Story 2 - Multiple File Upload (Priority: P2)

A user wants to upload multiple files at once through a web interface and have all files stored in the target directory.

**Why this priority**: After single file upload works, users will want efficiency of uploading multiple files simultaneously. This is a natural extension but not required for MVP.

**Independent Test**: Can be tested by selecting multiple files in the upload form and verifying all are stored in the target directory.

**Acceptance Scenarios**:

1. **Given** the upload service is running, **When** a user selects and uploads 5 files at once, **Then** all 5 files are stored in the target directory
2. **Given** a multi-file upload is in progress, **When** one file fails to upload, **Then** the other files continue uploading and the user is notified which file(s) failed

---

### User Story 3 - File Type and Size Validation (Priority: P3)

A user wants the upload service to validate file types and sizes before storage, preventing invalid or oversized files from being stored.

**Why this priority**: This is important for production use but not required for a basic working example. Users can work without validation initially.

**Independent Test**: Can be tested by attempting to upload files with invalid extensions or oversized files and verifying they are rejected with appropriate error messages.

**Acceptance Scenarios**:

1. **Given** file type validation is configured for "images only", **When** a user uploads a PDF file, **Then** the upload is rejected with an error message indicating invalid file type
2. **Given** a max file size of 10MB is configured, **When** a user attempts to upload a 15MB file, **Then** the upload is rejected with an error message indicating the file exceeds the size limit
3. **Given** a valid file within size and type constraints, **When** uploaded, **Then** the file is successfully stored

---

### Edge Cases

- **Duplicate filename**: Existing file is overwritten (last write wins)
- **Network interruption during upload**: Partial file is cleaned up, error returned to user
- **Insufficient disk space**: Upload fails with appropriate error message, no partial file stored
- **File with no extension**: File is accepted and stored as-is
- **Special characters in filename**: Unsafe characters (e.g., `<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`, `@`, `#`) are replaced with underscore, safe characters preserved
- **Directory upload instead of file**: Upload is rejected with error indicating only files are allowed

## Requirements _(mandatory)_

### Functional Requirements

#### Application Architecture (Ignis Framework)

- **FR-001**: Application MUST extend `BaseApplication` from @venizia/ignis
- **FR-002**: Application MUST register `FilesystemComponent` using the component registration pattern in `preConfigure()`
- **FR-003**: Application MUST inject `Filesystem` instance via `@Inject("filesystem.instance.default")` decorator in service classes
- **FR-004**: Application MUST use Hono for HTTP routing with `server.use()` middleware pattern
- **FR-005**: Application MUST implement `setupMiddlewares()` for CORS and other middleware
- **FR-006**: Application MUST follow Ignis coding standards (kebab-case files, [ClassName][methodName] logging, I/T prefix types)

#### Upload API Endpoints

- **FR-101**: System MUST provide `POST /api/upload` endpoint for single file uploads
- **FR-102**: System MUST provide `POST /api/upload/batch` endpoint for multiple file uploads
- **FR-103**: System MUST provide `GET /api/upload/progress/:id` endpoint for upload progress tracking
- **FR-104**: System MUST return upload ID in `X-Upload-Id` response header for progress tracking
- **FR-105**: System MUST accept file uploads through HTTP POST with `multipart/form-data` encoding
- **FR-106**: System MUST use Hono's `parseBody()` utility for parsing multipart form data
- **FR-107**: System MUST return JSON responses with appropriate HTTP status codes

#### File Storage Operations

- **FR-201**: System MUST store uploaded files in a configured target directory
- **FR-202**: System MUST preserve the original filename of uploaded files
- **FR-203**: System MUST create the target directory if it doesn't exist (auto-create option)
- **FR-204**: System MUST overwrite existing files when a duplicate filename is uploaded (last write wins)
- **FR-205**: System MUST use the injected Filesystem instance for all storage operations

#### Validation and Error Handling

- **FR-301**: System MUST validate that uploaded data contains a file
- **FR-302**: System MUST validate file size against configured maximum
- **FR-303**: System MUST validate file type against configured allowed types (if specified)
- **FR-304**: System MUST return appropriate error responses using Ignis `getError()` with context
- **FR-305**: System MUST log all operations using `[ClassName][methodName]` format

#### Concurrency and Performance

- **FR-401**: System MUST handle concurrent file uploads from multiple users
- **FR-402**: System MUST support server-side upload progress tracking via `GET /api/upload/progress/:id` endpoint
- **FR-403**: Progress endpoint MUST return upload percentage and bytes received/total

#### Web Interface

- **FR-501**: System MUST provide a web interface for file uploads via static file serving
- **FR-502**: System MUST use Hono's `serveStatic` middleware for serving static assets

### Key Entities

- **UploadedFile**: Represents a file uploaded through the service. Attributes include: original filename, file size, content type, storage path, upload timestamp, upload status.
- **UploadConfiguration**: Represents service settings. Attributes include: target directory path, auto-create directory flag, allowed file types (default: `null` = all types accepted), maximum file size (default: 100MB).
- **UploadResult**: Represents the outcome of an upload operation. Attributes include: success status, stored file path, error message (if failed), file metadata.
- **UploadSession**: Represents an active upload for progress tracking. Attributes include: upload ID (UUID), bytes received, total bytes, start timestamp, completion status.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can successfully upload a file and see confirmation within 3 seconds on a standard connection
- **SC-002**: Service can handle 10 concurrent file uploads without errors
- **SC-003**: 100% of uploaded files are stored in the correct target directory with correct filenames
- **SC-004**: Upload progress is visible to users during file transfer (for files larger than 1MB)
- **SC-005**: Error messages are clear and actionable for 100% of failed upload scenarios

### Assumptions

- The @venizia/ignis framework is installed and configured
- The FilesystemComponent is available from the filesystem package
- Hono web server is integrated with Ignis via the built-in server instance
- File uploads are within reasonable size limits (up to 100MB per file)
- Target directory is on local filesystem (LocalAdapter) or compatible S3 bucket (S3Adapter)
- No authentication/authorization is required for this example (public upload service)
- No rate limiting is implemented (minimal security for learning purposes)
- Application follows the existing example pattern (`local-storage-application`, `s3-minio-application`)
