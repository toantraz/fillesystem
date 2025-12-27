# Quick Start: Filesystem Component

Get started with the Filesystem Component library in under 5 minutes.

## Installation

```bash
npm install @ignis/filesystem
```

## Basic Usage

### 1. Import and Configure

```typescript
import { createFilesystem } from "@ignis/filesystem";

// For local filesystem
const localFs = createFilesystem({
  type: "local",
  local: {
    basePath: "./storage", // Optional: base directory for all operations
  },
});

// For AWS S3
const s3Fs = createFilesystem({
  type: "s3",
  s3: {
    bucket: "my-bucket",
    region: "us-east-1",
    // Credentials from environment variables or IAM role by default
  },
});
```

### 2. Basic File Operations

```typescript
// Write a file
await localFs.writeFile("/documents/hello.txt", "Hello, World!", "utf8");

// Read a file
const content = await localFs.readFile("/documents/hello.txt", "utf8");
console.log(content); // "Hello, World!"

// Check if file exists
const exists = await localFs.exists("/documents/hello.txt");
console.log(exists); // true

// Get file statistics
const stats = await localFs.stat("/documents/hello.txt");
console.log(stats.size); // 13
console.log(stats.isFile()); // true
```

### 3. Directory Operations

```typescript
// Create directory
await localFs.mkdir("/documents/archive", { recursive: true });

// List directory contents
const files = await localFs.readdir("/documents");
console.log(files); // ['hello.txt', 'archive']

// Remove directory (empty)
await localFs.rmdir("/documents/archive");

// Remove directory with contents
await localFs.rmdir("/documents/archive", { recursive: true });
```

### 4. Advanced Operations

```typescript
// Copy file
await localFs.copyFile("/documents/hello.txt", "/documents/hello-copy.txt");

// Rename/move file
await localFs.rename("/documents/hello-copy.txt", "/archive/hello-backup.txt");

// Append to file
await localFs.appendFile("/documents/hello.txt", "\nAppended text");

// Delete file
await localFs.unlink("/documents/hello.txt");
```

### 5. Stream Operations (Large Files)

```typescript
import { createReadStream, createWriteStream } from "stream";

// Read large file as stream
const readStream = localFs.createReadStream("/large/video.mp4");
readStream.pipe(process.stdout); // Or pipe to another stream

// Write large file as stream
const writeStream = localFs.createWriteStream("/large/copy.mp4");
readStream.pipe(writeStream);
```

## Error Handling

```typescript
import { FileNotFoundError, PermissionError } from "@ignis/filesystem";

try {
  await localFs.readFile("/nonexistent.txt");
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log("File not found");
  } else if (error instanceof PermissionError) {
    console.log("Permission denied");
  } else {
    console.log("Other error:", error.message);
  }
}
```

## Switching Between Storage Backends

One of the key features is seamless switching between storage backends:

```typescript
// Application code works with any backend
async function saveUserData(fs: Filesystem, userId: string, data: any) {
  const path = `/users/${userId}/profile.json`;
  await fs.writeFile(path, JSON.stringify(data));
  return path;
}

// Use local filesystem for development
const devFs = createFilesystem({ type: "local" });
await saveUserData(devFs, "123", { name: "Dev User" });

// Use S3 for production (same code!)
const prodFs = createFilesystem({
  type: "s3",
  s3: { bucket: "prod-bucket", region: "us-east-1" },
});
await saveUserData(prodFs, "123", { name: "Prod User" });
```

## Configuration Examples

### Local Filesystem with Custom Base Path

```typescript
const fs = createFilesystem({
  type: "local",
  local: {
    basePath: "/var/data/myapp", // All paths are relative to this
    createMissingDirs: true, // Auto-create missing directories
  },
});

// Writes to /var/data/myapp/uploads/file.txt
await fs.writeFile("/uploads/file.txt", "content");
```

### AWS S3 with Custom Endpoint (MinIO, etc.)

```typescript
const fs = createFilesystem({
  type: "s3",
  s3: {
    bucket: "my-bucket",
    region: "us-east-1",
    endpoint: "https://minio.example.com", // S3-compatible service
    forcePathStyle: true, // Required for some S3-compatible services
    accessKeyId: "your-access-key",
    secretAccessKey: "your-secret-key",
  },
});
```

### AWS S3 with IAM Role (EC2, ECS, Lambda)

```typescript
const fs = createFilesystem({
  type: "s3",
  s3: {
    bucket: "my-bucket",
    region: "us-east-1",
    // No credentials needed - uses IAM role
  },
});
```

## Common Patterns

### 1. Ensure Directory Exists

```typescript
async function ensureDir(fs: Filesystem, path: string) {
  try {
    await fs.access(path);
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      await fs.mkdir(path, { recursive: true });
    } else {
      throw error;
    }
  }
}
```

### 2. Safe File Write (Write to Temp then Rename)

```typescript
async function safeWrite(fs: Filesystem, path: string, data: string | Buffer) {
  const tempPath = `${path}.tmp`;
  await fs.writeFile(tempPath, data);
  await fs.rename(tempPath, path); // Atomic on most systems
}
```

### 3. Read JSON File

```typescript
async function readJsonFile(fs: Filesystem, path: string) {
  const content = await fs.readFile(path, "utf8");
  return JSON.parse(content);
}
```

## Testing

```typescript
// In your tests, you can mock or use different backends
import { createFilesystem } from "@ignis/filesystem";

describe("File operations", () => {
  const fs = createFilesystem({
    type: "local",
    local: { basePath: "./test-temp" },
  });

  afterEach(async () => {
    // Cleanup
    await fs.rmdir("./test-temp", { recursive: true });
  });

  test("write and read file", async () => {
    await fs.writeFile("/test.txt", "test content");
    const content = await fs.readFile("/test.txt", "utf8");
    expect(content).toBe("test content");
  });
});
```

## Next Steps

1. **Explore API Reference**: See [`contracts/filesystem-api.md`](contracts/filesystem-api.md) for complete API documentation
2. **Review Data Model**: Understand the underlying entities in [`data-model.md`](data-model.md)
3. **Check Research**: See design decisions in [`research.md`](research.md)
4. **Read Specification**: Understand requirements in [`spec.md`](spec.md)

## Troubleshooting

### Common Issues

1. **Permission Errors (Local)**:
   - Ensure application has read/write permissions to the base path
   - On Linux/macOS: Check directory permissions with `ls -la`

2. **S3 Connection Issues**:
   - Verify AWS credentials or IAM role permissions
   - Check network connectivity to S3 endpoint
   - Verify bucket name and region are correct

3. **Large File Timeouts**:
   - Use streaming for files > 100MB
   - For S3, consider multipart upload configuration

4. **Path Issues**:
   - Use forward slashes (`/`) for consistency across platforms
   - Avoid special characters in file names

### Getting Help

- Check error messages for specific details
- Enable debug logging if available
- Review backend-specific documentation (AWS S3, Node.js fs module)
