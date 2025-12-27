/**
 * Filesystem Component - Main Library Export
 *
 * A transparent filesystem abstraction library that provides a consistent interface
 * for file operations across multiple storage backends (local filesystem and AWS S3).
 *
 * @packageDocumentation
 */

// Core exports
export { createFilesystem } from "./core/filesystem-factory";
export { Filesystem } from "./interfaces/filesystem.interface";

// Adapters
export { LocalAdapter, type LocalAdapterConfig } from "./adapters/local-adapter";
export { S3Adapter, type S3AdapterConfig } from "./adapters/s3-adapter";

// Interfaces
export {
  BaseAdapter,
  type ReadStreamOptions,
  type WriteStreamOptions,
} from "./interfaces/adapter.interface";
export { type FileStats } from "./interfaces/filesystem.interface";

// Configuration types
export { type FilesystemConfig, type LocalConfig, type S3Config } from "./types/config";

// Errors
export {
  FilesystemError,
  FileNotFoundError,
  PermissionError,
  StorageError,
  NetworkError,
  ValidationError,
} from "./errors/filesystem-errors";

// Utilities
export { normalizePath, joinPath, validatePath } from "./utils/path-utils";
export { mapNativeError } from "./errors/filesystem-errors";

// Ignis Component
export { FilesystemComponent, default as FilesystemComponentDefault } from "./component";

// Component exports
export * from "./common";

// Re-export commonly used items for convenience
import { createFilesystem } from "./core/filesystem-factory";
import { LocalAdapter } from "./adapters/local-adapter";
import { S3Adapter } from "./adapters/s3-adapter";

export {
  createFilesystem as createFilesystemInstance,
  LocalAdapter as LocalFilesystemAdapter,
  S3Adapter as S3FilesystemAdapter,
};
