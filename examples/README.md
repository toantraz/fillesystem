# Filesystem Component Examples

This directory contains examples and configuration documentation for the Filesystem Component library.

## Quick Start

### Installation

```bash
npm install @ignis/filesystem
```

### Basic Usage

```javascript
const { createFilesystem } = require("@ignis/filesystem");

// Create a local filesystem instance
const fs = createFilesystem({
  type: "local",
  local: {
    basePath: "./data",
    createMissingDirs: true,
  },
});

// Use the filesystem
await fs.writeFile("/test.txt", "Hello, World!", "utf8");
const content = await fs.readFile("/test.txt", "utf8");
```

## Configuration Reference

### Common Configuration Options

All configurations support these common options:

| Option              | Type              | Default       | Description                                  |
| ------------------- | ----------------- | ------------- | -------------------------------------------- |
| `type`              | `'local' \| 's3'` | **Required**  | Storage backend type                         |
| `common.timeout`    | `number`          | `30000` (30s) | Operation timeout in milliseconds            |
| `common.maxRetries` | `number`          | `3`           | Maximum retry attempts for failed operations |
| `common.debug`      | `boolean`         | `false`       | Enable debug logging                         |
| `common.logger`     | `function`        | `console.log` | Custom logger function                       |

### Local Filesystem Configuration

Use when `type: 'local'`:

```javascript
{
  type: 'local',
  local: {
    basePath: './data',           // Base directory for operations
    createMissingDirs: true,      // Auto-create missing directories
  },
  common: {
    timeout: 30000,
    maxRetries: 3,
    debug: process.env.NODE_ENV !== 'production',
  }
}
```

**Local-specific options:**

- `basePath`: Root directory for all file operations. Relative paths are resolved relative to this directory.
- `createMissingDirs`: When `true`, directories are automatically created as needed.

### AWS S3 Configuration

Use when `type: 's3'`:

```javascript
{
  type: 's3',
  s3: {
    bucket: 'my-app-bucket',      // S3 bucket name (required)
    region: 'us-east-1',          // AWS region (required)
    accessKeyId: 'AKIA...',       // AWS access key (optional - uses AWS credentials chain)
    secretAccessKey: 'secret...', // AWS secret key (optional - uses AWS credentials chain)
    endpoint: 'https://...',      // Custom endpoint for S3-compatible services
    forcePathStyle: false,        // Use path-style addressing
    prefix: 'uploads/',           // Key prefix (virtual directory)
    timeout: 60000,               // S3-specific timeout
    maxRetries: 5,                // S3-specific retry count
  },
  common: {
    timeout: 30000,
    maxRetries: 3,
    debug: true,
  }
}
```

**S3-specific options:**

- `bucket`: **Required**. S3 bucket name.
- `region`: **Required**. AWS region (e.g., `us-east-1`, `eu-west-1`).
- `accessKeyId` / `secretAccessKey`: Optional. Uses AWS credentials chain if not provided (environment variables, IAM roles, etc.).
- `endpoint`: Optional. For S3-compatible services (MinIO, DigitalOcean Spaces, etc.).
- `forcePathStyle`: Optional. Required for some S3-compatible services.
- `prefix`: Optional. All S3 keys will be prefixed with this value.
- `timeout`: Optional. S3-specific timeout (overrides common timeout).
- `maxRetries`: Optional. S3-specific retry count (overrides common maxRetries).

## Environment Variables

The library can be configured entirely through environment variables:

### Common Environment Variables

- `FILESYSTEM_TYPE`: `'local'` or `'s3'` (required)
- `FILESYSTEM_TIMEOUT`: Operation timeout in milliseconds
- `FILESYSTEM_MAX_RETRIES`: Maximum retry attempts
- `FILESYSTEM_DEBUG`: Enable debug logging (`'true'` or `'false'`)

### Local Filesystem Environment Variables

- `FILESYSTEM_LOCAL_BASE_PATH`: Base directory path
- `FILESYSTEM_LOCAL_CREATE_MISSING_DIRS`: Auto-create directories (`'true'` or `'false'`)

### AWS S3 Environment Variables

- `FILESYSTEM_S3_BUCKET`: S3 bucket name (required)
- `FILESYSTEM_S3_REGION`: AWS region (required)
- `FILESYSTEM_S3_ACCESS_KEY_ID`: AWS access key ID (optional)
- `FILESYSTEM_S3_SECRET_ACCESS_KEY`: AWS secret access key (optional)
- `FILESYSTEM_S3_ENDPOINT`: Custom S3 endpoint
- `FILESYSTEM_S3_FORCE_PATH_STYLE`: Use path-style addressing (`'true'` or `'false'`)
- `FILESYSTEM_S3_PREFIX`: Key prefix
- `FILESYSTEM_S3_TIMEOUT`: S3-specific timeout
- `FILESYSTEM_S3_MAX_RETRIES`: S3-specific retry count

**Note:** S3 credentials can also be set using standard AWS environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Example: Environment-based Configuration

```bash
# Local filesystem
export FILESYSTEM_TYPE=local
export FILESYSTEM_LOCAL_BASE_PATH=./data
export FILESYSTEM_LOCAL_CREATE_MISSING_DIRS=true

# S3 filesystem
export FILESYSTEM_TYPE=s3
export FILESYSTEM_S3_BUCKET=my-bucket
export FILESYSTEM_S3_REGION=us-east-1
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
```

```javascript
// Create filesystem from environment variables
const { createFilesystemFromEnv } = require("@ignis/filesystem");
const fs = createFilesystemFromEnv();
```

## Examples

### 1. Local Filesystem (JavaScript)

**Basic Example**: [`filesystem-local-storage-basic.js`](./filesystem-local-storage-basic.js) - Simple read/write operations

**Comprehensive Example**: [`filesystem-local-storage-comprehensive.js`](./filesystem-local-storage-comprehensive.js) - All available filesystem operations including:
- File I/O: `readFile`, `writeFile`, `appendFile`, `copyFile`
- File Management: `unlink`, `rename`, `exists`
- Directory Operations: `mkdir`, `rmdir`, `readdir`
- File Info: `stat`, `lstat`, `access`, `realpath`
- Streams: `createReadStream`, `createWriteStream`
- Permissions: `chmod`, `utimes`

### 2. AWS S3 (JavaScript)

**Basic Example**: [`filesystem-s3-storage-basic.js`](./filesystem-s3-storage-basic.js) - Simple S3 configuration

**Comprehensive Example**: [`filesystem-s3-storage-comprehensive.js`](./filesystem-s3-storage-comprehensive.js) - All S3 operations with notes on S3-specific behaviors

### 3. TypeScript Examples

**Basic Example**: [`filesystem-local-storage-typescript.ts`](./filesystem-local-storage-typescript.ts) - TypeScript with configuration switching

**Comprehensive Example**: [`filesystem-local-storage-comprehensive.ts`](./filesystem-local-storage-comprehensive.ts) - Full TypeScript with type-safe operations

### 4. S3 with MinIO (Docker)

See [`s3-minio-application/`](./s3-minio-application/) for a complete Docker setup with MinIO S3-compatible storage.

### 5. Local Storage Application

See [`local-storage-application/`](./local-storage-application/) for a complete Ignis framework application using local storage.

## Error Handling

The library provides a consistent error hierarchy:

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
  await fs.readFile("/nonexistent.txt", "utf8");
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log("File not found:", error.message);
  } else if (error instanceof PermissionError) {
    console.log("Permission denied:", error.message);
  }
  // All errors have a `cause` property with the underlying error
  if (error.cause) {
    console.log("Underlying cause:", error.cause.message);
  }
}
```

## Backend-Specific Notes

### Local Filesystem

- Full `FileStats` support including permissions and symbolic links
- `realpath()` resolves symbolic links
- `lstat()` available for symbolic link inspection
- File permissions enforced by OS
- No network latency

### AWS S3

- Limited `FileStats`: size and timestamps available, permissions approximated via IAM/ACL
- No symbolic link support
- `realpath()` returns normalized path (no symbolic link resolution)
- `lstat()` behaves same as `stat()` (no symbolic links)
- Network operations with automatic retries
- Supports S3-compatible services via custom endpoints

## Performance Considerations

### Timeouts

- **Local**: Timeouts apply to individual I/O operations
- **S3**: Timeouts apply to HTTP requests (including retries)

### Retries

- **Local**: Retries only for transient OS errors
- **S3**: Automatic retries for network errors, throttling, and service interruptions

### Large Files

- Both backends support streaming for large files
- S3 adapter uses multipart operations for large uploads/downloads

## Security Considerations

### Local Filesystem

- Path traversal protection
- Permission checks via OS
- Base path isolation

### AWS S3

- IAM policy enforcement
- Bucket policies and ACLs
- Encryption at rest and in transit
- Credential rotation support

## Migration Between Backends

The consistent API makes migration straightforward:

```javascript
// Migrate from local to S3
const localFs = createFilesystem(localConfig);
const s3Fs = createFilesystem(s3Config);

// Read from local, write to S3
const content = await localFs.readFile("/data.txt", "utf8");
await s3Fs.writeFile("/data.txt", content, "utf8");
```

## Troubleshooting

### Common Issues

1. **Permission Errors (Local)**
   - Check directory permissions
   - Ensure `basePath` exists or `createMissingDirs: true`

2. **Permission Errors (S3)**
   - Verify IAM policies
   - Check bucket policies and ACLs
   - Validate credentials

3. **Network Errors (S3)**
   - Check internet connectivity
   - Verify region and endpoint
   - Increase timeout for large files

4. **Configuration Errors**
   - Validate configuration with `ConfigValidator`
   - Check environment variables
   - Enable debug logging

### Debugging

Enable debug logging to see detailed operation information:

```javascript
const fs = createFilesystem({
  type: "local",
  local: { basePath: "./data" },
  common: { debug: true },
});
```

## Additional Resources

- [API Documentation](../docs/api.md)
- [Error Reference](../docs/errors.md)
- [Performance Benchmarks](../benchmarks/)
- [Contributing Guide](../CONTRIBUTING.md)
