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

> **💡 Recommended:** Start with the [Upload Service Application](examples/upload-service-application/) - a complete, production-ready example demonstrating file uploads, validation, and S3 integration using the Filesystem component.

> **Note:** Want to build your own Ignis components? Check out the [Building Reusable Ignis Components Guide](docs/ignis-component-guide.md) for a comprehensive walkthrough using this filesystem component as a reference.

## Quick Start

### 1. Install and Run the Upload Service Application

The fastest way to see the Filesystem component in action is the **Upload Service Application** - a complete HTTP file upload API with validation, progress tracking, and configurable storage backends.

```bash
# Clone and navigate to the example
git clone https://github.com/toantraz/filesystem.git
cd filesystem/examples/upload-service-application

# Install dependencies
npm install

# Build the application
npm run build

# Start the server (uploads go to ./uploads directory)
npm start
```

The upload API will be available at `http://localhost:3000/api/upload`

### 2. Configure Your Filesystem

The application supports both **local** and **S3** storage through simple configuration.

**For local storage** (default):

```typescript
// src/index.ts
import path from "node:path";
import { Application } from "./application.js";
import type { FilesystemConfig } from "@ignis/filesystem";

const filesystemConfig: FilesystemConfig = {
  type: "local",
  local: {
    basePath: path.join(process.cwd(), "uploads"),
    createMissingDirs: true,
  },
};

const app = new Application(filesystemConfig);
app.init();
await app.start();
```

**For S3 storage**:

```typescript
const filesystemConfig: FilesystemConfig = {
  type: "s3",
  s3: {
    bucket: "my-uploads-bucket",
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    prefix: "uploads/",
    // For MinIO or S3-compatible services:
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  },
};
```

### 3. Use the Filesystem in Your Services

The Filesystem is automatically injected into your services via dependency injection:

```typescript
// src/services/upload-service.service.ts
import { inject } from "@venizia/ignis";
import { FilesystemBindingKeys, type Filesystem } from "@ignis/filesystem";

export class UploadService {
  constructor(
    @inject({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE })
    private filesystem: Filesystem,
  ) {}

  async uploadFile(file: File, targetPath: string) {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write using the Filesystem component
    await this.filesystem.writeFile(targetPath, buffer);

    return { success: true, storagePath: targetPath };
  }

  async readFile(filePath: string): Promise<string> {
    return await this.filesystem.readFile(filePath, "utf8");
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.filesystem.unlink(filePath);
  }
}
```

### 4. Register the Component in Your Application

```typescript
// src/application.ts
import { FilesystemComponent, FilesystemBindingKeys } from "@ignis/filesystem";

class MyApp extends BaseApplication {
  override preConfigure(): ValueOrPromise<void> {
    // Bind the filesystem configuration
    this.bind<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    }).toValue(this.filesystemConfig);

    // Register the FilesystemComponent
    this.component(FilesystemComponent as any);

    // Your filesystem is now ready for injection in services!
  }
}
```

### 5. Available Operations

Once configured, the Filesystem component provides a complete file operations API:

```typescript
// File operations
await filesystem.writeFile("/path/to/file.txt", "Hello, World!");
const content = await filesystem.readFile("/path/to/file.txt", "utf8");
await filesystem.appendFile("/path/to/file.txt", " More text");
await filesystem.copyFile("/src/file.txt", "/dest/file.txt");
await filesystem.rename("/old/path.txt", "/new/path.txt");
await filesystem.unlink("/path/to/file.txt"); // Delete

// Directory operations
await filesystem.mkdir("/new-folder", { recursive: true });
const files = await filesystem.readdir("/path/to/dir");
await filesystem.rmdir("/path/to/dir", { recursive: true });

// File information
const stats = await filesystem.stat("/path/to/file.txt");
const exists = await filesystem.exists("/path/to/file.txt");
const realPath = await filesystem.realpath("/path/to/file.txt");

// Streams (for large files)
const readStream = filesystem.createReadStream("/large-file.zip");
const writeStream = filesystem.createWriteStream("/output.zip");
readStream.pipe(writeStream);
```

### Environment Variables

Configure the Filesystem via environment variables:

```bash
# .env file
FILESYSTEM_TYPE=local                    # or "s3"
FILESYSTEM_LOCAL_BASE_PATH=./uploads
FILESYSTEM_LOCAL_CREATE_MISSING_DIRS=true

# For S3:
FILESYSTEM_S3_BUCKET=my-uploads
FILESYSTEM_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

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

### Recommended: Upload Service Application

**[examples/upload-service-application/](examples/upload-service-application/)**

A complete, production-ready HTTP upload service demonstrating practical Filesystem component usage:

- **File Upload API**: RESTful endpoints for file uploads with validation
- **Type-Safe**: Full TypeScript with Zod validation schemas
- **Session Management**: Multi-part upload support with session tracking
- **Security**: File type validation, size limits, filename sanitization
- **Configurable Storage**: Easy switch between local and S3 storage via environment variables
- **OpenAPI Documentation**: Integrated Swagger/OpenAPI specs

```bash
cd examples/upload-service-application
npm install
npm run build
npm start
# Upload API available at http://localhost:3000/api/upload
```

### Other Examples

**[examples/local-storage-application/](examples/local-storage-application/)**

Local storage example with Ignis framework integration:

- Demonstrates filesystem component registration
- Comprehensive filesystem operations demo
- Configuration file support (JSON, YAML)

```bash
cd examples/local-storage-application
npm install
npm run build
npm start
```

**[examples/s3-minio-application/](examples/s3-minio-application/)**

S3-compatible storage with MinIO (local S3 development):

- Docker Compose setup for local MinIO
- S3 adapter configuration
- Local development for S3 applications

```bash
cd examples/s3-minio-application/docker
docker-compose up -d
cd ..
npm install
npm run build
npm start
```

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

## Documentation

- **[Building Reusable Ignis Components](docs/ignis-component-guide.md)** - Comprehensive guide on implementing and using Ignis components
- [Developer Guide](docs/developer-guide.md) - Code style patterns and conventions
- [Migration Guide](docs/migration-guide.md) - Gradual convergence strategy
- [Scripts Reference](docs/scripts-reference.md) - All validation and migration scripts
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

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

## License

MIT
