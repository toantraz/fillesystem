# Ignis Filesystem Component API Contract

**Version**: 1.0.0  
**Date**: 2025-12-23  
**Status**: Draft

## Overview

This document defines the public API contract for the Ignis Filesystem Component. The component wraps the core filesystem library (feature 001) and provides Ignis framework integration including dependency injection, configuration management, and lifecycle hooks.

## Component Interface: `FilesystemComponent`

The main component class that extends `BaseComponent` from Ignis.

```typescript
class FilesystemComponent extends BaseComponent {
  constructor(
    @inject({ key: CoreBindings.APPLICATION_INSTANCE })
    private application: BaseApplication
  );

  // Lifecycle methods inherited from BaseComponent
  override binding(): ValueOrPromise<void>;
  override start(): ValueOrPromise<void>;
  override stop(): ValueOrPromise<void>;

  // Component-specific methods
  getFilesystemInstance(configKey?: string): Filesystem;
  getConfig(): FilesystemComponentConfig;
  registerAdapter(name: string, adapterFactory: AdapterFactory): void;
}
```

## Configuration Interfaces

### Component Configuration

```typescript
interface FilesystemComponentConfig {
  // Default adapter configuration
  defaultAdapter?: "local" | "s3" | string;

  // Named adapter configurations
  adapters?: Record<string, FilesystemAdapterConfig>;

  // Component behavior
  // Note: Component uses singleton scope only (shared instance)
  healthCheckEnabled?: boolean;
  logLevel?: "error" | "warn" | "info" | "debug";

  // Event hooks
  onFileOperation?: (event: FileOperationEvent) => void;
  onError?: (error: FilesystemComponentError) => void;
}

interface FilesystemAdapterConfig {
  type: "local" | "s3" | "custom";

  // Local filesystem configuration
  local?: LocalConfig;

  // S3 configuration
  s3?: S3Config;

  // Custom adapter configuration
  custom?: {
    factory: AdapterFactory;
    options?: Record<string, any>;
  };

  // Adapter-specific options
  options?: {
    timeout?: number;
    retries?: number;
    cache?: boolean;
  };
}

// Inherited from core filesystem library
interface LocalConfig {
  basePath?: string;
  createMissingDirs?: boolean;
}

interface S3Config {
  bucket: string;
  region?: string; // Optional - can be inferred from AWS_REGION environment variable
  endpoint?: string;
  forcePathStyle?: boolean;
  prefix?: string;
  // Note: S3 credentials are read from AWS environment variables:
  // - AWS_ACCESS_KEY_ID
  // - AWS_SECRET_ACCESS_KEY
  // - AWS_REGION (if not specified in config)
}
```

## Binding Keys

```typescript
enum FilesystemComponentBindingKeys {
  // Component instance binding
  FILESYSTEM_COMPONENT_INSTANCE = "filesystem.component.instance",

  // Configuration binding
  FILESYSTEM_COMPONENT_CONFIG = "filesystem.component.config",

  // Default filesystem instance binding
  FILESYSTEM_DEFAULT_INSTANCE = "filesystem.instance.default",

  // Named filesystem instance bindings
  FILESYSTEM_INSTANCE_PREFIX = "filesystem.instance.",

  // Adapter factory bindings
  ADAPTER_FACTORY_PREFIX = "filesystem.adapter.factory.",

  // Health check binding
  FILESYSTEM_HEALTH_CHECK = "filesystem.health.check",
}
```

## Service Interfaces

### Filesystem Service (Optional)

```typescript
interface FilesystemService {
  // Core operations (delegated to Filesystem instance)
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
  // ... all other Filesystem interface methods

  // Component-specific methods
  getAdapterType(): string;
  getConfiguration(): FilesystemAdapterConfig;
  healthCheck(): Promise<HealthStatus>;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, any>;
  timestamp: Date;
  // Health check performs full read/write capability test with test file
  // Includes test file creation, write, read, and deletion
}
```

## Adapter Factory Interface

```typescript
interface AdapterFactory {
  create(config: FilesystemAdapterConfig): Filesystem;
  validate(config: FilesystemAdapterConfig): ValidationResult;
  getType(): string;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}
```

## Event Interfaces

```typescript
interface FileOperationEvent {
  operation: "read" | "write" | "delete" | "copy" | "rename" | "mkdir" | "rmdir";
  path: string;
  success: boolean;
  duration: number;
  timestamp: Date;
  error?: FilesystemError;
  metadata?: Record<string, any>;
}
```

## Dependency Injection Examples

### Injecting Default Filesystem Instance

```typescript
class MyService {
  constructor(
    @inject({ key: FilesystemComponentBindingKeys.FILESYSTEM_DEFAULT_INSTANCE })
    private filesystem: Filesystem,
  ) {}
}
```

### Injecting Named Filesystem Instance

```typescript
class MyService {
  constructor(
    @inject({ key: "filesystem.instance.uploads" })
    private uploadsFilesystem: Filesystem,
  ) {}
}
```

### Injecting Component Instance

```typescript
class MyService {
  constructor(
    @inject({ key: FilesystemComponentBindingKeys.FILESYSTEM_COMPONENT_INSTANCE })
    private filesystemComponent: FilesystemComponent,
  ) {}
}
```

## Initialization Examples

### Basic Application Setup

```typescript
import { Application } from "@ignis/core";
import { FilesystemComponent } from "@ignis/filesystem";

const app = new Application();

// Register the filesystem component
app.component(FilesystemComponent);

// Configure for local filesystem (development)
app.configure({
  filesystem: {
    defaultAdapter: "local",
    adapters: {
      local: {
        type: "local",
        local: { basePath: "./storage" },
      },
    },
  },
});

// Start the application
await app.start();

// Filesystem instance is now available for injection
```

### Local Filesystem Configuration

```typescript
// Local adapter configuration (development/testing)
app.configure({
  filesystem: {
    defaultAdapter: "local",
    adapters: {
      local: {
        type: "local",
        local: {
          basePath: "./storage", // Base directory for file operations
          createMissingDirs: true, // Automatically create missing directories
        },
      },
    },
  },
});
```

### S3 Configuration (Production)

```typescript
// S3 adapter configuration (production)
// Note: AWS credentials come from environment variables:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// - AWS_REGION (if not specified in config)

app.configure({
  filesystem: {
    defaultAdapter: "s3",
    adapters: {
      s3: {
        type: "s3",
        s3: {
          bucket: "my-app-production",
          region: "us-east-1", // Optional - can be inferred from AWS_REGION
          prefix: "uploads/", // Optional prefix for all operations
        },
        options: {
          timeout: 30000, // 30 second timeout
          retries: 3, // Retry failed operations
        },
      },
    },
  },
});
```

### Environment-Specific Configuration

```typescript
// Use different adapters based on environment
const config = {
  development: {
    filesystem: {
      defaultAdapter: "local",
      adapters: {
        local: { type: "local", local: { basePath: "./storage" } },
      },
    },
  },
  production: {
    filesystem: {
      defaultAdapter: "s3",
      adapters: {
        s3: { type: "s3", s3: { bucket: "my-app-production", region: "us-east-1" } },
      },
    },
  },
};

app.configure(config[process.env.NODE_ENV || "development"]);
```

## Configuration Examples

### YAML Configuration

```yaml
filesystem:
  defaultAdapter: "local"
  singleton: true
  healthCheckEnabled: true
  adapters:
    local:
      type: "local"
      local:
        basePath: "./storage"
        createMissingDirs: true
    s3-uploads:
      type: "s3"
      s3:
        bucket: "my-app-uploads"
        region: "us-east-1"
      options:
        timeout: 30000
        retries: 3
```

### Programmatic Configuration

```typescript
app.configure({
  filesystem: {
    defaultAdapter: "local",
    adapters: {
      local: {
        type: "local",
        local: { basePath: "./storage" },
      },
    },
  },
});
```

## Error Types

All filesystem errors are wrapped in IgnisComponentError with original error as cause:

```typescript
// Base error class from Ignis framework
class IgnisComponentError extends Error {
  component: string;
  operation: string;
  cause?: Error;
  timestamp: Date;
}

// Filesystem-specific error wrapper
class FilesystemComponentError extends IgnisComponentError {
  // Additional filesystem-specific properties
  adapterType?: string;
  path?: string;
}

// Specific error types (all extend FilesystemComponentError)
class ConfigurationError extends FilesystemComponentError {}
class AdapterInitializationError extends FilesystemComponentError {}
class HealthCheckError extends FilesystemComponentError {}
class FileOperationError extends FilesystemComponentError {}
```

## Lifecycle Hooks

### Component Registration

```typescript
app.component(FilesystemComponent);
```

### Custom Adapter Registration

```typescript
app.configure({
  filesystem: {
    adapters: {
      gcs: {
        type: "custom",
        custom: {
          factory: GoogleCloudStorageAdapterFactory,
          options: { projectId: "my-project" },
        },
      },
    },
  },
});
```

## Compliance Requirements

All implementations must:

1. Extend `BaseComponent` and follow Ignis component lifecycle
2. Support dependency injection through defined binding keys (singleton scope only)
3. Accept configuration through Ignis configuration system with fail-fast validation
4. Integrate with Ignis health check system performing full read/write capability tests
5. Wrap all filesystem errors in IgnisComponentError with original error as cause
6. Use singleton scope only (single shared instance for entire application)
7. Provide TypeScript type definitions for all public APIs
8. Follow Ignis logging conventions for operation tracing
9. Read S3 credentials exclusively from AWS environment variables
10. Perform configuration validation at component registration time (fail-fast)

## Versioning

- **Major version**: Breaking changes to component API or Ignis compatibility
- **Minor version**: New features, backward compatible
- **Patch version**: Bug fixes, backward compatible

Breaking changes include:

- Changes to `FilesystemComponent` public method signatures
- Changes to binding key names or semantics
- Changes to configuration interface that break existing configurations
- Changes to error hierarchy that affect error handling
