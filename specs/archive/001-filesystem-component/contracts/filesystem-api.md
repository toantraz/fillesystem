# Filesystem Component API Contract

**Version**: 1.0.0  
**Date**: 2025-12-23  
**Status**: Draft

## Overview

This document defines the public API contract for the Filesystem Component library. The library provides a consistent interface for file operations across multiple storage backends (local filesystem and AWS S3).

## Core Interface: `Filesystem`

The main interface that all storage adapters must implement.

```typescript
interface Filesystem {
  // File operations
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
  appendFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
  unlink(path: string): Promise<void>;
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;

  // Directory operations
  readdir(path: string): Promise<string[]>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;

  // File info operations
  stat(path: string): Promise<FileStats>;
  lstat(path: string): Promise<FileStats>;
  access(path: string, mode?: number): Promise<void>;

  // Stream operations
  createReadStream(path: string, options?: ReadStreamOptions): Readable;
  createWriteStream(path: string, options?: WriteStreamOptions): Writable;

  // Utility methods
  exists(path: string): Promise<boolean>;
  realpath(path: string): Promise<string>;
}
```

## Supporting Interfaces

### `FileStats`

```typescript
interface FileStats {
  // Type checks
  isFile(): boolean;
  isDirectory(): boolean;
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isSymbolicLink(): boolean;
  isFIFO(): boolean;
  isSocket(): boolean;

  // Properties
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}
```

### Configuration Interfaces

```typescript
interface FilesystemConfig {
  type: "local" | "s3";
  local?: LocalConfig;
  s3?: S3Config;
}

interface LocalConfig {
  basePath?: string;
  createMissingDirs?: boolean;
}

interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  prefix?: string;
}
```

### Stream Options

```typescript
interface ReadStreamOptions {
  encoding?: BufferEncoding;
  start?: number;
  end?: number;
  highWaterMark?: number;
}

interface WriteStreamOptions {
  encoding?: BufferEncoding;
  flags?: string;
  mode?: number;
}
```

## Factory Function

```typescript
function createFilesystem(config: FilesystemConfig): Filesystem;
```

## Error Types

```typescript
class FilesystemError extends Error {
  constructor(message: string, options?: { cause?: Error });
}

class FileNotFoundError extends FilesystemError {}
class PermissionError extends FilesystemError {}
class StorageError extends FilesystemError {}
class NetworkError extends FilesystemError {}
class ValidationError extends FilesystemError {}
```

## Method Specifications

### `readFile`

- **Purpose**: Read entire file contents
- **Parameters**:
  - `path`: File path
  - `encoding` (optional): Character encoding
- **Returns**: Promise resolving to file content as string (if encoding provided) or Buffer
- **Throws**: `FileNotFoundError`, `PermissionError`, `StorageError`

### `writeFile`

- **Purpose**: Write data to file, creating file if it doesn't exist
- **Parameters**:
  - `path`: File path
  - `data`: Content to write (string or Buffer)
  - `encoding` (optional): Character encoding for string data
- **Returns**: Promise resolving when write completes
- **Throws**: `PermissionError`, `StorageError`

### `appendFile`

- **Purpose**: Append data to existing file
- **Parameters**: Same as `writeFile`
- **Returns**: Promise resolving when append completes
- **Throws**: `FileNotFoundError`, `PermissionError`, `StorageError`

### `unlink`

- **Purpose**: Delete a file
- **Parameters**: `path`: File path
- **Returns**: Promise resolving when file is deleted
- **Throws**: `FileNotFoundError`, `PermissionError`

### `copyFile`

- **Purpose**: Copy file from source to destination
- **Parameters**:
  - `src`: Source file path
  - `dest`: Destination file path
- **Returns**: Promise resolving when copy completes
- **Throws**: `FileNotFoundError`, `PermissionError`, `StorageError`

### `rename`

- **Purpose**: Rename or move a file
- **Parameters**:
  - `oldPath`: Current file path
  - `newPath`: New file path
- **Returns**: Promise resolving when rename completes
- **Throws**: `FileNotFoundError`, `PermissionError`, `StorageError`

### `readdir`

- **Purpose**: Read directory contents
- **Parameters**: `path`: Directory path
- **Returns**: Promise resolving to array of entry names
- **Throws**: `FileNotFoundError`, `PermissionError` (if not a directory)

### `mkdir`

- **Purpose**: Create directory
- **Parameters**:
  - `path`: Directory path
  - `options`: Optional configuration
    - `recursive`: Create parent directories if needed (default: false)
- **Returns**: Promise resolving when directory is created
- **Throws**: `PermissionError`, `StorageError`

### `rmdir`

- **Purpose**: Remove directory
- **Parameters**:
  - `path`: Directory path
  - `options`: Optional configuration
    - `recursive`: Remove directory and all contents (default: false)
- **Returns**: Promise resolving when directory is removed
- **Throws**: `FileNotFoundError`, `PermissionError`, `StorageError` (if not empty and not recursive)

### `stat` / `lstat`

- **Purpose**: Get file/directory statistics
- **Parameters**: `path`: File/directory path
- **Returns**: Promise resolving to `FileStats` object
- **Throws**: `FileNotFoundError`, `PermissionError`
- **Note**: `lstat` returns information about symbolic link itself, not target

### `access`

- **Purpose**: Check file accessibility
- **Parameters**:
  - `path`: File path
  - `mode` (optional): Accessibility mode (fs.constants.F_OK, R_OK, W_OK, X_OK)
- **Returns**: Promise resolving if accessible, rejecting if not
- **Throws**: `FileNotFoundError`, `PermissionError`

### `createReadStream`

- **Purpose**: Create readable stream for file
- **Parameters**:
  - `path`: File path
  - `options`: Stream configuration
- **Returns**: Readable stream
- **Throws**: `FileNotFoundError`, `PermissionError` (on stream error)

### `createWriteStream`

- **Purpose**: Create writable stream for file
- **Parameters**:
  - `path`: File path
  - `options`: Stream configuration
- **Returns**: Writable stream
- **Throws**: `PermissionError` (on stream error)

### `exists`

- **Purpose**: Check if file/directory exists
- **Parameters**: `path`: File/directory path
- **Returns**: Promise resolving to boolean
- **Note**: Does not throw for non-existent files, returns false instead

### `realpath`

- **Purpose**: Resolve symbolic links and relative paths
- **Parameters**: `path`: File/directory path
- **Returns**: Promise resolving to resolved absolute path
- **Throws**: `FileNotFoundError`, `PermissionError`

## Backend-Specific Notes

### Local Filesystem

- Full `FileStats` support including permissions and symbolic links
- `realpath` resolves symbolic links
- `lstat` available for symbolic link inspection
- File permissions enforced by OS

### AWS S3

- Limited `FileStats`: size and timestamps available, permissions approximated via IAM/ACL
- No symbolic link support
- `realpath` returns normalized path (no symbolic link resolution)
- `lstat` behaves same as `stat` (no symbolic links)
- Stream operations use S3 multipart upload/download for large files

## Compliance Requirements

All implementations must:

1. Follow the exact method signatures specified above
2. Throw appropriate error types for failure conditions
3. Handle path normalization consistently
4. Support both string and Buffer data types for file operations
5. Provide meaningful error messages including original cause when available
6. Be thread-safe for concurrent operations (where supported by backend)

## Versioning

- **Major version**: Breaking changes to API contract
- **Minor version**: New features, backward compatible
- **Patch version**: Bug fixes, backward compatible

Breaking changes include:

- Removing or renaming public methods
- Changing method signatures (parameters or return types)
- Changing error types thrown by methods
