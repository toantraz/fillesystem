# Tasks: S3 Filesystem Example with MinIO

**Input**: Design documents from `/specs/001-s3-example/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This is a demo/example application. Tests are not explicitly requested, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Root**: `/home/tvtoan/dev/venizia/filesystem/`
- **Example**: `examples/s3-minio-example/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the example application directory structure and configuration files

- [ ] T001 Create example directory structure at `examples/s3-minio-example/` with subdirectories: `docker/`, `config/`, `src/`
- [ ] T002 [P] Create `docker/docker-compose.yml` with MinIO service configuration (ports 9000, 9001, credentials minioadmin/minioadmin)
- [ ] T003 [P] Create `docker/init-buckets.sh` script to create test-bucket on MinIO startup using mc client
- [ ] T004 [P] Create `config/s3.json.example` with S3 configuration (endpoint, bucket, credentials, forcePathStyle)
- [ ] T005 [P] Create `config/.env.example` with AWS credential variable templates
- [ ] T006 [P] Create `package.json` with dependencies (@venizia/ignis, @ignis/filesystem, tsx, typescript)
- [ ] T007 [P] Create `tsconfig.json` with Node16 module resolution
- [ ] T008 Copy `quickstart.md` content to `examples/s3-minio-example/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core application infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create `src/index.ts` entry point with application boot sequence (init, boot, postConfigure, stop)
- [ ] T010 Create `src/app.ts` Application class extending BaseApplication from @venizia/ignis
- [ ] T011 Implement preConfigure() in `src/app.ts` to register FilesystemComponent with S3 configuration
- [ ] T012 Implement postConfigure() in `src/app.ts` to run filesystem operations demo
- [ ] T013 Implement setupMiddlewares() in `src/app.ts` with CORS configuration
- [ ] T014 Implement getProjectRoot() and getAppInfo() abstract methods in `src/app.ts`
- [ ] T015 Add graceful shutdown handlers (SIGINT, SIGTERM, uncaughtException) in `src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Local MinIO Environment Setup (Priority: P1) 🎯 MVP

**Goal**: MinIO Docker container starts and test-bucket is created automatically

**Independent Test**: Run `docker compose up` from `docker/` directory, verify MinIO is accessible at http://localhost:9000 and http://localhost:9001, verify test-bucket exists

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement MinIO service definition in `docker/docker-compose.yml` with healthcheck on port 9000
- [ ] T017 [P] [US1] Implement volume persistence in `docker/docker-compose.yml` for minio_data
- [ ] T018 [US1] Implement `docker/init-buckets.sh` with MinIO readiness check (curl/wget loop)
- [ ] T019 [US1] Implement mc alias configuration in `docker/init-buckets.sh` for local MinIO
- [ ] T020 [US1] Implement bucket creation with idempotency check in `docker/init-buckets.sh` (ignore error if exists)
- [ ] T021 [US1] Make `docker/init-buckets.sh` executable with proper shebang (#!/bin/bash)
- [ ] T022 [US1] Add environment variable overrides in `docker/docker-compose.yml` for MINIO_ROOT_USER and MINIO_ROOT_PASSWORD

**Checkpoint**: Run `docker compose up && docker compose logs -f` - see MinIO start, test-bucket created successfully

---

## Phase 4: User Story 2 - S3 Configuration and Application Startup (Priority: P2)

**Goal**: Application starts with S3 configuration and validates MinIO connectivity

**Independent Test**: Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, run `npm start`, verify "Application booted successfully" and "S3 adapter initialized" in logs

### Implementation for User Story 2

- [ ] T023 [P] [US2] Implement S3 config file loader in `src/index.ts` with fallback to inline defaults
- [ ] T024 [P] [US2] Implement environment variable validation in `src/index.ts` for AWS credentials
- [ ] T025 [P] [US2] Implement S3 credentials validation error message in `src/index.ts` with helpful guidance
- [ ] T026 [US2] Implement configuration loading priority (env vars > config file > defaults) in `src/index.ts`
- [ ] T027 [US2] Implement FilesystemComponent registration with S3 config in `src/app.ts` preConfigure()
- [ ] T028 [US2] Implement forcePathStyle: true in S3 configuration for MinIO compatibility in `src/index.ts`
- [ ] T029 [US2] Add clear error messages for common S3 issues (auth failed, bucket not found, connection refused) in `src/app.ts`

**Checkpoint**: Run `npm start` with valid credentials - see "Application booted successfully" and S3 adapter active

---

## Phase 5: User Story 3 - S3 Filesystem Operations Verification (Priority: P3)

**Goal**: Demonstrate all filesystem operations (write, read, exists, stat, readdir, unlink) against MinIO

**Independent Test**: Run `npm start`, verify all 6 operations complete successfully with [SUCCESS] log entries, verify file appears and disappears in MinIO console

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create `src/demo.ts` with runS3Demo() function signature
- [ ] T031 [P] [US3] Implement writeFile demo in `src/demo.ts` with test-file.txt and "Hello from S3 Filesystem!" content
- [ ] T032 [P] [US3] Implement readFile demo in `src/demo.ts` with content verification logging
- [ ] T033 [P] [US3] Implement exists demo in `src/demo.ts` with boolean result logging
- [ ] T034 [P] [US3] Implement stat demo in `src/demo.ts` with size and mtime logging
- [ ] T035 [P] [US3] Implement readdir demo in `src/demo.ts` with file list logging
- [ ] T036 [P] [US3] Implement unlink demo in `src/demo.ts` with cleanup confirmation
- [ ] T037 [US3] Add success/failure logging for each operation in `src/demo.ts`
- [ ] T038 [US3] Add try-catch error handling for each operation in `src/demo.ts` with continuation
- [ ] T039 [US3] Call runS3Demo() from `src/app.ts` postConfigure() after filesystem initialization
- [ ] T040 [US3] Add demo completion message in `src/demo.ts` with operation summary

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T041 [P] Add inline code comments explaining MinIO-specific configurations in `docker/docker-compose.yml`
- [ ] T042 [P] Add inline code comments explaining S3 path-style access in `src/index.ts`
- [ ] T043 Update README.md with troubleshooting section from `quickstart.md`
- [ ] T044 Verify all success criteria from spec.md: single command setup, <10s startup, all operations succeed
- [ ] T045 Add .dockerignore file if needed to prevent unwanted file copying
- [ ] T046 Add .gitignore entries for node_modules/, .env, config/s3.json (if local config created)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (US1): Can start after Foundational - Independent of other stories
  - User Story 2 (US2): Can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (US3): Can start after Foundational - Requires US1 (MinIO) and US2 (app config) but testable independently
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS ALL STORIES
    ↓
    ├─→ US1 (MinIO Setup) ─────────────────────┐
    │                                           │
    ├─→ US2 (App Config + S3 Client) ───────────┤
    │                                           │
    └───────────────────────────────────────────┤
                                                ↓
                                          US3 (Demo Operations)
                                                ↓
                                          Polish (Phase 6)
```

### Within Each User Story

- **US1**: Docker compose config [P] ← init script depends on compose config
- **US2**: Config loaders [P] ← independent of each other, then integrate in app.ts
- **US3**: Individual demo operations [P] ← all independent, then called in sequence

### Parallel Opportunities

- **Phase 1**: T002-T008 can all run in parallel (different config files)
- **US1**: T016-T017 can run in parallel (docker-compose separate concerns)
- **US2**: T023-T024 can run in parallel (env var validation independent of config loading)
- **US3**: T031-T036 can all run in parallel (each demo operation is independent function)

---

## Parallel Example: User Story 3

```bash
# Launch all demo operation functions together:
Task: "Implement writeFile demo in src/demo.ts"
Task: "Implement readFile demo in src/demo.ts"
Task: "Implement exists demo in src/demo.ts"
Task: "Implement stat demo in src/demo.ts"
Task: "Implement readdir demo in src/demo.ts"
Task: "Implement unlink demo in src/demo.ts"

# All write to separate functions in the same file, then integrated in T039
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T015) - CRITICAL
3. Complete Phase 3: User Story 1 (T016-T022)
4. **STOP and VALIDATE**: Run `docker compose up`, verify MinIO accessible
5. Demo MinIO console access and test-bucket existence

### Incremental Delivery

1. Complete Setup + Foundational → Infrastructure ready
2. Add User Story 1 → MinIO runs independently → Can demo Docker setup
3. Add User Story 2 → App connects to S3 → Can demo configuration
4. Add User Story 3 → Full demo works → Complete example
5. Each story adds demonstrable value

### Sequential Implementation

For single developer:

1. **Setup (T001-T008)**: ~30 min - Create all config files
2. **Foundational (T009-T015)**: ~1 hour - App structure
3. **US1 (T016-T022)**: ~30 min - Docker setup
4. **US2 (T023-T029)**: ~1 hour - Config and validation
5. **US3 (T030-T040)**: ~1 hour - Demo operations
6. **Polish (T041-T046)**: ~30 min - Documentation and cleanup

**Total estimate**: ~4 hours

---

## Task Summary

| Phase                 | Tasks        | Description                               |
| --------------------- | ------------ | ----------------------------------------- |
| Phase 1: Setup        | 8 tasks      | Directory structure, Docker, config files |
| Phase 2: Foundational | 7 tasks      | Application base, Ignis integration       |
| Phase 3: US1 (MinIO)  | 7 tasks      | Docker compose, bucket initialization     |
| Phase 4: US2 (Config) | 7 tasks      | S3 config loading, validation             |
| Phase 5: US3 (Demo)   | 11 tasks     | Filesystem operations demo                |
| Phase 6: Polish       | 6 tasks      | Documentation, cleanup                    |
| **Total**             | **46 tasks** | Complete S3/MinIO example                 |

### Format Validation

All tasks follow the required checklist format:

- ✅ Checkbox `- [ ]` prefix
- ✅ Task ID (T001-T046)
- ✅ `[P]` marker for parallelizable tasks
- ✅ `[US1]`, `[US2]`, `[US3]` labels for user story tasks
- ✅ Clear description with file path

---

## Notes

- This is an example/demo application - no test tasks included (not requested in spec)
- Reuses existing `@ignis/filesystem` S3 adapter - no adapter implementation needed
- Reuses existing `@venizia/ignis` framework - follows `examples/ignis-application` pattern
- MinIO specific: `forcePathStyle: true` is critical for compatibility
- Bucket name is fixed: `test-bucket`
- Default credentials: `minioadmin` / `minioadmin`
