# Migration Guide: Gradual Convergence to Code Style Standards

This guide explains how to migrate the existing codebase to meet Ignis coding standards using a gradual convergence approach.

## Strategy: Gradual Convergence

The migration strategy is **gradual convergence** - enforce standards on new/modified files only, while tracking existing violations for incremental remediation.

### Key Principles

1. **NEW files** must be 100% compliant - no exceptions
2. **MODIFIED files** should fix violations in the modified sections
3. **EXISTING files** can have suppressed violations for gradual fix

### For New Files

All new code must comply 100% with the standards:

```typescript
// ✅ GOOD - New code follows all conventions
import { IFileSystemAdapter } from "./adapters/filesystem-adapter";

type TReadOptions = {
  encoding?: BufferEncoding;
};

class FileSystemService {
  static readonly DEFAULT_OPTIONS = {
    timeout: 5000,
  } as const;

  constructor(private readonly options: IFileServiceOptions) {
    if (!options.rootPath) {
      throw new Error('[FileSystemService][constructor] rootPath is required');
    }
  }

  async readFile(path: string): Promise<Buffer> {
    this.logger?.info('[FileSystemService][readFile] Reading file | Path: %s', path);
    // ... implementation
  }
}
```

### For Modified Files

Fix violations in the sections you modify:

```typescript
// Old code you're not touching - suppress
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = getOldFormat();

// prettier-ignore
const oldStyle = {
    foo:'bar'
};

// New code you add - must be compliant
const newData: INewFormat = { foo: 'bar' };
```

### For Existing Files

Track violations for gradual remediation:

```bash
# Find all violations (for tracking)
npm run track-violations

# Fix a single file
npm run fix-file scripts/helper.ts
```

## Suppression Comments

### ESLint Suppression

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// eslint-disable-next-line @typescript-eslint/ban-types
function callback(fn: Function) { }
```

### Prettier Suppression

```typescript
// prettier-ignore
const poorlyFormatted = {
    foo:'bar'
};

// prettier-ignore-next-line
export const longLine = "some very long string that would otherwise be formatted to multiple lines";
```

## Migration Scripts

### Track Violations

```bash
npm run migrate:track
# Creates violations-suppressed.txt with all suppressed violations
```

### Fix Single File

```bash
npm run fix-file path/to/file.ts
# Runs prettier and eslint fix on a single file
```

## Migration Workflow

### Step 1: Initial Assessment

```bash
# Check current state
npm run validate

# Track existing violations
npm run migrate:track
```

### Step 2: Team Adoption

1. **Update CI/CD** to run `npm run validate` on PRs
2. **Enable pre-commit hooks** for auto-format on save
3. **Educate team** on standards (see `docs/developer-guide.md`)

### Step 3: Incremental Remediation

1. **Fix violations in files you modify** as part of regular work
2. **Pick a file per sprint** to fully remediate
3. **Track progress** with `npm run migrate:track`

### Step 4: Validation

```bash
# Run all validations
npm run validate:all

# Check specific categories
npm run validate:interfaces
npm run validate:types
npm run validate:constants
npm run validate:structure
npm run validate:naming
```

## What's Out of Scope

The following are explicitly **out of scope** for this migration:

- **Mass refactoring of all existing files** - No big-bang reformatting
- **Breaking changes** - API changes are out of scope
- **New functionality** - This is about code style, not features
- **Performance optimization** - Separate concern

## Success Criteria

Migration is considered complete when:

- ✅ All NEW code is 100% compliant
- ✅ All MODIFIED code in PRs is compliant
- ✅ Zero new violations introduced
- ✅ Existing violations are tracked and decreasing
- ✅ `npm run validate` passes on all PRs

## Troubleshooting

### ESLint errors on existing code

Suppress with `// eslint-disable-next-line` for gradual fix:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyValue: any = getLegacyValue();
```

### Prettier wants to reformat large files

Use `// prettier-ignore` selectively:

```typescript
// prettier-ignore
const largeObject = { /* existing format */ };
```

### Type errors on existing code

Track for gradual remediation - fix when working on that file:

```typescript
// TODO: Fix type - currently using any for legacy compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyFetch();
```

## Further Reading

- [developer-guide.md](./developer-guide.md) - Code style patterns
- [quickstart.md](../specs/001-code-style-standards/quickstart.md) - Onboarding guide
- [contracts/naming-conventions.md](../specs/001-code-style-standards/contracts/naming-conventions.md) - Naming rules
