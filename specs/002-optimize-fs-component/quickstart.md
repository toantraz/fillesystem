# Quickstart: Filesystem Component Optimization

**Feature**: 002-optimize-fs-component
**Branch**: `002-optimize-fs-component`

## Overview

This quickstart guide helps you execute the filesystem component optimization tasks. The goal is to clean up the project structure by removing duplicates, standardizing naming conventions, and removing unused directories.

## Prerequisites

- Git access to the repository
- Bash shell for executing git commands
- Understanding of git mv for preserving history

## Phase 1: Spec Consolidation

### Task: Archive duplicate spec

The `001-filesystem-component` spec is a duplicate of `003-ignis-filesystem-component`. Archive it to preserve history while reducing confusion.

```bash
# Create archive directory
mkdir -p specs/archive

# Move the old spec to archive
git mv specs/001-filesystem-component specs/archive/001-filesystem-component

# Commit the change
git commit -m "chore: archive duplicate 001-filesystem-component spec

The 001-filesystem-component spec was an earlier version of the same
feature now documented in 003-ignis-filesystem-component. Archiving
to preserve history while reducing confusion."
```

**Verification**:
```bash
# Verify spec is archived
ls specs/archive/
ls specs/ | grep -v archive
```

---

## Phase 2: Rename Example Files

### Task: Rename examples to follow descriptive pattern

```bash
# Navigate to examples directory
cd examples

# Rename each file using git mv
git mv local-config.js filesystem-local-storage-basic.js
git mv s3-config.js filesystem-s3-storage-basic.js
git mv typescript-config.ts filesystem-local-storage-typescript.ts
git mv s3-minio-example filesystem-s3-minio-docker

# Navigate back to root
cd ..

# Commit the changes
git commit -m "refactor: rename example files with descriptive names

Rename examples to follow pattern: filesystem-[storage]-[variant].[ext]

- local-config.js → filesystem-local-storage-basic.js
- s3-config.js → filesystem-s3-storage-basic.js
- typescript-config.ts → filesystem-local-storage-typescript.ts
- s3-minio-example/ → filesystem-s3-minio-docker/

This makes the purpose of each example immediately clear."
```

**Verification**:
```bash
# List examples with new names
ls -la examples/
```

---

## Phase 3: Remove Empty Directory

### Task: Remove empty src/examples/ directory

```bash
# Remove the empty directory
git rm -r src/examples/

# Commit the change
git commit -m "chore: remove empty src/examples directory

The src/examples/ directory was empty and not referenced anywhere.
Removing to reduce clutter in the source tree."
```

**Verification**:
```bash
# Verify directory is removed
ls -la src/ | grep examples
# Should return nothing

# Verify no broken imports
npm run build
```

---

## Phase 4: Update Documentation References

### Task: Update README.md and examples/README.md

```bash
# Update README.md
# Replace examples/local-config.js with examples/filesystem-local-storage-basic.js
# Replace examples/s3-config.js with examples/filesystem-s3-storage-basic.js

# Update examples/README.md
# Update all file references to match new names

# Commit the changes
git commit -m "docs: update example file references in documentation

Update README.md and examples/README.md to reflect renamed example files."
```

**Verification**:
```bash
# Search for old names (should find nothing except in git history)
grep -r "local-config\|s3-config\|s3-minio-example" README.md examples/README.md docs/
```

---

## Phase 5: Validate Changes

### Task: Run all validation scripts

```bash
# Run complete validation
npm run validate:all

# Verify build still works
npm run build

# Verify tests still pass
npm test
```

**Expected Results**:
- All validation scripts pass
- Build completes successfully
- Tests pass (no broken imports)

---

## Completion Checklist

Use this checklist to verify all optimization tasks are complete:

- [ ] Duplicate spec archived (001-filesystem-component → specs/archive/)
- [ ] Example files renamed with descriptive names
- [ ] Empty directory removed (src/examples/)
- [ ] Documentation references updated (README.md, examples/README.md)
- [ ] All validation scripts pass (npm run validate:all)
- [ ] Build succeeds (npm run build)
- [ ] Tests pass (npm test)
- [ ] Git history preserved (used git mv for all moves)

---

## Troubleshooting

### "npm run build fails after renaming files"

**Issue**: Import paths may reference old file names

**Solution**: Check if any source files import from examples/ directory (unlikely):

```bash
grep -r "from.*examples" src/
```

### "npm run validate:all shows errors"

**Issue**: New file names may violate naming conventions

**Solution**: Verify all renamed files follow kebab-case pattern:

```bash
ls examples/
# Should show: filesystem-*.js, filesystem-*.ts
```

### "Git history lost after renaming"

**Issue**: Used regular `mv` instead of `git mv`

**Solution**: Git history can still be recovered:

```bash
# Check history of renamed file
git log --follow -- examples/filesystem-local-storage-basic.js
```

---

## Success Criteria

After completing all phases:

1. **SC-001**: Specs directory has no duplicates
   ```bash
   ls specs/ | grep -E "^[0-9]+-"
   # Should show: 001, 002, 003, 004 with no duplicates
   ```

2. **SC-002**: All examples have descriptive names
   ```bash
   ls examples/*.js examples/*.ts 2>/dev/null
   # Should show: filesystem-local-storage-basic.js, etc.
   ```

3. **SC-003**: No empty directories in src/
   ```bash
   find src -type d -empty
   # Should return nothing
   ```

4. **SC-006**: All validation passes
   ```bash
   npm run validate:all
   # Should complete successfully
   ```

---

## Rollback Plan

If something goes wrong, you can rollback using git:

```bash
# Reset to before optimization
git log --oneline | head -10  # Find the commit before optimization

# Reset to that commit (soft reset preserves changes)
git reset --soft <commit-hash>

# Or hard reset (discards all changes)
git reset --hard <commit-hash>
```
