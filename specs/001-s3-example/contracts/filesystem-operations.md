# Filesystem Operations Contract

**Feature**: 001-s3-example
**Interface**: Filesystem (from @ignis/filesystem)
**Adapter**: S3Adapter with MinIO backend

## Overview

This document defines the contract for filesystem operations demonstrated in the S3/MinIO example. All operations are part of the `Filesystem` interface from the core package.

---

## Operations

### writeFile(path, content, encoding?)

Write content to a file in S3.

| Parameter  | Type             | Required | Description                              |
| ---------- | ---------------- | -------- | ---------------------------------------- |
| `path`     | string           | Yes      | S3 object key (e.g., `"/test-file.txt"`) |
| `content`  | string \| Buffer | Yes      | Content to write                         |
| `encoding` | string           | No       | Character encoding (default: `"utf8"`)   |

**Returns**: `Promise<void>`

**Errors**:

- `FilesystemError` - S3 operation failed
- `ValidationError` - Invalid path or content

**Example**:

```typescript
await filesystem.writeFile("/test-file.txt", "Hello from S3!");
```

---

### readFile(path, encoding?)

Read content from a file in S3.

| Parameter  | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| `path`     | string | Yes      | S3 object key                          |
| `encoding` | string | No       | Character encoding (default: `"utf8"`) |

**Returns**: `Promise<Buffer> | Promise<string>`

**Errors**:

- `FileNotFoundError` - Object key does not exist in bucket
- `FilesystemError` - S3 operation failed

**Example**:

```typescript
const content = await filesystem.readFile("/test-file.txt", "utf8");
// Returns: "Hello from S3!"
```

---

### exists(path)

Check if a file exists in S3.

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `path`    | string | Yes      | S3 object key |

**Returns**: `Promise<boolean>` - `true` if object exists, `false` otherwise

**Errors**: None (returns `false` on any error)

**Example**:

```typescript
const exists = await filesystem.exists("/test-file.txt");
// Returns: true
```

---

### stat(path)

Get metadata about a file in S3.

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `path`    | string | Yes      | S3 object key |

**Returns**: `Promise<FileStats>`

| Field         | Type    | Description                   |
| ------------- | ------- | ----------------------------- |
| `size`        | number  | Object size in bytes          |
| `mtime`       | Date    | Last modified timestamp       |
| `isFile`      | boolean | Always `true` for S3 objects  |
| `isDirectory` | boolean | Always `false` for S3 objects |

**Errors**:

- `FileNotFoundError` - Object key does not exist

**Example**:

```typescript
const stats = await filesystem.stat("/test-file.txt");
// Returns: { size: 28, mtime: Date, isFile: true, isDirectory: false }
```

---

### readdir(path)

List objects in a directory (prefix) in S3.

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `path`    | string | Yes      | Directory path (used as S3 prefix) |

**Returns**: `Promise<string[]>` - Array of object keys with the prefix

**Errors**:

- `FileNotFoundError` - Prefix does not exist
- `FilesystemError` - S3 operation failed

**Example**:

```typescript
const files = await filesystem.readdir("/demo-dir/");
// Returns: ['demo-dir/nested.txt']
```

---

### unlink(path)

Delete a file from S3.

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `path`    | string | Yes      | S3 object key |

**Returns**: `Promise<void>`

**Errors**:

- `FileNotFoundError` - Object key does not exist
- `FilesystemError` - S3 operation failed

**Example**:

```typescript
await filesystem.unlink("/test-file.txt");
```

---

## Error Types

### FileNotFoundError

Object key does not exist in the S3 bucket.

```typescript
class FileNotFoundError extends FilesystemError {
  code = "NOT_FOUND";
  message = "File not found: <path>";
}
```

### ValidationError

Invalid input parameter.

```typescript
class ValidationError extends FilesystemError {
  code = "VALIDATION_ERROR";
  message = "Validation failed: <reason>";
}
```

### FilesystemError

Generic S3 operation failure.

```typescript
class FilesystemError extends Error {
  code = "FS_ERROR";
  message = "Filesystem operation failed: <reason>";
  cause?: Error; // Original AWS SDK error
}
```

---

## S3-Specific Behavior

### Path Translation

| Filesystem Path       | S3 Object Key         |
| --------------------- | --------------------- |
| `/file.txt`           | `file.txt`            |
| `/dir/file.txt`       | `dir/file.txt`        |
| `dir/nested/file.txt` | `dir/nested/file.txt` |

**Note**: Leading `/` is stripped for S3 object keys.

### Empty Directories

S3 does not have real directories. An empty directory is represented as:

- A zero-byte object with key ending in `/` (e.g., `dir/`)
- OR no objects at all (directory "exists" only if it contains objects)

### Special Cases

| Scenario                  | Behavior                            |
| ------------------------- | ----------------------------------- |
| Path with `..` segments   | Normalized before S3 key generation |
| Path with `//`            | Collapsed to single `/`             |
| Empty filename            | ValidationError                     |
| Path exceeding 1024 chars | ValidationError (S3 limit)          |

---

## Success Criteria

Each operation must:

1. **Complete within timeout**: 5 seconds per operation
2. **Return expected type**: Correct Promise return type
3. **Handle errors**: Throw appropriate error type
4. **Log outcome**: Success/failure logged with operation name
5. **Idempotent**: Safe to retry (except `writeFile` which overwrites)

---

## Example Usage Flow

```typescript
// 1. Write
await filesystem.writeFile("/test.txt", "Hello");

// 2. Check existence
const exists = await filesystem.exists("/test.txt");
// => true

// 3. Get stats
const stats = await filesystem.stat("/test.txt");
// => { size: 5, mtime: Date, ... }

// 4. Read
const content = await filesystem.readFile("/test.txt", "utf8");
// => "Hello"

// 5. List
const files = await filesystem.readdir("/");
// => ['test.txt']

// 6. Delete
await filesystem.unlink("/test.txt");

// 7. Verify gone
const exists2 = await filesystem.exists("/test.txt");
// => false
```
