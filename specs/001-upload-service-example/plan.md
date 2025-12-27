# Implementation Plan: Upload Service Example

**Branch**: `001-upload-service-example` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-upload-service-example/spec.md`

## Summary

Implement an example upload service REST API application demonstrating FilesystemComponent injection using the @venizia/ignis framework. The service provides single and multiple file upload endpoints, server-side progress tracking, file validation (type, size), and a web interface. This example showcases dependency injection patterns, multipart file handling with Hono, and proper error handling following Ignis coding standards.

## Technical Context

**Language/Version**: TypeScript 5.0+ (Node.js 18+)
**Primary Dependencies**: @venizia/ignis (application framework), Hono (HTTP router), Zod (validation)
**Storage**: Local filesystem via FilesystemComponent with LocalAdapter (extensible to S3Adapter)
**Testing**: Vitest (project test runner)
**Target Platform**: Node.js 18+ server environment
**Project Type**: Single project (example application under `examples/`)
**Performance Goals**: Handle 10 concurrent uploads, <3 second upload completion (SC-001), progress tracking for files >1MB (SC-004)
**Constraints**: Follow Ignis coding standards (kebab-case files, [ClassName][methodName] logging, I/T prefix types)
**Scale/Scope**: Example application with <1000 LOC, demonstrating upload patterns with server-side progress tracking

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: CONSTITUTION NOT CONFIGURED - The project constitution (`.specify/memory/constitution.md`) is still in template form. No gates to evaluate.

**Recommended Next Steps**:
1. Run `/speckit.constitution` to establish project principles
2. Re-run this plan after constitution is configured

**For Planning Purposes**: Proceeding with Ignis coding standards from `CLAUDE.md` as de facto constitution:
- File naming: kebab-case with type suffix
- Class naming: [Feature][Type] pattern
- Type safety: I prefix for interfaces, T prefix for type aliases
- Logging: `[ClassName][methodName] message`
- Error handling: `getError()` with context

## Project Structure

### Documentation (this feature)

```text
specs/001-upload-service-example/
├── spec.md              # Feature specification (with clarifications)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (updated with server-side progress)
├── data-model.md        # Phase 1 output (updated with UploadSession entity)
├── quickstart.md        # Phase 1 output (updated with progress API)
├── contracts/           # Phase 1 output (updated with progress endpoint)
│   └── openapi.yaml     # OpenAPI specification (includes /api/upload/progress)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
examples/upload-service-application/         # New example application
├── src/
│   ├── index.ts                              # Entry point
│   ├── app.ts                                # Ignis Application class
│   ├── controllers/
│   │   └── upload.controller.ts              # Upload endpoints + progress handler
│   ├── services/
│   │   ├── upload-service.service.ts         # Upload handling with DI
│   │   └── upload-session.service.ts         # Session management for progress tracking
│   ├── types/
│   │   ├── upload.types.ts                   # Upload-specific types
│   │   ├── validation.types.ts               # Validation schema types
│   │   └── session.types.ts                  # Upload session types
│   └── utils/
│       ├── file-validation.util.ts           # File type/size validation
│       └── filename-sanitizer.util.ts        # Filename sanitization (unsafe chars → underscore)
├── public/
│   ├── index.html                            # Upload form interface
│   └── upload.js                             # Frontend upload logic with progress polling
├── uploads/                                   # Default upload target directory (gitignored)
├── package.json                               # Dependencies (extends root)
├── tsconfig.json                              # TypeScript config
└── README.md                                  # Example-specific documentation
```

**Structure Decision**: Following the established pattern from `local-storage-application` and `s3-minio-application` examples. This is a **single project** structure - a standalone example application demonstrating upload patterns with server-side progress tracking. The structure:
- Uses Ignis framework's `BaseApplication` pattern
- Separates concerns: controllers (HTTP), services (business logic + session management), types, utilities
- Includes web interface with progress polling
- Follows Ignis coding standards throughout

## Complexity Tracking

> **No violations to track** - This is a simple example application following established patterns. However, one design choice requires explanation:

| Decision | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|--------------------------------------|
| Server-side progress endpoint | User explicitly chose Option B during clarification | Client-side XHR progress (simpler) rejected based on user preference |

---

## Phase 0: Research Questions (Updated)

Based on clarifications, the following items are resolved:

1. **File Upload Library** ✅ RESOLVED: Use Hono's built-in `parseBody()` utility
2. **File Validation Strategy** ✅ RESOLVED: No default file type restrictions (accept all), size validation against configured max
3. **Progress Tracking** ✅ RESOLVED: Server-side endpoint `/api/upload/progress/:id` returning percentage and bytes received/total
4. **Concurrent Upload Handling** ✅ RESOLVED: Node.js async/await with in-memory session map for progress tracking
5. **Web UI Framework** ✅ RESOLVED: Vanilla JavaScript with progress polling

**New research needed** for server-side progress tracking:

6. **Upload Session Storage**: How to store upload sessions for progress tracking?
   - Options: In-memory Map, Redis, temporary files
   - Research needed: Best practice for example application scope

7. **Progress Update Mechanism**: How to track bytes received during upload?
   - Options: Hono streaming middleware, custom request wrapper
   - Research needed: Hono patterns for tracking stream progress

## Phase 1: Design Artifacts

After research completion, generate:

1. **data-model.md**: Entity definitions (UploadedFile, UploadConfiguration, UploadResult, UploadSession)
2. **contracts/openapi.yaml**: API endpoints including `/api/upload/progress/:id`
3. **quickstart.md**: Developer onboarding guide with progress polling examples

## Phase 2: Implementation Tasks

Execute `/speckit.tasks` after Phase 1 design artifacts are complete.

---

## Key Changes from Previous Plan

The following clarifications from `/speckit.clarify` updated the implementation approach:

| Clarification | Impact |
|---------------|--------|
| Minimal security (no auth/rate limiting) | Simplified implementation, no middleware needed |
| No default file type restrictions | `allowedFileTypes` defaults to `null` (accept all) |
| Replace unsafe chars with underscore | New utility function needed |
| Server-side progress endpoint | New `UploadSession` entity, session management service |
| `X-Upload-Id` response header | Upload ID returned in header, not body |
