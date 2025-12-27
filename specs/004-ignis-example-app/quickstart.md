# Quick Start: Ignis Example Application

**Feature**: `004-ignis-example-app`
**Date**: 2025-12-24

## Overview

This quick start guide shows how to run and use the Ignis example application that demonstrates the FilesystemComponent integration.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **TypeScript**: 5.0.0 or higher (installed via dev dependencies)

## Installation

### 1. Navigate to the Example Directory

```bash
cd examples/ignis-application
```

### 2. Install Dependencies

```bash
npm install
```

This installs:

- `@venizia/ignis` - Core Ignis framework
- `@ignis/filesystem` - Filesystem component (from workspace)
- TypeScript and development tools

## Quick Start (Local Filesystem)

The example is configured to use local filesystem by default.

### Run the Example

```bash
npm start
```

Or for development with ts-node:

```bash
npm run dev
```

### Expected Output

```
=== Ignis Filesystem Example Application ===

[INFO] Configuration loaded: { type: 'local', local: { basePath: './storage', createMissingDirs: true } }
[INFO] Registering FilesystemComponent...
[INFO] Starting application...
[INFO] FilesystemComponent initialized successfully
[INFO] FilesystemComponent started successfully

=== Running Filesystem Operations Demo ===

[DEMO] Writing file: /test-file.txt
[DEMO] ✓ File written successfully
[DEMO] Reading file: /test-file.txt
[DEMO] ✓ File content: "Hello from Ignis Filesystem!"
[DEMO] Checking if file exists: /test-file.txt
[DEMO] ✓ File exists: true
[DEMO] Getting file stats: /test-file.txt
[DEMO] ✓ File size: 31 bytes
[DEMO] Listing directory: /
[DEMO] ✓ Directory contents: ["test-file.txt"]
[DEMO] Deleting file: /test-file.txt
[DEMO] ✓ File deleted successfully

=== Demo Complete ===

[INFO] Stopping application...
[INFO] Application stopped successfully
```

## Switching to S3

### 1. Set AWS Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 2. Switch Configuration

**Option A: Use YAML config**

```bash
# Edit config/local.yaml and change type to 's3', or use config/s3.yaml
```

**Option B: Use JSON config**

```bash
# Edit config/local.json and change type to 's3', or use config/s3.json
```

**Option C: Modify inline configuration in src/index.ts**

Change:

```typescript
const config: FilesystemConfig = {
  type: "local",
  local: {
    basePath: "./storage",
    createMissingDirs: true,
  },
};
```

To:

```typescript
const config: FilesystemConfig = {
  type: "s3",
  s3: {
    bucket: "my-bucket",
    region: "us-east-1",
    prefix: "example/",
  },
};
```

### 3. Run with S3

```bash
npm start
```

## Configuration Files

### Local Filesystem (YAML)

**File**: `config/local.yaml`

```yaml
filesystem:
  type: "local"
  local:
    basePath: "./storage"
    createMissingDirs: true
```

### Local Filesystem (JSON)

**File**: `config/local.json`

```json
{
  "filesystem": {
    "type": "local",
    "local": {
      "basePath": "./storage",
      "createMissingDirs": true
    }
  }
}
```

### S3 (YAML)

**File**: `config/s3.yaml`

```yaml
filesystem:
  type: "s3"
  s3:
    bucket: "my-bucket"
    region: "us-east-1"
    prefix: "example/"
```

### S3 (JSON)

**File**: `config/s3.json`

```json
{
  "filesystem": {
    "type": "s3",
    "s3": {
      "bucket": "my-bucket",
      "region": "us-east-1",
      "prefix": "example/"
    }
  }
}
```

## Code Structure

```
examples/ignis-application/
├── src/
│   ├── index.ts            # Entry point
│   ├── app.ts              # Application class
│   └── services/
│       └── file-service.ts # Service with DI demo
├── config/
│   ├── local.yaml          # Local config (YAML)
│   ├── local.json          # Local config (JSON)
│   ├── s3.yaml             # S3 config (YAML)
│   └── s3.json             # S3 config (JSON)
├── package.json
├── tsconfig.json
└── README.md
```

## Key Files

### src/index.ts

Entry point that:

1. Creates the Ignis Application instance
2. Loads configuration
3. Registers the FilesystemComponent
4. Starts the application
5. Runs the demo
6. Handles graceful shutdown

### src/app.ts

Application class that:

1. Manages application lifecycle
2. Registers components with DI container
3. Coordinates startup and shutdown

### src/services/file-service.ts

Example service that demonstrates:

1. Constructor dependency injection with `@Inject()`
2. Using the injected filesystem for operations
3. Error handling with try-catch
4. Logging for visibility

## Understanding the Example

### Component Registration

```typescript
import { Application } from "@venizia/ignis";
import { FilesystemComponent } from "@ignis/filesystem";

const app = new Application();

// Register the filesystem component
app.component(FilesystemComponent);

// Configure the component
app.configure({
  filesystem: {
    type: "local",
    local: { basePath: "./storage" },
  },
});
```

### Dependency Injection

```typescript
import { Inject } from "@venizia/ignis";
import { Filesystem } from "@ignis/filesystem";

class FileService {
  constructor(
    @Inject("filesystem.instance.default")
    private filesystem: Filesystem,
  ) {}

  async writeFile(path: string, content: string) {
    await this.filesystem.writeFile(path, content);
  }
}
```

### Configuration Loading

The example loads configuration in this priority order:

1. Try loading `config/local.yaml` or `config/local.json`
2. If not found, try loading `config/s3.yaml` or `config/s3.json`
3. If no config files found, use inline default configuration

## Common Issues

### "Configuration file not found"

**Warning**: This is expected if you don't have config files. The example falls back to inline defaults.

```
[WARN] Configuration file not found: config/local.yaml
[WARN] Using inline default configuration
```

### "Missing AWS credentials"

When using S3, make sure environment variables are set:

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### "Permission denied"

Make sure the local storage directory is writable:

```bash
mkdir -p ./storage
chmod u+w ./storage
```

## Next Steps

1. **Explore the code**: Read through `src/index.ts`, `src/app.ts`, and `src/services/file-service.ts`
2. **Modify the example**: Add your own file operations
3. **Create your own service**: Add a new service that injects the filesystem
4. **Switch adapters**: Try switching between local and S3 configurations

## Advanced Usage

### Adding a Custom Service

```typescript
import { Inject } from "@venizia/ignis";
import { Filesystem } from "@ignis/filesystem";

class BackupService {
  constructor(
    @Inject("filesystem.instance.default")
    private filesystem: Filesystem,
  ) {}

  async backupFile(path: string) {
    const content = await this.filesystem.readFile(path);
    await this.filesystem.writeFile(`/backup/${path}`, content);
  }
}
```

### Health Checks

The FilesystemComponent supports health checks:

```typescript
const component = await app.get("filesystem.component.instance");
const health = await component.healthCheck();
console.log(health.status); // 'healthy', 'degraded', or 'unhealthy'
```

## Sources

- **@venizia/ignis npm**: https://www.npmjs.com/package/@venizia/ignis
- **@venizia/ignis-docs npm**: https://www.npmjs.com/package/@venizia/ignis-docs
- **Feature Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
