# Scripts Reference

This document describes all the validation and migration scripts available in the `scripts/` directory.

## Validation Scripts

### Main Validation Commands

| Script | Description | Usage |
|--------|-------------|-------|
| `validate.sh` | Run type-check, lint, and prettier checks | `npm run validate` |
| `validate-fix.sh` | Run prettier:fix and lint:fix | `npm run validate:fix` |
| `validate-all.sh` | Run all validation scripts | `npm run validate:all` |

### Individual Validation Scripts

| Script | Validates | Command |
|--------|-----------|---------|
| `check-structure.sh` | Directory structure per Ignis patterns | `npm run validate:structure` |
| `check-naming.sh` | File naming (kebab-case with type suffix) | `npm run validate:naming` |
| `check-interfaces.sh` | Interface naming (I prefix) | `npm run validate:interfaces` |
| `check-types.sh` | Type alias naming (T prefix) | `npm run validate:types` |
| `check-constants.sh` | Static class pattern (no enums) | `npm run validate:constants` |
| `check-logging.sh` | Logging format [ClassName][methodName] | Manual execution |
| `check-errors.sh` | Error handling with getError | Manual execution |

## Migration Scripts

| Script | Description | Command |
|--------|-------------|---------|
| `migrate-suppress.sh` | Guide for adding suppression comments | `npm run migrate:suppress` |
| `track-violations.sh` | Generate list of suppressed violations | `npm run migrate:track` |
| `fix-file.sh` | Fix and validate a single file | `npm run fix-file path/to/file.ts` |

## Usage Examples

### Validate Everything

```bash
# Run all checks
npm run validate

# Run all validation scripts
npm run validate:all

# Auto-fix all fixable issues
npm run validate:fix
```

### Validate Specific Categories

```bash
# Check directory structure
npm run validate:structure

# Check file naming conventions
npm run validate:naming

# Check type safety patterns
npm run validate:interfaces
npm run validate:types
npm run validate:constants
```

### Migration Workflow

```bash
# 1. Track existing violations
npm run migrate:track > violations-suppressed.txt

# 2. Fix a specific file
npm run fix-file src/adapters/s3-adapter.ts

# 3. Validate your changes
npm run validate
```

## Script Exit Codes

All scripts follow these exit code conventions:

- `0` - Success / Check passed
- `1` - Failure / Check failed / Validation error

## CI/CD Integration

For CI/CD pipelines, use the validate scripts:

```yaml
# GitHub Actions example
- name: Validate code style
  run: npm run validate:all
```

## Further Reading

- [migration-guide.md](./migration-guide.md) - Gradual convergence strategy
- [developer-guide.md](./developer-guide.md) - Code style patterns
- [quickstart.md](../specs/001-code-style-standards/quickstart.md) - Onboarding
