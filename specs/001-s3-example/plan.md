# Implementation Plan: S3 Filesystem Example with MinIO

**Branch**: `001-s3-example` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-s3-example/spec.md`

## Summary

Create an end-to-end example demonstrating S3 filesystem operations using MinIO as a local S3-compatible storage backend. The solution includes:

1. Docker Compose setup for MinIO with automatic bucket initialization
2. S3 configuration files for the example application
3. Application startup with S3 credential validation
4. Demonstration of all filesystem operations (write, read, exists, stat, list, delete)

## Technical Context

**Language/Version**: TypeScript 5.0+ (Node.js 18+)
**Primary Dependencies**:

- `@aws-sdk/client-s3` (AWS SDK v3 for S3 operations)
- `minio/mc` (MinIO client for bucket initialization)
- `@venizia/ignis` (Ignis framework)
- `@ignis/filesystem` (Existing filesystem package with S3 adapter)

**Storage**: S3-compatible (MinIO for local testing)
**Testing**: Node.js built-in assertions + Jest (existing)
**Target Platform**: Linux/macOS/Windows with Docker
**Project Type**: Example/Demo application
**Performance Goals**:

- MinIO startup: < 10 seconds
- Application startup: < 10 seconds
- File operations: < 5 seconds each

**Constraints**:

- Must use existing S3 adapter from `@ignis/filesystem`
- Must use existing Ignis application framework
- Docker and Docker Compose required

**Scale/Scope**:

- Single bucket ("test-bucket")
- Demo files: < 1MB each
- Concurrent users: 1 (developer testing)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The constitution file is currently a template. Applying standard development principles:

| Principle     | Status | Notes                                                        |
| ------------- | ------ | ------------------------------------------------------------ |
| Simplicity    | PASS   | Single-purpose demo, no unnecessary abstractions             |
| Testability   | PASS   | Each filesystem operation independently testable             |
| Documentation | PASS   | Docker setup, config files, and README included              |
| Dependencies  | PASS   | Uses existing packages (@ignis/filesystem, @venizia/ignis) |

**No gate violations - approved to proceed.**

## Project Structure

### Documentation (this feature)

```text
specs/001-s3-example/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This feature extends the existing filesystem package with example files:

```text
/home/tvtoan/dev/venizia/filesystem/
├── examples/
│   └── s3-minio-example/              # NEW - S3/MinIO example
│       ├── docker/
│       │   ├── docker-compose.yml     # MinIO container setup
│       │   └── init-buckets.sh        # Bucket initialization script
│       ├── config/
│       │   ├── s3.json                # S3 configuration example
│       │   └── .env.example           # Environment variables template
│       ├── src/
│       │   ├── index.ts               # Application entry point
│       │   ├── app.ts                 # Ignis application setup
│       │   └── demo.ts                # S3 filesystem operations demo
│       ├── package.json
│       ├── README.md                  # Quickstart guide
│       └── tsconfig.json
├── src/                                # EXISTING - Core filesystem package
│   ├── adapters/
│   │   └── s3-adapter.ts              # Existing S3 adapter
│   └── component.ts                    # Existing FilesystemComponent
└── examples/
    └── ignis-application/              # EXISTING - Local filesystem example
```

**Structure Decision**: Extends existing examples directory with a new `s3-minio-example` subdirectory. Reuses existing `s3-adapter.ts` and `FilesystemComponent` from the core package.

## Complexity Tracking

> **No violations to justify - standard example/demo complexity.**

## Phase 0: Research & Decisions

### Research Tasks

1. **MinIO Docker Setup**: Best practices for running MinIO locally with Docker Compose
2. **Bucket Initialization**: How to auto-create buckets on MinIO startup
3. **S3 Adapter Configuration**: Required configuration options for the existing S3 adapter
4. **Path-Style Access**: MinIO requires path-style access (vs virtual-hosted style)
5. **Environment Variables**: Standard AWS credential variable names

### Key Decisions

| Decision      | Choice                          | Rationale                                  |
| ------------- | ------------------------------- | ------------------------------------------ |
| MinIO Version | latest (RELEASE.2024-\*)        | Most stable, recent API compatibility      |
| Ports         | 9000 (API), 9001 (Console)      | MinIO defaults, well-known                 |
| Credentials   | minioadmin/minioadmin (default) | Standard for local development             |
| Region        | us-east-1                       | Default for MinIO, matches AWS conventions |
| Path Style    | forcePathStyle: true            | Required for MinIO compatibility           |

---

## Phase 1: Design & Contracts

### Completed Artifacts

| Artifact                             | Status     | Description                                   |
| ------------------------------------ | ---------- | --------------------------------------------- |
| `research.md`                        | ✓ Complete | All technical decisions documented            |
| `data-model.md`                      | ✓ Complete | Configuration entities and test files defined |
| `contracts/filesystem-operations.md` | ✓ Complete | Filesystem interface contract documented      |
| `quickstart.md`                      | ✓ Complete | User guide for running the example            |

### Re-verify Constitution Check

| Principle     | Status | Notes                                                        |
| ------------- | ------ | ------------------------------------------------------------ |
| Simplicity    | PASS   | Single-purpose demo, no unnecessary abstractions             |
| Testability   | PASS   | Each filesystem operation independently testable             |
| Documentation | PASS   | Quickstart guide, contracts, data model complete             |
| Dependencies  | PASS   | Uses existing packages (@ignis/filesystem, @venizia/ignis) |

**No gate violations - design approved.**

---

## Phase 2: Implementation

**Status**: Ready for task generation (run `/speckit.tasks`)

**Next Steps**:

1. Run `/speckit.tasks` to generate `tasks.md`
2. Implement tasks in dependency order
3. Run example and verify all operations complete successfully
