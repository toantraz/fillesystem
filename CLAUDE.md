# filesystem Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-25

## Active Technologies
- TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (framework), @aws-sdk/client-s3 (S3 adapter) (002-optimize-fs-component)
- Files (local filesystem), S3-compatible storage (MinIO for testing) (002-optimize-fs-component)
- TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (application framework), @hono/zod-openapi (web framework), Zod (validation) (001-upload-service-example)
- Local filesystem (LocalAdapter) - extensible to S3/MinIO via S3Adapter (001-upload-service-example)
- TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (application framework), Hono (HTTP router), Zod (validation) (001-upload-service-example)
- Local filesystem via FilesystemComponent with LocalAdapter (extensible to S3Adapter) (001-upload-service-example)

- TypeScript 5.0+ (Node.js 18+) (001-s3-example)
- S3-compatible (MinIO for local testing) (001-s3-example)
- TypeScript 5.0+, Node.js 18+ (001-code-style-standards)
- TypeScript 5.0+, Node.js 18+ (004-ignis-example-app)

## Project Structure

```text
src/
tests/
```

## Commands

```bash
# Testing
npm test

# Validation (run before committing)
npm run validate

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run prettier
npm run prettier:fix

# All validation scripts
npm run validate:all
```

## Code Style

This project follows **Ignis coding standards** from VENIZIA-AI/Ignis.

### Key Conventions

1. **File Naming**: kebab-case with type suffix
   - `file-system.component.ts`
   - `s3-adapter.adapter.ts`
   - `user.controller.ts`

2. **Class Naming**: [Feature][Type] pattern
   - `FileSystemComponent`
   - `S3Adapter`
   - `UserController`

3. **Type Safety**:
   - Interfaces use `I` prefix: `IUserService`, `IFileSystem`
   - Type aliases use `T` prefix: `TUserRequest`, `TFileStats`
   - Static classes instead of enums for constants

4. **Logging Format**: `[ClassName][methodName] message`
   - `[FileSystemComponent][readFile] Reading file: /path/to/file`

5. **Error Handling**: Use `getError()` with context
   - `throw getError("File not found", "FILE_NOT_FOUND", { path: "/file.txt" })`

6. **Directory Structure**:
   - Every directory has `index.ts` barrel export
   - Components organized by feature
   - Shared types in `common/` subdirectories

### Validation Scripts

```bash
# Directory structure (index.ts in each directory)
npm run validate:structure

# File naming (kebab-case with type suffix)
npm run validate:naming

# Interface naming (I prefix)
npm run validate:interfaces

# Type alias naming (T prefix)
npm run validate:types

# Constants (static classes, no enums)
npm run validate:constants

# Logging format ([ClassName][methodName])
npm run validate:logging

# Error handling (getError with context)
npm run validate:errors
```

### Migration (Existing Code)

For existing code that doesn't meet standards, use gradual convergence:

```bash
# Track suppressed violations
npm run migrate:track > violations-suppressed.txt

# Fix and validate a single file
npm run fix-file path/to/file.ts
```

### Documentation

- [Developer Guide](docs/developer-guide.md) - Full coding standards reference
- [Migration Guide](docs/migration-guide.md) - Gradual convergence strategy
- [Scripts Reference](docs/scripts-reference.md) - All validation scripts
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [Quickstart](specs/001-code-style-standards/quickstart.md) - Onboarding checklist

### Example Implementation

See `src/components/example/` for reference implementation demonstrating all patterns:
- `example.component.ts` - Component with logging and error handling
- `example.controller.ts` - Controller with proper naming
- `common/types.ts` - Interfaces and type aliases with I/T prefixes
- `common/constants.ts` - Static class constants pattern

## Recent Changes
- 001-upload-service-example: Added TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (application framework), Hono (HTTP router), Zod (validation)
- 001-upload-service-example: Added TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (application framework), @hono/zod-openapi (web framework), Zod (validation)
- 002-optimize-fs-component: Added TypeScript 5.0+ (Node.js 18+) + @venizia/ignis (framework), @aws-sdk/client-s3 (S3 adapter)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
