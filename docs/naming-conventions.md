# Naming Conventions

This document describes the naming conventions used throughout the filesystem component project.

## File Naming

### Kebab-case for Files

All source files use kebab-case (lowercase with hyphens separating words):

```
✅ Good:
- filesystem-adapter.ts
- s3-adapter.ts
- local-adapter.ts
- path-utils.ts

❌ Bad:
- FileSystemAdapter.ts  (PascalCase)
- filesystem_adapter.ts  (snake_case)
- FilesystemAdapter.ts  (mixed case)
```

### Type Suffixes

Component files include type suffixes to indicate their purpose:

```
- *.adapter.ts     - Storage adapter implementations
- *.component.ts   - Ignis framework components
- *.controller.ts  - Request/response handlers
- *.service.ts     - Business logic services
- *.utils.ts       - Utility functions
- *.types.ts       - Type definitions
- *.interface.ts   - TypeScript interfaces (if not combined)
- *.constants.ts   - Constant definitions
```

### Example File Naming Pattern

Example files follow the pattern: `filesystem-[storage-type]-[variant].[ext]`

- **storage-type**: `local-storage`, `s3-storage`
- **variant**: `basic`, `typescript`, `docker`, etc.
- **ext**: `js`, `ts`

Examples:
- `filesystem-local-storage-basic.js`
- `filesystem-s3-storage-basic.js`
- `filesystem-local-storage-typescript.ts`
- `filesystem-s3-minio-docker/`

## Class Naming

### PascalCase for Classes

All class names use PascalCase (capital first letter, capitalized word boundaries):

```typescript
✅ Good:
class FilesystemComponent {}
class LocalAdapter {}
class S3Adapter {}
class PathUtils {}

❌ Bad:
class filesystemComponent {}  (camelCase)
class filesystem_adapter {}  (snake_case)
class FILESYSTEM_ADAPTER {}  (UPPER_CASE)
```

### Descriptive Suffixes

Class names include descriptive suffixes to indicate their role:

```typescript
class FilesystemComponent {}  // Ignis component
class LocalAdapter {}          // Storage adapter
class FileSystemService {}    // Service layer
class FileController {}       // Controller
class PathUtils {}            // Utilities
```

## Interface Naming

### I Prefix for Interfaces

All interfaces use `I` prefix followed by PascalCase:

```typescript
✅ Good:
interface IFilesystem {}
interface IAdapter {}
interface IConfig {}
interface IFileStats {}

❌ Bad:
interface Filesystem {}     (no prefix)
interface IfileSystem {}     (lowercase 'f' after prefix)
interface I_FILESYSTEM {}    (all caps)
```

### Interface Suffixes

Interface names often include type suffixes:

```typescript
interface IFilesystemAdapter {}
interface IFilesystemService {}
interface IConfig {}
interface IOptions {}
```

## Type Alias Naming

### T Prefix for Type Aliases

All type aliases use `T` prefix followed by PascalCase:

```typescript
✅ Good:
type TFileStats = {}
type TConfigOptions = {}
type TAdapterMap = {}
type TFileCallback = {}

❌ Bad:
type FileStats = {}      (no prefix)
type TfileStats = {}      (lowercase 'f' after prefix)
type T_FILE_STATS = {}    (all caps)
```

### Type Alias Patterns

Type aliases describe the shape of data:

```typescript
type TFileStats = {
  size: number;
  mtime: Date;
  isFile: boolean;
  isDirectory: boolean;
};

type TConfigOptions = {
  type: 'local' | 's3';
  basePath?: string;
  bucket?: string;
};

type TAdapterMap = Map<string, IAdapter>;
type TFileCallback = (error: Error | null, data?: Buffer) => void;
```

## Constants

### SCREAMING_SNAKE_CASE for Constants

Constant values use SCREAMING_SNAKE_CASE (all caps with underscores):

```typescript
✅ Good:
const MAX_FILE_SIZE = 1024 * 1024 * 100;  // 100MB
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;

❌ Bad:
const maxFileSize = 100;       (camelCase)
const MaxFileSize = 100;       (mixed case)
const MAX_FILESIZE = 100;      (no word separator)
```

### Static Class Constants Pattern

For groups of related constants, use static classes instead of enums:

```typescript
✅ Good (Static Class Pattern):
export class FilesystemConstants {
  static readonly MAX_FILE_SIZE = 1024 * 1024 * 100;
  static readonly DEFAULT_TIMEOUT = 30000;
  static readonly MAX_RETRIES = 3;

  static readonly Values = {
    MAX_FILE_SIZE: 1024 * 1024 * 100,
    DEFAULT_TIMEOUT: 30000,
    MAX_RETRIES: 3,
  } as const;

  static isValid(value: number): boolean {
    return value > 0 && value <= this.MAX_FILE_SIZE;
  }
}

❌ Bad (Enum Pattern):
enum FilesystemConstants {
  MAX_FILE_SIZE = 100,
  DEFAULT_TIMEOUT = 30000,
}
```

**Rationale**: Static classes provide better tree-shaking, runtime validation, and are more flexible than enums.

## Directory Naming

### Kebab-case for Directories

All directories use kebab-case:

```
✅ Good:
src/adapters/
src/components/
src/interfaces/
src/utils/

❌ Bad:
src/Adapters/         (PascalCase)
src/adapters_utils/   (snake_case)
src/adaptersUtils/    (camelCase)
```

## Function and Method Naming

### camelCase for Functions

Functions and methods use camelCase (lowercase first letter, capitalized word boundaries):

```typescript
✅ Good:
function createFilesystem() {}
async function readFile() {}
function getFilePath() {}

❌ Bad:
function CreateFilesystem() {}  (PascalCase)
function create_filesystem() {} (snake_case)
function CREATE_FILESYSTEM() {} (UPPER_CASE)
```

### Verb-Noun Pattern

Function names typically follow a verb-noun pattern:

```typescript
✅ Good:
function readFile() {}
function writeFile() {}
function createDirectory() {}
function getFilePath() {}
function isValidConfig() {}

❌ Less Clear:
function file() {}          (unclear action)
function directory() {}     (unclear action)
function path() {}          (unclear action)
```

## Variable Naming

### camelCase for Variables

Variables use camelCase:

```typescript
✅ Good:
const filePath = '/path/to/file';
const fileSystem = createFilesystem();
const maxRetries = 3;

❌ Bad:
const FilePath = '/path/to/file';     (PascalCase)
const file_path = '/path/to/file';    (snake_case)
const FILE_PATH = '/path/to/file';    (UPPER_CASE)
```

### Boolean Variables

Boolean variables often use prefixes like `is`, `has`, `can`, `should`:

```typescript
✅ Good:
const isValid = true;
const hasPermission = false;
const canRead = true;
const shouldRetry = false;

❌ Less Clear:
const valid = true;       (unclear it's boolean)
const permission = false;  (unclear it's boolean)
```

## Generics

### T Prefix for Generic Types

Generic type parameters use single uppercase letters, often starting with `T`:

```typescript
✅ Good:
interface IAdapter<T> {}
class Container<T> {}
function map<T, U>(array: T[], fn: (item: T) => U): U[] {}

❌ Bad:
interface IAdapter<Type> {}  (verbose)
class Container<DataT> {}  (verbose)
```

## Test Naming

### Descriptive Test Names

Test names describe what is being tested and the expected outcome:

```typescript
✅ Good:
describe('FilesystemComponent', () => {
  it('should create a local filesystem instance', () => {});
  it('should read file contents correctly', () => {});
  it('should throw error when file not found', () => {});
});

❌ Bad:
describe('FilesystemComponent', () => {
  it('works', () => {});
  it('test1', () => {});
  it('test reading', () => {});
});
```

## Summary

| Entity | Convention | Example |
|--------|-----------|---------|
| Files | kebab-case | `filesystem-adapter.ts` |
| Classes | PascalCase | `FilesystemComponent` |
| Interfaces | I prefix + PascalCase | `IFilesystem` |
| Type Aliases | T prefix + PascalCase | `TFileStats` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Functions | camelCase | `createFilesystem()` |
| Variables | camelCase | `filePath` |
| Directories | kebab-case | `src/adapters/` |
| Examples | `filesystem-[type]-[variant].[ext]` | `filesystem-local-storage-basic.js` |
