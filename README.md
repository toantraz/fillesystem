# Filesystem Component

A transparent filesystem abstraction library that provides a consistent interface for file operations across multiple storage backends (local filesystem and AWS S3). The library maintains Node.js fs module compatibility while allowing developers to switch between storage backends through configuration only.

## Features

- **Unified API**: Consistent interface across different storage backends
- **Multiple Backends**: Support for local filesystem and AWS S3
- **Node.js fs Compatibility**: Familiar API based on Node.js fs module
- **TypeScript Support**: Full TypeScript definitions included
- **Streaming Support**: Readable and writable streams for large files
- **Error Handling**: Comprehensive error hierarchy with proper error mapping
- **Configuration Flexibility**: Environment variable support and validation

## Installation

```bash
npm install @ignis/filesystem
```

## Quick Start

### Basic Usage

```typescript
import { createFilesystem } from "@ignis/filesystem";

// Create a local filesystem instance
const localFs = createFilesystem({
  type: "local",
  local: {
    basePath: "./storage",
    createMissingDirs: true,
  },
});

// Create an S3 filesystem instance
const s3Fs = createFilesystem({
  type: "s3",
  s3: {
    bucket: "my-bucket",
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    prefix: "my-app/",
  },
});

// Use the same API for both backends
await localFs.writeFile("/test.txt", "Hello, Local!");
await s3Fs.writeFile("/test.txt", "Hello, S3!");

const localContent = await localFs.readFile("/test.txt", "utf8");
const s3Content = await s3Fs.readFile("/test.txt", "utf8");
```

### Using Environment Variables

```typescript
import { createFilesystem } from "@ignis/filesystem";
import { ConfigValidator } from "@ignis/filesystem";

// Load configuration from environment variables
const config = ConfigValidator.fromEnvironment();
if (config) {
  const fs = createFilesystem(config);
  // Use the filesystem...
}
```

Environment variables:

- `FILESYSTEM_TYPE`: `local` or `s3`
- `FILESYSTEM_LOCAL_BASE_PATH`: Base path for local storage
- `FILESYSTEM_S3_BUCKET`: S3 bucket name
- `FILESYSTEM_S3_REGION`: AWS region
- `AWS_ACCESS_KEY_ID`: AWS access key (also used for S3)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (also used for S3)

## API Reference

### Core Methods

#### File Operations

- `readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>`
- `writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>`
- `appendFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>`
- `unlink(path: string): Promise<void>`
- `copyFile(src: string, dest: string): Promise<void>`
- `rename(oldPath: string, newPath: string): Promise<void>`

#### Directory Operations

- `readdir(path: string): Promise<string[]>`
- `mkdir(path: string, options?: { recursive?: boolean }): Promise<void>`
- `rmdir(path: string, options?: { recursive?: boolean }): Promise<void>`

#### File Information

- `stat(path: string): Promise<FileStats>`
- `lstat(path: string): Promise<FileStats>`
- `access(path: string, mode?: number): Promise<void>`
- `exists(path: string): Promise<boolean>`
- `realpath(path: string): Promise<string>`

#### Streaming

- `createReadStream(path: string, options?: ReadStreamOptions): Readable`
- `createWriteStream(path: string, options?: WriteStreamOptions): Writable`

### Configuration

#### Local Filesystem Configuration

```typescript
{
  type: 'local',
  local: {
    basePath: string,           // Base directory for all operations
    createMissingDirs: boolean, // Whether to create missing directories automatically
    timeout?: number,           // Operation timeout in milliseconds
    maxRetries?: number,        // Maximum number of retries for failed operations
    debug?: boolean,            // Enable debug logging
  },
  common: {
    timeout?: number,           // Common timeout for all operations
    maxRetries?: number,        // Common retry count for all operations
    debug?: boolean,            // Common debug setting
  }
}
```

#### S3 Configuration

```typescript
{
  type: 's3',
  s3: {
    bucket: string,             // S3 bucket name
    region: string,             // AWS region
    accessKeyId?: string,       // AWS access key ID
    secretAccessKey?: string,   // AWS secret access key
    endpoint?: string,          // Custom S3 endpoint
    forcePathStyle?: boolean,   // Use path-style addressing
    prefix?: string,            // Key prefix for all operations
    timeout?: number,           // S3-specific timeout
    maxRetries?: number,        // S3-specific retry count
    debug?: boolean,            // Enable debug logging
  },
  common: {
    timeout?: number,           // Common timeout for all operations
    maxRetries?: number,        // Common retry count for all operations
    debug?: boolean,            // Common debug setting
  }
}
```

## Examples

See the `examples/` directory for complete usage examples:

**Simple Examples:**
- `examples/filesystem-local-storage-basic.js` - Local filesystem basic operations
- `examples/filesystem-s3-storage-basic.js` - S3 basic operations
- `examples/filesystem-local-storage-typescript.ts` - TypeScript basic example

**Comprehensive Examples (All Operations):**
- `examples/filesystem-local-storage-comprehensive.js` - Complete local filesystem operations
- `examples/filesystem-local-storage-comprehensive.ts` - Complete TypeScript example
- `examples/filesystem-s3-storage-comprehensive.js` - Complete S3 operations

**Full Applications:**
- `examples/s3-minio-application/` - S3 with MinIO (Docker setup)
- `examples/local-storage-application/` - Local storage (Ignis framework application)

## Error Handling

The library provides a comprehensive error hierarchy:

```typescript
import {
  FilesystemError,
  FileNotFoundError,
  PermissionError,
  StorageError,
  NetworkError,
  ValidationError,
} from "@ignis/filesystem";

try {
  await fs.readFile("/non-existent.txt");
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log("File not found:", error.message);
  } else if (error instanceof PermissionError) {
    console.log("Permission denied:", error.message);
  }
  // Other error types...
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Building

Build the library:

```bash
npm run build
```

## Code Style Standards

This project follows Ignis coding standards. See the [quickstart guide](specs/001-code-style-standards/quickstart.md) for onboarding.

### Validation

Run all validation checks:

```bash
# Run type checking, linting, and formatting checks
npm run validate

# Run all validation scripts (structure, naming, types, constants, etc.)
npm run validate:all

# Auto-fix formatting and linting issues
npm run validate:fix
```

### Individual Checks

```bash
# Type checking
npm run type-check

# ESLint
npm run lint
npm run lint:fix

# Prettier
npm run prettier
npm run prettier:fix

# Directory structure
npm run validate:structure

# File naming conventions
npm run validate:naming

# Type safety patterns (I/T prefixes)
npm run validate:interfaces
npm run validate:types

# Constants pattern (static classes)
npm run validate:constants

# Logging and error patterns
npm run validate:logging
npm run validate:errors
```

### Migration

For existing code that doesn't meet standards:

```bash
# Track suppressed violations
npm run migrate:track > violations-suppressed.txt

# Fix and validate a single file
npm run fix-file path/to/file.ts
```

For more details, see:
- [Developer Guide](docs/developer-guide.md) - Code style patterns and conventions
- [Migration Guide](docs/migration-guide.md) - Gradual convergence strategy
- [Scripts Reference](docs/scripts-reference.md) - All validation and migration scripts
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## License

MIT
