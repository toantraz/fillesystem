# Application Interface Contract

**Feature**: `004-ignis-example-app`
**Date**: 2025-12-24

## Overview

This document defines the interface contract for the Ignis example application. Since this is a demo/example application (not an API service), the contract describes the expected behavior and structure rather than API endpoints.

## Application Contract

### Entry Point

**File**: `examples/ignis-application/src/index.ts`

**Behavior**:

1. Creates an `Application` instance
2. Loads configuration (file or inline)
3. Registers `FilesystemComponent`
4. Creates and starts the application
5. Runs demo operations
6. Handles graceful shutdown

**Expected Output**:

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

### Error Handling Contract

**Behavior on Error**:

| Scenario                         | Behavior                                              |
| -------------------------------- | ----------------------------------------------------- |
| Configuration file not found     | Use inline default configuration with console warning |
| Missing S3 environment variables | Fail at startup with clear error message              |
| File operation fails             | Log error, continue with next operation               |
| Component initialization fails   | Log error, exit with error code                       |

**Error Output Example**:

```
[WARN] Configuration file not found: config/local.yaml
[WARN] Using inline default configuration
[ERROR] Failed to write file: /test-file.txt
[ERROR] Error: EACCES: permission denied
[INFO] Continuing with next operation...
```

## Configuration Contract

### Configuration File Location

**Priority Order**:

1. `config/local.yaml` or `config/local.json` (if exists)
2. `config/s3.yaml` or `config/s3.json` (if exists)
3. Inline default configuration

### Configuration Schema

**Type**: `FilesystemConfig`

**Required Fields**:

- `type`: `'local'` | `'s3'`

**Conditional Fields** (when `type='local'`):

- `local.basePath`: `string`

**Conditional Fields** (when `type='s3'`):

- `s3.bucket`: `string`
- `s3.region`: `string`

**Optional Fields**:

- `common.timeout`: `number` (default: 30000)
- `common.maxRetries`: `number` (default: 3)
- `common.debug`: `boolean` (default: false)
- `local.createMissingDirs`: `boolean` (default: true)
- `s3.prefix`: `string` (default: '')

## Service Contract

### FileService

**Purpose**: Demonstrates dependency injection of filesystem

**Constructor**:

```typescript
constructor(@Inject('filesystem.instance.default') filesystem: Filesystem)
```

**Dependency**: `filesystem` is injected from DI container

**Methods**:

| Method                     | Input                           | Output               | Throws            |
| -------------------------- | ------------------------------- | -------------------- | ----------------- |
| `writeFile(path, content)` | `path: string, content: string` | `Promise<void>`      | FilesystemError   |
| `readFile(path)`           | `path: string`                  | `Promise<string>`    | FileNotFoundError |
| `deleteFile(path)`         | `path: string`                  | `Promise<void>`      | FilesystemError   |
| `listFiles(directory)`     | `directory: string`             | `Promise<string[]>`  | FilesystemError   |
| `getFileStats(path)`       | `path: string`                  | `Promise<FileStats>` | FileNotFoundError |
| `checkExists(path)`        | `path: string`                  | `Promise<boolean>`   | Never             |

**Logging Contract**: Each method logs:

- `[DEMO] <operation>: <path>`
- `[DEMO] ✓ <result>` OR `[ERROR] <error>`

## Demo Operations Contract

### Operation Sequence

The demo runs the following operations in order:

1. **Write File**: Create `/test-file.txt` with content "Hello from Ignis Filesystem!"
2. **Read File**: Read `/test-file.txt` and verify content
3. **Check Exists**: Verify `/test-file.txt` exists
4. **Get Stats**: Get metadata for `/test-file.txt`
5. **List Directory**: List contents of `/`
6. **Delete File**: Delete `/test-file.txt`

**Cleanup**: All test files are deleted by the end of the demo

### Expected State Transitions

| Step               | File Exists | Description    |
| ------------------ | ----------- | -------------- |
| Initial            | No          | Clean state    |
| After write        | Yes         | File created   |
| After read         | Yes         | File unchanged |
| After exists check | Yes         | File unchanged |
| After stats        | Yes         | File unchanged |
| After list         | Yes         | File unchanged |
| After delete       | No          | File removed   |

## Package.json Contract

### Dependencies

```json
{
  "dependencies": {
    "@venizia/ignis": "^1.0.0"
  }
}
```

### Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "clean": "rm -rf dist"
  }
}
```

### Workspace Reference

The FilesystemComponent is referenced from the workspace:

```json
{
  "dependencies": {
    "@ignis/filesystem": "file:../.."
  }
}
```

## README Contract

### Required Sections

1. **Title**: "Ignis Example Application"
2. **Description**: Brief explanation of the example
3. **Prerequisites**: Node.js 18+, TypeScript
4. **Installation**: `npm install`
5. **Configuration**: How to switch between local and S3
6. **Running**: `npm start` or `npm run dev`
7. **Expected Output**: Example console output
8. **Code Structure**: Explanation of key files
9. **Configuration Examples**: Show both YAML and JSON

## Exit Codes

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 0    | Success                                            |
| 1    | Configuration error (missing required S3 env vars) |
| 2    | Component initialization failure                   |
| 3    | Unhandled exception                                |

## Sources

- [@venizia/ignis npm package](https://www.npmjs.com/package/@venizia/ignis)
- [@venizia/ignis-docs npm package](https://www.npmjs.com/package/@venizia/ignis-docs)
