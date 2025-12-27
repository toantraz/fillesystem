# Data Model: Ignis Example Application

**Feature**: `004-ignis-example-app`
**Date**: 2025-12-24

## Overview

This document defines the data model and entities for the Ignis example application. Since this is an example/demo application, the data model is simple and focused on demonstrating Ignis patterns rather than complex data relationships.

## Entities

### ExampleApplication

**Description**: Main application class that initializes the Ignis application, registers components, and runs the demo.

**Properties**:

| Name                  | Type                  | Description                                       |
| --------------------- | --------------------- | ------------------------------------------------- |
| `app`                 | `Application`         | Ignis Application instance                        |
| `filesystemComponent` | `FilesystemComponent` | Registered filesystem component                   |
| `config`              | `FilesystemConfig`    | Configuration object (inline or loaded from file) |

**Methods**:

| Name                 | Parameters                 | Return Type     | Description                                            |
| -------------------- | -------------------------- | --------------- | ------------------------------------------------------ |
| `configure`          | `config: FilesystemConfig` | `void`          | Sets application configuration                         |
| `registerComponents` | `none`                     | `Promise<void>` | Registers the FilesystemComponent with the application |
| `start`              | `none`                     | `Promise<void>` | Starts the application and initializes components      |
| `stop`               | `none`                     | `Promise<void>` | Stops the application and cleans up resources          |
| `runDemo`            | `none`                     | `Promise<void>` | Runs the filesystem operation demonstrations           |

**Lifecycle**:

1. Create instance with configuration
2. Register components
3. Start application (triggers component lifecycle)
4. Run demo operations
5. Stop application (cleanup)

### FileService

**Description**: Example service class that demonstrates dependency injection of the filesystem component. This shows how real application services would use the injected filesystem.

**Properties**:

| Name         | Type         | Description                                      |
| ------------ | ------------ | ------------------------------------------------ |
| `filesystem` | `Filesystem` | Injected filesystem instance (from DI container) |

**Methods**:

| Name           | Parameters                      | Return Type          | Description                |
| -------------- | ------------------------------- | -------------------- | -------------------------- |
| `writeFile`    | `path: string, content: string` | `Promise<void>`      | Writes content to a file   |
| `readFile`     | `path: string`                  | `Promise<string>`    | Reads file contents        |
| `deleteFile`   | `path: string`                  | `Promise<void>`      | Deletes a file             |
| `listFiles`    | `directory: string`             | `Promise<string[]>`  | Lists files in a directory |
| `getFileStats` | `path: string`                  | `Promise<FileStats>` | Gets file metadata         |
| `checkExists`  | `path: string`                  | `Promise<boolean>`   | Checks if a file exists    |

**Constructor Injection**:

```typescript
constructor(@Inject('filesystem.instance.default') filesystem: Filesystem) {
  this.filesystem = filesystem;
}
```

### FilesystemConfig

**Description**: Configuration object for the filesystem component. Used to configure the adapter type and adapter-specific settings.

**Type Definition**:

```typescript
interface FilesystemConfig {
  type: "local" | "s3";
  common?: {
    timeout?: number;
    maxRetries?: number;
    debug?: boolean;
  };
  local?: {
    basePath: string;
    createMissingDirs?: boolean;
  };
  s3?: {
    bucket: string;
    region: string;
    prefix?: string;
  };
}
```

**Properties**:

| Name                      | Type              | Required    | Description                                        |
| ------------------------- | ----------------- | ----------- | -------------------------------------------------- |
| `type`                    | `'local' \| 's3'` | Yes         | Adapter type to use                                |
| `common`                  | `object`          | No          | Common options for all adapters                    |
| `common.timeout`          | `number`          | No          | Operation timeout in milliseconds (default: 30000) |
| `common.maxRetries`       | `number`          | No          | Maximum retry attempts (default: 3)                |
| `common.debug`            | `boolean`         | No          | Enable debug logging (default: false)              |
| `local`                   | `object`          | Conditional | Local adapter options (required if type='local')   |
| `local.basePath`          | `string`          | Yes         | Base directory for file operations                 |
| `local.createMissingDirs` | `boolean`         | No          | Auto-create directories (default: true)            |
| `s3`                      | `object`          | Conditional | S3 adapter options (required if type='s3')         |
| `s3.bucket`               | `string`          | Yes         | S3 bucket name                                     |
| `s3.region`               | `string`          | Yes         | AWS region                                         |
| `s3.prefix`               | `string`          | No          | Key prefix for all S3 objects                      |

**Example - Local Configuration**:

```yaml
filesystem:
  type: "local"
  local:
    basePath: "./storage"
    createMissingDirs: true
```

**Example - S3 Configuration**:

```yaml
filesystem:
  type: "s3"
  s3:
    bucket: "my-bucket"
    region: "us-east-1"
    prefix: "example/"
```

### FileStats

**Description**: File metadata returned by the `stat()` operation. This is the standard interface from the Filesystem library.

**Type Definition**:

```typescript
interface FileStats {
  size: number;
  mtime: Date;
  atime: Date;
  ctime: Date;
  isFile(): boolean;
  isDirectory(): boolean;
}
```

## Configuration File Structure

### Local Configuration (YAML)

```yaml
# config/local.yaml
filesystem:
  type: "local"
  local:
    basePath: "./storage"
    createMissingDirs: true
```

### Local Configuration (JSON)

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

### S3 Configuration (YAML)

```yaml
# config/s3.yaml
filesystem:
  type: "s3"
  s3:
    bucket: "my-bucket"
    region: "us-east-1"
    prefix: "example/"
```

### S3 Configuration (JSON)

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

## Relationships

```
ExampleApplication
    ├── creates → Application
    ├── registers → FilesystemComponent
    ├── configures → FilesystemConfig
    └── creates → FileService
                      └── injects → Filesystem (from FilesystemComponent)
```

## Validation Rules

### FilesystemConfig

| Rule                      | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `type` required           | Must be either 'local' or 's3'                                                   |
| `local.basePath` required | Required when type='local'                                                       |
| `s3.bucket` required      | Required when type='s3'                                                          |
| `s3.region` required      | Required when type='s3'                                                          |
| S3 credentials            | Must be set via environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) |

### Runtime Validation

1. **Configuration validation** occurs at component registration (fail-fast)
2. **S3 credential validation** occurs at component initialization
3. **Storage backend availability** checked via health check on startup

## State Transitions

### ExampleApplication Lifecycle

```
[Created] → [Configured] → [Components Registered] → [Started] → [Demo Running] → [Stopped]
```

| State                 | Description                                      |
| --------------------- | ------------------------------------------------ |
| Created               | Application instance created                     |
| Configured            | Configuration loaded/applied                     |
| Components Registered | FilesystemComponent registered with DI container |
| Started               | Application started, components initialized      |
| Demo Running          | Demo operations executing                        |
| Stopped               | Application stopped, resources cleaned up        |

### FilesystemComponent Lifecycle

```
[Registered] → [Initialized] → [Started] → [Healthy] → [Stopped]
```

| State       | Description                                   |
| ----------- | --------------------------------------------- |
| Registered  | Component registered with DI container        |
| Initialized | Config validated, filesystem instance created |
| Started     | Health check performed                        |
| Healthy     | Storage backend accessible                    |
| Stopped     | Resources cleaned up                          |

## Notes

1. **No persistent data**: This example application does not persist any state. All files created during the demo are cleaned up.
2. **Singleton scope**: The FilesystemComponent uses singleton scope (single shared instance).
3. **Thread-safe**: The filesystem implementation is thread-safe for concurrent operations.
