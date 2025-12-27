# Implementation Plan: Filesystem Component Optimization

**Branch**: `002-optimize-fs-component` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-optimize-fs-component/spec.md`

## Summary

Optimize the filesystem component project structure by removing duplicates, standardizing naming conventions, and cleaning up unused code. This is a structural refactoring effort that organizes the existing @venizia/ignis framework filesystem component without changing any core functionality.

Key changes:
- Consolidate duplicate feature specifications (001-filesystem-component and 003-ignis-filesystem-component)
- Rename example files to follow descriptive pattern: `filesystem-[purpose]-[backend].[ext]`
- Remove empty directories (src/examples/)
- Update documentation references to reflect structural changes

## Technical Context

**Language/Version**: TypeScript 5.0+ (Node.js 18+)
**Primary Dependencies**: @venizia/ignis (framework), @aws-sdk/client-s3 (S3 adapter)
**Storage**: Files (local filesystem), S3-compatible storage (MinIO for testing)
**Testing**: Jest (unit tests), ESLint/Prettier (code quality)
**Target Platform**: Node.js 18+ server environment
**Project Type**: Single library (npm package: @ignis/filesystem)
**Performance Goals**: No performance changes (structural refactoring only)
**Constraints**: Must preserve git history (use git mv), must not break existing imports, must pass all validation scripts
**Scale/Scope**: ~100 source files, ~10 example files, ~5 feature specs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: PASSED

This project does not have a defined constitution file (template present in `.specify/memory/constitution.md`). Following the established code style standards from [001-code-style-standards](../001-code-style-standards/):

- **Code Style**: Follow Ignis framework conventions (kebab-case files, PascalCase classes, I/T prefixes)
- **Git History**: Use `git mv` for file moves to preserve history
- **Testing**: All existing tests must continue passing
- **Documentation**: Keep documentation synchronized with code changes

## Project Structure

### Documentation (this feature)

```text
specs/002-optimize-fs-component/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Current structure (before optimization)
src/
├── adapters/            # S3 adapter implementation
├── components/          # Component code (including example for code style standards)
├── core/                # Filesystem factory
├── errors/              # Error classes
├── examples/            # EMPTY - to be removed (FR-003)
├── interfaces/          # Filesystem interface
├── mocks/               # Ignis core mocks for testing
├── types/               # Configuration types
├── utils/               # Utility functions
├── component.ts         # Main FilesystemComponent class
└── index.ts             # Package exports

# Examples directory (before optimization)
examples/
├── local-config.js              # TO BE RENAMED: filesystem-local-storage-basic.js
├── s3-config.js                 # TO BE RENAMED: filesystem-s3-storage-basic.js
├── typescript-config.ts         # TO BE RENAMED: filesystem-local-storage-typescript.ts
├── README.md                    # To be updated with new file names
├── ignis-application/           # Example Ignis app (keep name)
└── s3-minio-example/            # TO BE RENAMED: filesystem-s3-minio-docker/

# Specs directory (before optimization)
specs/
├── 001-code-style-standards/    # Keep (unique feature)
├── 001-filesystem-component/    # TO BE CONSOLIDATED into 003
├── 001-s3-example/               # Keep (unique feature)
├── 002-optimize-fs-component/   # This feature
├── 003-ignis-filesystem-component/  # KEEP (most complete)
└── 004-ignis-example-app/        # Keep (unique feature)
```

**Structure Decision**: Single TypeScript library package with examples in `examples/` directory. The `src/components/example/` directory is preserved for code style standards demonstrations (created by 001-code-style-standards).

## Complexity Tracking

> **No violations to justify** - this is a cleanup/optimization effort with no new complexity introduced.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A       | N/A        | N/A                                   |

## Phase 0: Research

### Research Tasks

1. **Determine which spec is more complete** (001-filesystem-component vs 003-ignis-filesystem-component)
   - Compare spec.md, plan.md, tasks.md in both directories
   - Identify which has more complete documentation
   - Decision: Keep the more complete spec, archive the other

2. **Determine purpose of each example file**
   - Review local-config.js, s3-config.js, typescript-config.ts
   - Review s3-minio-example/ and ignis-application/ directories
   - Determine naming pattern that best describes each example's purpose

3. **Verify src/examples/ is truly empty**
   - Check if any code references files in src/examples/
   - Confirm safe to remove without breaking imports

4. **Identify all documentation references to renamed/moved files**
   - Search README.md for references to example files
   - Search other documentation for spec references
   - Create checklist of references to update

## Phase 1: Design & Contracts

### Data Model

This feature does not introduce new data structures. It reorganizes existing code. See [data-model.md](./data-model.md) for the entity definitions from the spec.

### File Structure Changes

| Current Path | New Path | Reason |
|--------------|----------|--------|
| `specs/001-filesystem-component/` | (archived) | Duplicate of 003-ignis-filesystem-component |
| `examples/local-config.js` | `examples/filesystem-local-storage-basic.js` | Descriptive naming |
| `examples/s3-config.js` | `examples/filesystem-s3-storage-basic.js` | Descriptive naming |
| `examples/typescript-config.ts` | `examples/filesystem-local-storage-typescript.ts` | Descriptive naming |
| `examples/s3-minio-example/` | `examples/filesystem-s3-minio-docker/` | Descriptive naming |
| `src/examples/` | (removed) | Empty directory |

### Validation Checklist

After structural changes, verify:

- [ ] All example files renamed correctly
- [ ] All documentation references updated (README.md, docs/)
- [ ] No broken imports (run `npm run build`)
- [ ] All validation scripts pass (npm run validate:all)
- [ ] Git history preserved (check with `git log --follow`)
- [ ] CI/CD pipeline passes (GitHub Actions)

## Implementation Notes

### Preserving Git History

When moving/deleting files, use git commands to preserve history:

```bash
# For renaming files
git mv examples/local-config.js examples/filesystem-local-storage-basic.js

# For removing directories
git rm -r src/examples/

# For archiving a spec directory
# Create specs/archive/ and move there
git mv specs/001-filesystem-component/ specs/archive/
```

### Documentation Updates

References to update:
- `README.md` - Examples section
- `docs/developer-guide.md` - Project structure references
- `examples/README.md` - File listings

### Naming Convention Pattern

Example files follow: `filesystem-[purpose]-[variant].[ext]`

- **purpose**: What the example demonstrates (local-storage, s3-storage, etc.)
- **variant**: Distinguishing characteristic (basic, typescript, docker, etc.)
- **ext**: File extension (js, ts)

## Success Criteria Verification

Each success criterion from the spec must be verified:

- **SC-001**: `ls specs/ | grep -E '^[0-9]+-.*'` shows no duplicates
- **SC-002**: `ls examples/` shows all files match pattern `filesystem-*.js/ts`
- **SC-003**: `find src -type d -empty` returns no results
- **SC-004**: `grep -r "local-config\|s3-config\|s3-minio-example" README.md docs/` returns no results (or only results in comments/historical notes)
- **SC-006**: `npm run validate:all` passes with zero new errors
- **SC-007**: Count files before and after; verify 10% reduction

## Dependencies

- **001-code-style-standards**: Defines naming conventions to follow
- **Existing tests**: Must continue passing after structural changes
- **CI/CD**: GitHub Actions must validate the changes
