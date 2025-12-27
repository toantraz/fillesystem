# Data Model: Ignis Filesystem Component

**Feature**: `003-ignis-filesystem-component`  
**Date**: 2025-12-23  
**Status**: Draft

## Core Entities

### FilesystemComponent

The main Ignis component that wraps the filesystem library.

**Properties**:

- `name`: string - Component name ("filesystem")
- `version`: string - Component version
- `config`: FilesystemComponentConfig - Component configuration
- `adapter`: StorageAdapter - Current storage adapter instance
- `healthCheck`: HealthCheck - Health check implementation

**Methods**:

- `binding(): ValueOrPromise<void>` - Dependency injection setup
- `start(): ValueOrPromise<void>` - Component startup
- `stop(): ValueOrPromise<void>` - Component shutdown
- `getFilesystemInstance(): Filesystem` - Get filesystem instance
- `healthCheck(): Promise<HealthStatus>` - Perform health check

### FilesystemComponentConfig

Component configuration object.

**Properties**:

- `defaultAdapter`: 'local' | 's3' | string - Default adapter type
- `adapters`: Record<string, FilesystemAdapterConfig> - Named adapter configurations
- `healthCheckEnabled`: boolean - Whether health check is enabled (default: true)
- `logLevel`: 'error' | 'warn' | 'info' | 'debug' - Logging level (default: 'info')
- `onFileOperation`: (event: FileOperationEvent) => void - Optional file operation event hook
- `onError`: (error: FilesystemComponentError) => void - Optional error event hook

### FilesystemAdapterConfig

Adapter-specific configuration.

**Properties**:

- `type`: 'local' | 's3' | 'custom' - Adapter type
- `local`: LocalConfig - Local filesystem configuration (if type='local')
- `s3`: S3Config - S3 configuration (if type='s3')
- `custom`: CustomAdapterConfig - Custom adapter configuration (if type='custom')
- `options`: AdapterOptions - Adapter-specific options

### LocalConfig

Local filesystem adapter configuration.

**Properties**:

- `basePath`: string - Base directory for file operations (default: './')
- `createMissingDirs`: boolean - Create missing directories automatically (default: true)

### S3Config

S3 adapter configuration.

**Properties**:

- `bucket`: string - S3 bucket name (required)
- `region`: string - AWS region (optional, defaults to AWS_REGION environment variable)
- `endpoint`: string - Custom S3 endpoint (optional)
- `forcePathStyle`: boolean - Use path-style addressing (default: false)
- `prefix`: string - Key prefix for all operations (optional)

**Note**: S3 credentials are read from environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (if not specified in config)

### CustomAdapterConfig

Custom adapter configuration.

**Properties**:

- `factory`: AdapterFactory - Factory function for creating adapter
- `options`: Record<string, any> - Custom options passed to factory

### AdapterOptions

Common adapter options.

**Properties**:

- `timeout`: number - Operation timeout in milliseconds (default: 30000)
- `retries`: number - Number of retry attempts (default: 3)
- `cache`: boolean - Enable caching (default: false)

## Error Entities

### FilesystemComponentError

Base error class for component errors (extends IgnisComponentError).

**Properties**:

- `component`: string - Component name ("filesystem")
- `operation`: string - Operation that failed
- `cause`: Error - Original error (if wrapped)
- `timestamp`: Date - Error timestamp
- `adapterType`: string - Adapter type (if applicable)
- `path`: string - File path (if applicable)

### ConfigurationError

Configuration validation error (extends FilesystemComponentError).

### AdapterInitializationError

Adapter initialization error (extends FilesystemComponentError).

### HealthCheckError

Health check failure error (extends FilesystemComponentError).

### FileOperationError

File operation error (extends FilesystemComponentError).

## Event Entities

### FileOperationEvent

File operation event for monitoring and auditing.

**Properties**:

- `operation`: 'read' | 'write' | 'delete' | 'copy' | 'rename' | 'mkdir' | 'rmdir' - Operation type
- `path`: string - File path
- `success`: boolean - Whether operation succeeded
- `duration`: number - Operation duration in milliseconds
- `timestamp`: Date - Event timestamp
- `error`: FilesystemError - Error (if operation failed)
- `metadata`: Record<string, any> - Additional metadata

### HealthStatus

Health check status.

**Properties**:

- `status`: 'healthy' | 'degraded' | 'unhealthy' - Health status
- `details`: Record<string, any> - Additional details
- `timestamp`: Date - Check timestamp
- `adapterType`: string - Adapter type tested
- `testFile`: string - Test file used (for read/write tests)

## Interface Definitions

### StorageAdapter

Interface for storage adapters (from existing filesystem library).

**Methods**:

- `readFile(path: string, encoding?: BufferEncoding): Promise<string>`
- `readFile(path: string): Promise<Buffer>`
- `writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>`
- `deleteFile(path: string): Promise<void>`
- `listFiles(path: string): Promise<string[]>`
- `stat(path: string): Promise<FileStats>`
- `mkdir(path: string, recursive?: boolean): Promise<void>`
- `rmdir(path: string, recursive?: boolean): Promise<void>`

### AdapterFactory

Factory interface for creating adapters.

**Methods**:

- `create(config: FilesystemAdapterConfig): StorageAdapter`
- `validate(config: FilesystemAdapterConfig): ValidationResult`
- `getType(): string`

### FilesystemService

Optional service wrapper interface.

**Properties**:

- `adapterType`: string - Current adapter type
- `config`: FilesystemAdapterConfig - Adapter configuration

**Methods**: All StorageAdapter methods plus:

- `healthCheck(): Promise<HealthStatus>`
- `getConfiguration(): FilesystemAdapterConfig`

## Relationships

```
FilesystemComponent --(has)--> FilesystemComponentConfig
FilesystemComponent --(uses)--> StorageAdapter
FilesystemComponentConfig --(contains)--> FilesystemAdapterConfig
FilesystemAdapterConfig --(has)--> LocalConfig | S3Config | CustomAdapterConfig
StorageAdapter --(implements)--> LocalAdapter | S3Adapter | CustomAdapter
FilesystemComponent --(emits)--> FileOperationEvent
FilesystemComponent --(throws)--> FilesystemComponentError
```

## Validation Rules

### Configuration Validation

1. `defaultAdapter` must match a key in `adapters` object
2. `adapters` object must contain at least one adapter configuration
3. For `type='local'`: `local.basePath` must be a valid path string
4. For `type='s3'`: `s3.bucket` must be a non-empty string
5. For `type='custom'`: `custom.factory` must be a function

### S3 Configuration Validation

1. If `s3.region` not provided, `AWS_REGION` environment variable must be set
2. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables must be set for S3 operations

### Health Check Validation

1. Health check creates temporary test file with unique name
2. Test file must be deleted after health check completion
3. Read/write operations must complete within timeout

## State Transitions

### Component Lifecycle

```
Uninitialized → Binding → Configured → Started → Active → Stopped → Destroyed
```

### Adapter State

```
Uninitialized → Validating → Initializing → Ready → Error → Disposed
```

### Health Check State

```
Idle → Testing → Evaluating → Healthy/Unhealthy → Cleaning → Idle
```

## Data Flow

1. **Configuration Loading**: Ignis config → FilesystemComponentConfig → Validation
2. **Adapter Initialization**: Config → AdapterFactory → StorageAdapter instance
3. **Dependency Injection**: FilesystemComponent registered → Binding keys set → Services can inject
4. **File Operations**: Service → FilesystemComponent → StorageAdapter → Storage backend
5. **Error Handling**: StorageAdapter error → FilesystemComponentError → Event hook/throw
6. **Health Checking**: Scheduled/Manual → Test file operations → HealthStatus → Event

## TypeScript Type Definitions

All entities have corresponding TypeScript interfaces with:

- Strict typing with generics where appropriate
- Optional properties marked with `?`
- Readonly properties for immutable data
- Union types for discriminated unions (e.g., adapter types)
- Type guards for runtime type checking

## Migration Considerations

### From Standalone Filesystem Library

- Existing code using filesystem library directly can inject component instead
- Configuration moves from programmatic setup to Ignis config files
- Error handling changes to wrapped IgnisComponentError

### Future Extensions

- Additional adapter types (Google Cloud Storage, Azure Blob Storage)
- Enhanced monitoring with metrics collection
- Advanced caching strategies
- File versioning support
