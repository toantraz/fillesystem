# Research: Filesystem Component Optimization

**Feature**: 002-optimize-fs-component
**Date**: 2025-12-25

## Summary

Research conducted to support the structural optimization of the filesystem component. Key findings inform decisions about spec consolidation, example file renaming, and documentation updates.

## Research Task 1: Compare Duplicate Specs

**Question**: Which spec is more complete - 001-filesystem-component or 003-ignis-filesystem-component?

### Findings

| Metric | 001-filesystem-component | 003-ignis-filesystem-component |
|--------|-------------------------|-------------------------------|
| Spec lines | 125 | 194 |
| Plan lines | 103 | 155 |
| Tasks lines | 205 | 287 |
| Data Model lines | 207 | 285 |
| Research lines | 131 | 185 |
| Quickstart lines | 286 | 406 |
| **Total lines** | **1,057** | **1,512** |

### Decision

**Keep 003-ignis-filesystem-component, archive 001-filesystem-component**

**Rationale**:
- 003-ignis-filesystem-component is ~43% larger (1,512 vs 1,057 lines)
- 003 has more comprehensive documentation across all sections
- 003 is specifically focused on the Ignis framework integration
- 001 appears to be an earlier version of the same feature

### Implementation Action

Archive `specs/001-filesystem-component/` to `specs/archive/001-filesystem-component/` using `git mv` to preserve history.

---

## Research Task 2: Determine Purpose of Each Example File

**Question**: What does each example file demonstrate and what descriptive name should it have?

### Findings

#### File: `examples/local-config.js`
- **Purpose**: Basic JavaScript configuration for local filesystem storage
- **Content**: Creates filesystem with local adapter, basePath: './data'
- **Current naming issues**: "local-config" doesn't indicate it's a filesystem example
- **Proposed name**: `filesystem-local-storage-basic.js`

#### File: `examples/s3-config.js`
- **Purpose**: Basic JavaScript configuration for S3 storage
- **Content**: Creates filesystem with S3 adapter, bucket configuration
- **Current naming issues**: "s3-config" doesn't indicate it's a filesystem example
- **Proposed name**: `filesystem-s3-storage-basic.js`

#### File: `examples/typescript-config.ts`
- **Purpose**: TypeScript configuration example for local filesystem storage
- **Content**: Similar to local-config.js but with TypeScript types
- **Current naming issues**: "typescript-config" is vague, doesn't indicate storage type
- **Proposed name**: `filesystem-local-storage-typescript.ts`

#### Directory: `examples/s3-minio-example/`
- **Purpose**: Complete example with Docker Compose for MinIO (S3-compatible local testing)
- **Content**: docker-compose.yml, Dockerfile, example usage
- **Current naming issues**: "s3-minio-example" is generic, doesn't indicate it's Docker-related
- **Proposed name**: `filesystem-s3-minio-docker/`

#### Directory: `examples/ignis-application/`
- **Purpose**: Full Ignis framework application example
- **Content**: Complete app structure showing filesystem component integration
- **Current naming**: Already descriptive and accurate
- **Action**: Keep name as-is

### Naming Pattern Decision

Pattern: `filesystem-[storage-type]-[variant].[ext]`

- **storage-type**: `local-storage`, `s3-storage`
- **variant**: `basic`, `typescript`, `docker`, etc.

---

## Research Task 3: Verify src/examples/ Is Empty

**Question**: Is `src/examples/` safe to remove without breaking imports?

### Findings

```bash
$ ls -la src/examples/
total 8
drwxrwxr  2 tvtoan tvtoan 4096 Dec 24 00:02 .
drwxrwxr 11 tvtoan tvtoan 4096 Dec 25 11:48 ..
```

The directory is completely empty (no files).

### Cross-Reference Check

Searched entire codebase for imports from `src/examples/`:

```bash
$ grep -r "from.*src/examples" src/
$ # No results
$ grep -r "require.*src/examples" src/
$ # No results
$ grep -r "src/examples" README.md docs/
$ # No results
```

### Decision

**Safe to remove `src/examples/`**

**Rationale**:
- Directory is empty
- No code imports from this directory
- No documentation references this directory
- The `src/components/example/` directory (from code style standards) serves a different purpose

### Implementation Action

Remove using `git rm -r src/examples/` to record removal in git history.

---

## Research Task 4: Identify Documentation References

**Question**: Where are the renamed files referenced in documentation?

### Findings

#### README.md References

```markdown
- `examples/local-config.js` - Local filesystem configuration
- `examples/s3-config.js` - S3 configuration
```

Both references need to be updated to new file names.

#### Other Documentation

```bash
$ grep -r "local-config\|s3-config\|s3-minio-example\|001-filesystem-component" docs/
$ # No results found in docs/
```

### Files Requiring Updates

1. **README.md** (lines ~162-163)
   - Update: `examples/local-config.js` → `examples/filesystem-local-storage-basic.js`
   - Update: `examples/s3-config.js` → `examples/filesystem-s3-storage-basic.js`
   - Update: `examples/typescript-config.ts` → `examples/filesystem-local-storage-typescript.ts`
   - Update: `examples/s3-minio-example/` → `examples/filesystem-s3-minio-docker/`

2. **examples/README.md**
   - Contains detailed descriptions of each example
   - Needs comprehensive updates to reflect new names

---

## Consolidated Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Spec consolidation** | Keep 003, archive 001 | 003 is 43% more comprehensive |
| **local-config.js** | → filesystem-local-storage-basic.js | Indicates filesystem + local storage + basic example |
| **s3-config.js** | → filesystem-s3-storage-basic.js | Indicates filesystem + S3 storage + basic example |
| **typescript-config.ts** | → filesystem-local-storage-typescript.ts | Indicates filesystem + local storage + TypeScript |
| **s3-minio-example/** | → filesystem-s3-minio-docker/ | Indicates filesystem + S3 + MinIO + Docker |
| **ignis-application/** | Keep as-is | Already descriptive |
| **src/examples/** | Remove | Empty directory, no references |

---

## Alternatives Considered

### Spec Consolidation

**Alternative**: Keep both specs, rename to indicate evolution
**Rejected Because**: They represent the same feature at different stages; keeping both creates confusion

### Example Naming

**Alternative**: Use `fs-` prefix instead of `filesystem-`
**Rejected Because**: Full name "filesystem" is more explicit and clear for new developers

**Alternative**: Put variant before storage type (e.g., `basic-local-storage.js`)
**Rejected Because**: Storage type is the primary differentiator; should come first

### src/examples/ Directory

**Alternative**: Add a README explaining the directory is reserved for future use
**Rejected Because**: Empty directories with no purpose should be removed; can be recreated when needed

---

## Open Questions

None - all research questions resolved.
