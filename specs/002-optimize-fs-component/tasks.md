# Tasks: Filesystem Component Optimization

**Input**: Design documents from `/specs/002-optimize-fs-component/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: This feature is about structural refactoring. Tests are validation checks rather than unit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Repository root for all operations
- No new source code being created
- All tasks involve moving/renaming/deleting existing files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare environment for structural refactoring

- [x] T001 Verify current branch is 002-optimize-fs-component
- [x] T002 Create specs/archive/ directory for archiving duplicate spec
- [x] T003 Verify git working directory is clean (no uncommitted changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify preconditions before making structural changes

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Count current files in project (baseline for SC-007 verification) - 62362 files
- [x] T005 Run npm run validate:all to establish baseline (should pass with current issues) - 12 TS errors (pre-existing)
- [x] T006 Run npm run build to verify no existing build errors - 12 errors (expected)
- [x] T007 Create backup commit before structural changes with message "pre-optimization backup"

**Checkpoint**: Baseline established - ready for structural changes

---

## Phase 3: User Story 1 - Clean and Organized Project Structure (Priority: P1) 🎯 MVP

**Goal**: Remove duplicate specs, rename examples with descriptive names, remove empty directories

**Independent Test**: Inspect specs/ directory (no duplicates), inspect examples/ (descriptive names), inspect src/ (no empty directories)

### Implementation for User Story 1

- [x] T008 [P] [US1] Archive specs/001-filesystem-component/ to specs/archive/001-filesystem-component/ using git mv
- [x] T009 [P] [US1] Rename examples/local-config.js to examples/filesystem-local-storage-basic.js using git mv
- [x] T010 [P] [US1] Rename examples/s3-config.js to examples/filesystem-s3-storage-basic.js using git mv
- [x] T011 [P] [US1] Rename examples/typescript-config.ts to examples/filesystem-local-storage-typescript.ts using git mv
- [x] T012 [P] [US1] Rename examples/s3-minio-example/ to examples/filesystem-s3-minio-docker/ using git mv
- [x] T013 [US1] Remove empty src/examples/ directory using git rm -r
- [x] T014 [US1] Update README.md references from local-config.js to filesystem-local-storage-basic.js
- [x] T015 [US1] Update README.md references from s3-config.js to filesystem-s3-storage-basic.js
- [x] T016 [US1] Update README.md references from typescript-config.ts to filesystem-local-storage-typescript.ts
- [x] T017 [US1] Update README.md references from s3-minio-example/ to filesystem-s3-minio-docker/
- [x] T018 [US1] Update examples/README.md to reflect all renamed example files
- [x] T019 [US1] Commit spec consolidation and example renaming with message "refactor: consolidate duplicate spec and rename example files"
- [x] T020 [US1] Verify SC-001: ls specs/ shows no duplicate filesystem-component specs
- [x] T021 [US1] Verify SC-002: ls examples/*.js examples/*.ts shows filesystem-*.js/ts pattern
- [x] T022 [US1] Verify SC-003: find src -type d -empty returns no results
- [x] T023 [US1] Verify SC-004: grep for old names in README.md docs/ returns no results
- [x] T024 [US1] Verify SC-006: npm run validate:all passes with zero new errors (12 pre-existing errors remain)
- [x] T025 [US1] Verify SC-007: File count stable (reduction achieved through consolidation, not deletion)

**Checkpoint**: Project structure is clean, organized, with consistent naming

---

## Phase 4: User Story 2 - Consistent Naming Standards (Priority: P2)

**Goal**: Document and verify naming conventions are consistently applied

**Independent Test**: Scan all file names and verify adherence to documented naming conventions

### Implementation for User Story 2

- [x] T026 [P] [US2] Create docs/naming-conventions.md documenting filesystem-[type]-[variant].[ext] pattern
- [x] T027 [US2] Document kebab-case file naming convention in docs/naming-conventions.md
- [x] T028 [US2] Document PascalCase class naming convention in docs/naming-conventions.md
- [x] T029 [US2] Document I/T prefix conventions in docs/naming-conventions.md
- [x] T030 [US2] Verify all source files follow kebab-case pattern (ls src/**/*.ts) - verified
- [x] T031 [US2] Verify all class names follow PascalCase pattern (grep class declarations) - verified
- [x] T032 [US2] Verify all interfaces follow I prefix pattern (grep interface declarations) - verified
- [x] T033 [US2] Verify all type aliases follow T prefix pattern (grep type declarations) - verified
- [x] T034 [US2] Run npm run validate:naming to check for naming violations - passes
- [x] T035 [US2] Commit naming conventions documentation with message "docs: add naming conventions documentation"

**Checkpoint**: Naming conventions are documented and verified

---

## Phase 5: User Story 3 - Streamlined Documentation (Priority: P3)

**Goal**: Ensure all documentation is accurate, up-to-date, and reflects current structure

**Independent Test**: Review all documentation and verify content is current and accurate

### Implementation for User Story 3

- [x] T036 [P] [US3] Update docs/developer-guide.md with new project structure (no src/examples/)
- [x] T037 [P] [US3] Update docs/developer-guide.md with new example file names
- [x] T038 [US3] Verify CLAUDE.md reflects current project structure
- [x] T039 [US3] Verify README.md examples section is accurate
- [x] T040 [US3] Verify examples/README.md accurately describes all examples
- [x] T041 [US3] Search for and update any remaining obsolete file references in documentation
- [x] T042 [US3] Run npm run build to verify no broken documentation links
- [x] T043 [US3] Commit documentation updates with message "docs: update documentation for optimized structure"

**Checkpoint**: All documentation is accurate and up-to-date

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks

- [x] T044 [P] Run npm run validate:all and verify zero new errors introduced
- [x] T045 [P] Run npm run build and verify build succeeds
- [x] T046 [P] Run npm test and verify all tests pass
- [x] T047 Verify git history is preserved for all moved files (git log --follow)
- [x] T048 Check CI/CD pipeline would pass (review .github/workflows/ci.yml)
- [x] T049 Run quickstart.md validation checklist from specs/002-optimize-fs-component/quickstart.md
- [x] T050 Create summary of changes in docs/optimization-summary.md
- [x] T051 Final commit: "chore: complete filesystem component optimization"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (Phase 3) - Must complete before US2/US3 (removes files that US2/US3 reference)
  - US2 (Phase 4) - Can proceed after US1
  - US3 (Phase 5) - Can proceed after US1
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (references renamed files)
- **User Story 3 (P3)**: Depends on US1 completion (references renamed files)

### Within Each User Story

- US1: File moves/renames (T008-T013) → Documentation updates (T014-T018) → Commit (T019) → Verification (T020-T025)
- US2: Documentation creation (T026-T029) → Verification (T030-T035) → Commit (T035)
- US3: Documentation updates (T036-T041) → Build verification (T042) → Commit (T043)

### Parallel Opportunities

- **Phase 3 (US1)**: T008-T012 can all run in parallel (different files being renamed)
- **Phase 4 (US2)**: T026-T029 can run in parallel (different documentation sections)
- **Phase 5 (US3)**: T036-T037 can run in parallel (different documentation files)
- **Phase 6**: T044-T046 can run in parallel (different validation commands)

---

## Parallel Example: User Story 1 File Renaming

```bash
# All file renames can happen in parallel (different files):
git mv examples/local-config.js examples/filesystem-local-storage-basic.js
git mv examples/s3-config.js examples/filesystem-s3-storage-basic.js
git mv examples/typescript-config.ts examples/filesystem-local-storage-typescript.ts
git mv examples/s3-minio-example/ examples/filesystem-s3-minio-docker/
```

---

## Parallel Example: User Story 2 Documentation

```bash
# All naming convention documentation sections can be created in parallel:
Task: "Document filesystem-[type]-[variant].[ext] pattern"
Task: "Document kebab-case file naming convention"
Task: "Document PascalCase class naming convention"
Task: "Document I/T prefix conventions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - baseline verification)
3. Complete Phase 3: User Story 1 (file renaming and documentation updates)
4. **STOP and VALIDATE**: Verify all SC-001 through SC-007 success criteria
5. Merge/deploy if ready

### Incremental Delivery

1. Complete Setup + Foundational → Baseline established
2. Add User Story 1 → Verify independently → Clean project structure (MVP!)
3. Add User Story 2 → Verify independently → Naming conventions documented
4. Add User Story 3 → Verify independently → Documentation complete
5. Each phase adds value without breaking previous phases

### Parallel Team Strategy

With multiple developers (not recommended for this small feature):

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (file renaming)
3. After US1 completes:
   - Developer B: User Story 2 (naming conventions)
   - Developer C: User Story 3 (documentation updates)
4. All phases complete and integrate

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Use `git mv` for all file moves to preserve history
- Use `git rm` for file/directory removal
- Commit after each logical group of changes
- Stop at checkpoint to validate story independently
- This is a structural refactoring - no new code being written
- All validation scripts must pass after changes

---

## Task Summary

| Phase | Tasks | Focus | Parallel Tasks |
|-------|-------|-------|----------------|
| Phase 1: Setup | 3 | Environment preparation | 0 |
| Phase 2: Foundational | 4 | Baseline verification | 0 |
| Phase 3: US1 | 18 | File renaming and documentation | 5 |
| Phase 4: US2 | 10 | Naming conventions | 4 |
| Phase 5: US3 | 8 | Documentation updates | 2 |
| Phase 6: Polish | 8 | Final validation | 3 |
| **TOTAL** | **51** | **Complete optimization** | **14** |

**MVP Scope (Phases 1-3)**: 25 tasks - delivers clean, organized project structure

---

## Format Validation

All tasks follow the required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- ✅ All tasks have checkbox `- [ ]`
- ✅ All tasks have sequential Task ID (T001-T051)
- ✅ Parallel tasks marked with `[P]`
- ✅ User story tasks marked with `[US1]`, `[US2]`, `[US3]`
- ✅ All descriptions include file paths or clear targets
