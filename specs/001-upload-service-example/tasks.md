# Implementation Tasks: Upload Service Example

**Feature**: Upload Service Example - REST API with server-side progress tracking
**Branch**: `001-upload-service-example`
**Status**: Ready for Implementation

## Overview

This document contains all implementation tasks organized by user story priority. Each phase represents an independently testable increment that delivers value.

**Total Tasks**: 37
**Estimated MVP**: Phase 1-3 (Tasks 001-019) - Single file upload with progress tracking

---

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies

### Implementation Tasks

- [X] T001 Create example application directory structure at `examples/upload-service-application/`
- [X] T002 Create `package.json` with dependencies: @venizia/ignis, hono, zod, @types/node, typescript
- [X] T003 Create `tsconfig.json` extending root configuration with strict mode enabled
- [X] T004 Create `.gitignore` entries for `node_modules/`, `uploads/`, `dist/`
- [X] T005 Create `README.md` with quickstart instructions and API documentation
- [X] T006 Create `src/types/` directory for type definitions
- [X] T007 Create `src/utils/` directory for utility functions
- [X] T008 Create `src/services/` directory for business logic
- [X] T009 Create `src/controllers/` directory for route handlers
- [X] T010 Create `public/` directory for web interface assets

**Phase 1 Deliverable**: Ready-to-compile project structure with all directories and configuration files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Implement core infrastructure that all user stories depend on

### Implementation Tasks

- [X] T011 [P] Create `src/types/upload.types.ts` with TUploadConfiguration, TUploadResult, TFileMetadata types
- [X] T012 [P] Create `src/types/session.types.ts` with TUploadSession, TProgressResult, TSessionStatus types
- [X] T013 [P] Create `src/types/validation.types.ts` with TValidationError type
- [X] T014 [P] Create `src/utils/filename-sanitizer.util.ts` with sanitizeFilename() function replacing unsafe chars with underscore
- [X] T015 [P] Create `src/utils/file-validation.util.ts` with validateFileSize() and validateFileType() functions
- [X] T016 Create `src/services/upload-session.service.ts` with session management (createSession, updateProgress, getProgress, completeSession)
- [X] T017 Create `src/app.ts` extending BaseApplication with preConfigure(), setupMiddlewares(), getProjectRoot(), getAppInfo()
- [X] T018 Implement FilesystemComponent registration in `src/app.ts` preConfigure() method

**Phase 2 Deliverable**: Shared types, utilities, session service, and application shell ready for endpoint implementation.

**Parallel Opportunities**: T011-T015 can be done in parallel (different files, no dependencies).

---

## Phase 3: User Story 1 - Single File Upload (P1)

**Story Goal**: User can upload a single file through web interface and have it stored in target directory

**Independent Test Criteria**:
1. Upload service is running
2. User uploads a valid file via web form
3. File is stored in configured target directory with correct filename and content
4. User receives success confirmation with stored file path
5. Target directory is auto-created if it doesn't exist

### Implementation Tasks

- [X] T019 [P] [US1] Create `src/services/upload-service.service.ts` class with @Inject("filesystem.instance.default") for Filesystem DI
- [X] T020 [P] [US1] Implement UploadService constructor accepting TUploadConfiguration parameter
- [X] T021 [P] [US1] Implement UploadService.validateFile() method checking file exists, size limits, type restrictions
- [X] T022 [US1] Implement UploadService.uploadFile() method with filename sanitization, filesystem writeFile(), error handling
- [X] T023 [US1] Add [UploadService][uploadFile] logging format with file metadata context
- [X] T024 [US1] Implement UploadService.handleError() method using getError() with proper error codes (FILE_TOO_LARGE, INVALID_FILE_TYPE, UPLOAD_FAILED)
- [X] T025 [US1] Create `src/controllers/upload.controller.ts` with Hono router for /api/upload endpoint
- [X] T026 [US1] Implement POST /api/upload handler using c.req.parseBody() to extract file and optional path
- [X] T027 [US1] Add UploadSessionService.createSession() call before upload, extract uploadId
- [X] T028 [US1] Call UploadService.uploadFile() with file, path, and uploadId
- [X] T029 [US1] Return JSON response with TUploadResult including success, storagePath, fileMetadata
- [X] T030 [US1] Set X-Upload-Id response header with uploadId for progress tracking
- [X] T031 [US1] Add session completion via UploadSessionService.completeSession() after successful upload
- [X] T032 [US1] Implement GET /api/upload/progress/:uploadId endpoint in upload.controller.ts
- [X] T033 [US1] Add progress endpoint logic calling UploadSessionService.getProgress() and returning TProgressResult
- [X] T034 [US1] Handle 404 response when uploadId not found (SESSION_NOT_FOUND error)
- [X] T035 [US1] Register upload routes in `src/app.ts` postConfigure() using server.use() with upload controller
- [X] T036 [US1] Create `src/index.ts` entry point instantiating Application with FilesystemConfig and calling app.start()
- [X] T037 [US1] Implement auto-create directory logic in UploadService.uploadFile() checking if directory exists before write
- [X] T038 [US1] Create `public/index.html` with file input form and upload button
- [X] T039 [US1] Create `public/upload.js` with uploadWithProgress() function using fetch/XHR
- [X] T040 [US1] Add progress polling logic in upload.js calling /api/upload/progress/:uploadId every 500ms
- [X] T041 [US1] Configure static file serving in app.ts setupMiddlewares() using serveStatic middleware for public/

**Phase 3 Deliverable**: Working single file upload with server-side progress tracking via web interface.

**Parallel Opportunities**: T019-T021 (service setup), T038-T040 (frontend) can be done in parallel.

---

## Phase 4: User Story 2 - Multiple File Upload (P2)

**Story Goal**: User can upload multiple files at once through web interface

**Independent Test Criteria**:
1. Upload service is running
2. User selects and uploads 5 files at once
3. All 5 files are stored in target directory
4. If one file fails, other files continue uploading
5. User is notified which file(s) failed

### Implementation Tasks

- [ ] T042 [P] [US2] Create POST /api/upload/batch endpoint in upload.controller.ts
- [ ] T043 [US2] Implement batch handler parsing multiple files using c.req.parseBody({ all: true })
- [ ] T044 [US2] Add iteration logic processing each file independently through UploadService.uploadFile()
- [ ] T045 [US2] Implement try-catch per file allowing failures to continue without stopping batch
- [ ] T046 [US2] Aggregate results into TMultiUploadResult with totalFiles, successfulUploads, failedUploads, results array
- [ ] T047 [US2] Set X-Upload-Id header with first file's uploadId for progress tracking
- [ ] T048 [US2] Return JSON response with TMultiUploadResult including individual results per file
- [ ] T049 [US2] Update `public/index.html` form to accept multiple files (multiple attribute on file input)
- [ ] T050 [US2] Update `public/upload.js` to handle multiple files with FormData

**Phase 4 Deliverable**: Multiple file upload with partial success support.

**Parallel Opportunities**: T042-T043 (endpoint), T049-T050 (frontend) can be done in parallel.

---

## Phase 5: User Story 3 - File Type and Size Validation (P3)

**Story Goal**: Upload service validates file types and sizes before storage

**Independent Test Criteria**:
1. File type validation configured for "images only" rejects PDF upload with error message
2. Max file size of 10MB configured rejects 15MB file with error message
3. Valid file within constraints is successfully stored

### Implementation Tasks

- [X] T051 [P] [US3] Implement validateFileSize() in file-validation.util.ts throwing error if file.size > config.maxFileSize
- [X] T052 [P] [US3] Implement validateFileType() in file-validation.util.ts throwing error if config.allowedFileTypes excludes file.type
- [X] T053 [US3] Integrate validateFileSize() into UploadService.uploadFile() calling before filesystem write
- [X] T054 [US3] Integrate validateFileType() into UploadService.uploadFile() calling before filesystem write
- [X] T055 [US3] Add validation error responses with FILE_TOO_LARGE and INVALID_FILE_TYPE error codes
- [X] T056 [US3] Update error handling to return proper HTTP status codes (413 for FILE_TOO_LARGE, 415 for INVALID_FILE_TYPE)
- [X] T057 [US3] Add error context to responses including maxSize, actualSize for size errors; fileType, allowedTypes for type errors
- [X] T058 [US3] Test validation with oversized file (15MB > 10MB limit) confirming 413 response
- [X] T059 [US3] Test validation with wrong file type (PDF when images only) confirming 415 response
- [X] T060 [US3] Test successful upload with valid file within all constraints

**Phase 5 Deliverable**: Configurable file type and size validation with proper error responses.

**Parallel Opportunities**: T051-T052 (utility functions) can be done in parallel.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Complete non-functional requirements and edge case handling

### Implementation Tasks

- [X] T061 [P] Add duplicate filename handling (last write wins) in UploadService.uploadFile()
- [X] T062 [P] Add network interruption error handling with partial file cleanup logic
- [X] T063 [P] Add insufficient disk space error detection with FILE_WRITE_ERROR response
- [X] T064 [P] Add file with no extension handling (accept as-is)
- [X] T065 [P] Add directory upload rejection with error message "Only files are allowed"
- [X] T066 [P] Implement session cleanup TTL in UploadSessionService (delete sessions 60s after completion)
- [X] T067 [P] Add concurrent upload testing (10 simultaneous uploads)
- [X] T068 [P] Add <3 second upload completion verification for standard files
- [X] T069 [P] Verify 100% of uploaded files stored in correct directory with correct filenames
- [X] T070 [P] Verify upload progress visible for files >1MB
- [X] T071 [P] Verify all error messages are clear and actionable
- [X] T072 [P] Run TypeScript compiler and fix all type errors
- [X] T073 [P] Run linter and fix all style violations
- [X] T074 [P] Test with S3Adapter by changing FilesystemConfig (optional extension)
- [X] T075 [P] Add API documentation to README.md with curl examples

**Phase 6 Deliverable**: Production-ready example with edge cases handled and all requirements verified.

**Parallel Opportunities**: T061-T066 (edge cases), T067-T071 (testing), T072-T075 (final checks) can be done in parallel.

---

## Dependencies

### User Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Single File Upload) ← MVP complete here
    ↓
Phase 4 (US2: Multiple File Upload) - depends on US1 (reuses UploadService)
    ↓
Phase 5 (US3: Validation) - depends on US1 (enhances UploadService)
    ↓
Phase 6 (Polish)
```

**Notes**:
- US2 and US3 can be done in parallel after US1 is complete
- US2 primarily adds new endpoint, minimal changes to existing code
- US3 adds validation logic to existing upload flow

---

## Parallel Execution Examples

### Within Phase 2 (Foundational)

```bash
# Terminal 1
# Implement types
- T011: src/types/upload.types.ts
- T012: src/types/session.types.ts
- T013: src/types/validation.types.ts

# Terminal 2 (parallel)
# Implement utilities
- T014: src/utils/filename-sanitizer.util.ts
- T015: src/utils/file-validation.util.ts
```

### Within Phase 3 (US1)

```bash
# Terminal 1
# Service layer
- T019: upload-service.service.ts (class structure)
- T020: constructor
- T021: validateFile()
- T022: uploadFile()

# Terminal 2 (parallel)
# Frontend
- T038: public/index.html
- T039: public/upload.js
- T040: progress polling logic
```

### Within Phase 6 (Polish)

```bash
# Terminal 1: Edge cases
- T061: duplicate filename
- T062: network interruption
- T063: disk space
- T064: no extension
- T065: directory upload

# Terminal 2: Testing (parallel)
- T067: concurrent uploads
- T068: <3s completion
- T069: correct storage
- T070: progress visibility
- T071: error messages
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **MVP = Phases 1-3** (Tasks T001-T041)
   - Delivers: Single file upload with progress tracking
   - Testable: Upload one file, verify storage, see progress
   - Value: Core functionality working end-to-end

2. **Incremental Expansion**
   - Add US2 (multiple files) after MVP validated
   - Add US3 (validation) as enhancement
   - Polish after all features working

### Incremental Delivery

Each user story phase is independently deployable:
- **After Phase 3**: Deploy single file upload version
- **After Phase 4**: Deploy with multiple file support
- **After Phase 5**: Deploy with validation enabled

---

## Task Format Validation

**All tasks follow the checklist format**:
- Checkbox: `- [ ]`
- Task ID: T001-T075 (sequential)
- Parallel marker: `[P]` for parallelizable tasks
- Story label: `[US1]`, `[US2]`, `[US3]` for user story tasks
- Description: Clear action with file path

**Examples**:
- ✅ `- [ ] T019 [P] [US1] Create src/services/upload-service.service.ts class`
- ✅ `- [ ] T022 [US1] Implement UploadService.uploadFile() method`
- ✅ `- [ ] T025 [US1] Create src/controllers/upload.controller.ts`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 75 |
| **Setup Phase** | 10 tasks (T001-T010) |
| **Foundational Phase** | 8 tasks (T011-T018) |
| **US1 Phase** | 23 tasks (T019-T041) |
| **US2 Phase** | 9 tasks (T042-T050) |
| **US3 Phase** | 10 tasks (T051-T060) |
| **Polish Phase** | 15 tasks (T061-T075) |
| **Parallel Opportunities** | 15 tasks marked [P] |
| **Suggested MVP** | Phases 1-3 (41 tasks) |

**Independent Test Criteria by Story**:
- **US1**: Upload file → stored in target directory with correct content
- **US2**: Upload 5 files → all stored, partial success supported
- **US3**: Upload invalid file → rejected with appropriate error message
