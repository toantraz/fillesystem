# Tasks: Code Style Standards Compliance

**Input**: Design documents from `/specs/001-code-style-standards/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature is about developer tooling configuration. Tests are validation scripts rather than unit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Configuration files: Repository root (`/home/tvtoan/dev/venizia/filesystem/`)
- Source structure: `src/`, `tests/` at repository root
- Scripts location: `scripts/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install @venizia/dev-configs and peer dependencies via npm
- [x] T002 [P] Create .prettierignore file at repository root
- [x] T003 [P] Create .eslintignore file at repository root
- [x] T004 [P] Create .npmignore file at repository root
- [x] T005 Verify package.json exists and is valid

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tooling configuration that MUST be complete before ANY code standards can be enforced

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Prettier configuration in .prettierrc.js extending @venizia/dev-configs/prettier
- [x] T007 Create ESLint configuration in .eslintrc.json extending @venizia/dev-configs/eslint
- [x] T008 Create TypeScript configuration in tsconfig.json extending @venizia/dev-configs/tsconfig.common.json
- [x] T009 [P] Create TypeScript component configuration in tsconfig.component.json
- [x] T010 Add npm scripts (lint, lint:fix, prettier, prettier:fix, type-check, validate, validate:fix) to package.json
- [x] T011 Create VS Code settings in .vscode/settings.json for formatOnSave and codeActionsOnSave
- [x] T012 Create VS Code extensions recommendation in .vscode/extensions.json

**Checkpoint**: Foundation ready - all linting and formatting tools are configured and ready to use

---

## Phase 3: User Story 4 & 1 - Configured Development Tools (Priority: P1) 🎯 MVP

**Goal**: Pre-configured linting and formatting tools so developers can start contributing without manual configuration

**Independent Test**: Run `npm install && npm run lint:fix` - all tools should work without additional configuration

### Implementation for User Story 4 & 1

- [X] T013 [P] [US4] Create scripts/validate.sh that runs type-check, lint, and prettier checks
- [X] T014 [P] [US4] Create scripts/validate-fix.sh that runs prettier:fix and lint:fix
- [X] T015 [US1] Run npm run validate to verify all configurations work correctly
- [X] T016 [US1] Run npm run validate:fix to auto-fix any initial formatting issues
- [X] T017 [US1] Verify npm run lint executes without errors
- [X] T018 [US1] Verify npm run prettier executes without errors
- [X] T019 [US1] Verify npm run type-check executes without errors

**Checkpoint**: At this point, all development tools are configured and working. Developers can run `npm run validate` before commits.

---

## Phase 4: User Story 2 - Maintainable Codebase Structure (Priority: P2)

**Goal**: Code organized according to Ignis patterns so developers can quickly find files and understand architecture

**Independent Test**: Verify directory structure matches Ignis component organization pattern and all files use correct naming conventions

### Implementation for User Story 2

- [X] T020 [P] [US2] Create scripts/check-structure.sh to validate directory structure per Ignis patterns
- [X] T021 [P] [US2] Create scripts/check-naming.sh to validate file naming conventions (kebab-case with type suffix)
- [X] T022 [US2] Add structure check script to package.json as "validate:structure"
- [X] T023 [US2] Add naming check script to package.json as "validate:naming"
- [X] T024 [US2] Document Ignis directory structure pattern in docs/developer-guide.md (create if not exists)
- [X] T025 [US2] Create example component structure in src/components/example/ with index.ts barrel export
- [X] T026 [P] [US2] Create example.component.ts in src/components/example/
- [X] T027 [P] [US2] Create example.controller.ts in src/components/example/
- [X] T028 [US2] Create common/ subdirectory in src/components/example/ with index.ts, types.ts, constants.ts

**Checkpoint**: At this point, the project structure follows Ignis patterns and developers have examples to follow

---

## Phase 5: User Story 3 - Type Safety and Developer Experience (Priority: P3)

**Goal**: Proper type definitions and IntelliSense support so developers can catch errors early and write code faster

**Independent Test**: Verify all interfaces use I prefix, type aliases use T prefix, and constants use static class patterns

### Implementation for User Story 3

- [X] T029 [P] [US3] Create scripts/check-interfaces.sh to validate I prefix convention
- [X] T030 [P] [US3] Create scripts/check-types.sh to validate T prefix convention
- [X] T031 [P] [US3] Create scripts/check-constants.sh to validate static class pattern (no enums)
- [X] T032 [US3] Add interface check script to package.json as "validate:interfaces"
- [X] T033 [US3] Add types check script to package.json as "validate:types"
- [X] T034 [US3] Add constants check script to package.json as "validate:constants"
- [X] T035 [P] [US3] Create example interfaces in src/components/example/common/types.ts following I prefix convention
- [X] T036 [P] [US3] Create example type aliases in src/components/example/common/types.ts following T prefix convention
- [X] T037 [US3] Create example constants class in src/components/example/common/constants.ts using static class pattern with SCHEME_SET and isValid()
- [X] T038 [US3] Add TConstValue import example in src/components/example/common/types.ts
- [X] T039 [US3] Create ESLint rules in .eslintrc.json for enforcing I/T prefix naming conventions
- [X] T040 [US3] Document type safety patterns in docs/developer-guide.md

**Checkpoint**: At this point, all type safety conventions are enforced and examples are provided

---

## Phase 6: User Story 1 - Developer Code Review Efficiency (Priority: P1)

**Goal**: Consistent code formatting and structure so developers can quickly understand the codebase

**Independent Test**: Run Prettier and ESLint on the codebase - zero errors/warnings on new/modified files

### Implementation for User Story 1

- [X] T041 [P] [US1] Create scripts/migrate-suppress.sh to add eslint-disable-next-line comments to existing violations
- [X] T042 [P] [US1] Create scripts/track-violations.sh to generate list of files with suppressed violations
- [X] T043 [US1] Add migration script to package.json as "migrate:suppress"
- [X] T044 [US1] Add tracking script to package.json as "migrate:track"
- [X] T045 [US1] Document gradual convergence strategy in docs/migration-guide.md
- [X] T046 [US1] Create .gitignore entries for violation tracking files if needed
- [X] T047 [US1] Run npm run validate:fix and document any existing violations found
- [X] T048 [US1] Create scripts/fix-file.sh to fix and validate a single file
- [X] T049 [US1] Add single-file fix script to package.json as "fix:file"

**Checkpoint**: At this point, the codebase has clear migration path and tools for gradual convergence

---

## Phase 7: Logging & Error Handling Patterns (Cross-Cutting)

**Goal**: Standardized logging and error handling formats across the codebase

- [x] T050 [P] Create scripts/check-logging.sh to validate [ClassName][methodName] format
- [x] T051 [P] Create scripts/check-errors.sh to validate getError usage with context
- [x] T052 Add logging check to package.json as "validate:logging"
- [x] T053 Add error check to package.json as "validate:errors"
- [x] T054 Create example in src/components/example/common/ showing proper logging format
- [x] T055 Create example in src/components/example/common/ showing proper error handling with getError

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final integration

- [x] T056 [P] Update README.md with quickstart reference and validation commands
- [x] T057 [P] Create CLAUDE.md entry documenting code style standards if not already present
- [x] T058 Create scripts/validate-all.sh that runs all validation scripts in sequence
- [x] T059 Add validate-all script to package.json as "validate:all"
- [x] T060 Run npm run validate:all and verify zero new violations
- [x] T061 Create GitHub Actions workflow in .github/workflows/validate.yml (if .github/ exists)
- [x] T062 Document all scripts in docs/scripts-reference.md
- [x] T063 Run quickstart.md validation checklist
- [x] T064 Verify all example files in src/components/example/ pass validation
- [x] T065 Create docs/troubleshooting.md with common issues and solutions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US4 & US1 (Phase 3) can start after Foundational - Tool configuration
  - US2 (Phase 4) can start after Foundational - Structure (independent of US4/US1)
  - US3 (Phase 5) can start after Foundational - Type safety (independent of others)
  - US1 (Phase 6) can start after Foundational - Migration tools (independent)
- **Logging/Error Handling (Phase 7)**: Can start after Foundational - cross-cutting patterns
- **Polish (Phase 8)**: Depends on all desired phases being complete

### User Story Dependencies

- **User Story 4 & 1 (Phase 3 - Tooling)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (Phase 4 - Structure)**: Can start after Foundational - Independent of other stories
- **User Story 3 (Phase 5 - Type Safety)**: Can start after Foundational - Independent of other stories
- **User Story 1 (Phase 6 - Migration)**: Can start after Foundational - Independent of other stories
- **Logging/Error Handling (Phase 7)**: Can start after Foundational - Applies to all stories

**Note**: All user stories are largely independent and can be implemented in parallel after Foundational phase completes.

### Within Each Phase

- Configuration files must be created before validation scripts
- Scripts must be created before being added to package.json
- Examples must be created before validation
- Documentation updates happen after implementation

### Parallel Opportunities

- **Phase 1**: All tasks T002-T005 can run in parallel (different ignore files)
- **Phase 2**: T009 can run parallel to T006-T008 (tsconfig.component.ts independent)
- **Phase 3**: T013-T014 can run in parallel (different scripts)
- **Phase 4**: T020-T021 can run in parallel, T026-T027 can run in parallel, T035-T036 can run in parallel
- **Phase 5**: T029-T031 can run in parallel, T035-T036 can run in parallel
- **Phase 6**: T041-T042 can run in parallel
- **Phase 7**: T050-T051 can run in parallel
- **Phase 8**: T056-T057 can run in parallel
- **Cross-Phase**: Once Foundational (Phase 2) completes, Phases 3-7 can all proceed in parallel

---

## Parallel Example: Foundational Phase Complete

```bash
# After Phase 2 completes, these can all run in parallel:

# Developer A: Tooling (Phase 3)
Task: "Create scripts/validate.sh that runs type-check, lint, and prettier checks"
Task: "Create scripts/validate-fix.sh that runs prettier:fix and lint:fix"

# Developer B: Structure (Phase 4)
Task: "Create scripts/check-structure.sh to validate directory structure per Ignis patterns"
Task: "Create example component structure in src/components/example/"

# Developer C: Type Safety (Phase 5)
Task: "Create scripts/check-interfaces.sh to validate I prefix convention"
Task: "Create example interfaces in src/components/example/common/types.ts"

# Developer D: Migration Tools (Phase 6)
Task: "Create scripts/migrate-suppress.sh to add eslint-disable comments"
```

---

## Parallel Example: User Story 2 Implementation

```bash
# Launch all structure validation scripts together:
Task: "Create scripts/check-structure.sh to validate directory structure per Ignis patterns"
Task: "Create scripts/check-naming.sh to validate file naming conventions"

# Launch all example component files together:
Task: "Create example.component.ts in src/components/example/"
Task: "Create example.controller.ts in src/components/example/"
```

---

## Parallel Example: User Story 3 Implementation

```bash
# Launch all type validation scripts together:
Task: "Create scripts/check-interfaces.sh to validate I prefix convention"
Task: "Create scripts/check-types.sh to validate T prefix convention"
Task: "Create scripts/check-constants.sh to validate static class pattern"

# Launch all example type files together:
Task: "Create example interfaces in src/components/example/common/types.ts"
Task: "Create example type aliases in src/components/example/common/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 4 & 1 Only - Tooling)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (configure tools)
3. Complete Phase 3: User Story 4 & 1 (validation scripts)
4. **STOP and VALIDATE**: Run `npm run validate` - all tools work
5. Developers can now use linting/formatting tools immediately

### Incremental Delivery

1. Complete Setup + Foundational → Tools configured and working
2. Add US4 & US1 (Phase 3) → Validation scripts → Run `npm run validate` (MVP!)
3. Add US2 (Phase 4) → Structure validation → Run `npm run validate:structure`
4. Add US3 (Phase 5) → Type safety validation → Run `npm run validate:types`
5. Add US1 (Phase 6) → Migration tools → Gradual convergence begins
6. Add Logging/Error Handling (Phase 7) → Pattern validation
7. Add Polish (Phase 8) → Documentation complete

Each phase adds value without breaking previous phases.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together
2. Once Foundational is done:
   - **Developer A**: Phase 3 - Tooling validation scripts
   - **Developer B**: Phase 4 - Structure and examples
   - **Developer C**: Phase 5 - Type safety validation
   - **Developer D**: Phase 6 - Migration tools
3. Phases complete independently
4. Team completes Logging/Error Handling (Phase 7) together
5. Team completes Polish (Phase 8) together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently deliverable
- All configuration files extend @venizia/dev-configs
- Migration strategy is gradual convergence - no big-bang reformatting
- Scripts are executable and idempotent
- Examples in src/components/example/ serve as reference for developers
- Commit after each task or logical group
- Stop at any checkpoint to validate phase independently
- Run `npm run validate` after each phase to ensure no regressions

---

## Task Summary

| Phase                   | Tasks  | Focus                         | Parallel Tasks |
| ----------------------- | ------ | ----------------------------- | -------------- |
| Phase 1: Setup          | 5      | Dependencies and ignore files | 3              |
| Phase 2: Foundational   | 7      | Core tooling configuration    | 1              |
| Phase 3: US4 & US1      | 7      | Validation scripts            | 2              |
| Phase 4: US2            | 9      | Structure and naming          | 3              |
| Phase 5: US3            | 12     | Type safety patterns          | 5              |
| Phase 6: US1            | 9      | Migration tools               | 2              |
| Phase 7: Logging/Errors | 6      | Cross-cutting patterns        | 2              |
| Phase 8: Polish         | 10     | Documentation and integration | 2              |
| **TOTAL**               | **65** | **All code style standards**  | **20**         |

**MVP Scope (Phases 1-3)**: 19 tasks - delivers working tooling configuration

---

## Format Validation

All tasks follow the required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- ✅ All tasks have checkbox `- [ ]`
- ✅ All tasks have sequential Task ID (T001-T065)
- ✅ Parallel tasks marked with `[P]`
- ✅ User story tasks marked with `[US#]`
- ✅ All descriptions include file paths or clear targets
