/**
 * Filesystem Component Error Hierarchy
 *
 * Base error class and specific error types for filesystem operations.
 * Follows the error hierarchy defined in contracts/filesystem-api.md
 */
/**
 * Base filesystem error class
 */
export declare class FilesystemError extends Error {
    readonly cause?: Error;
    constructor(message: string, options?: {
        cause?: Error;
    });
}
/**
 * File not found error
 */
export declare class FileNotFoundError extends FilesystemError {
    constructor(path: string, options?: {
        cause?: Error;
    });
}
/**
 * Permission denied error
 */
export declare class PermissionError extends FilesystemError {
    constructor(path: string, operation: string, options?: {
        cause?: Error;
    });
}
/**
 * Storage backend error (disk full, quota exceeded, etc.)
 */
export declare class StorageError extends FilesystemError {
    constructor(message: string, options?: {
        cause?: Error;
    });
}
/**
 * Network error (S3 connection issues, timeouts, etc.)
 */
export declare class NetworkError extends FilesystemError {
    constructor(message: string, options?: {
        cause?: Error;
    });
}
/**
 * Validation error (invalid path, configuration, etc.)
 */
export declare class ValidationError extends FilesystemError {
    constructor(message: string, options?: {
        cause?: Error;
    });
}
/**
 * Utility function to map native errors to filesystem errors
 */
export declare function mapNativeError(error: Error, context: {
    path?: string;
    operation?: string;
}): FilesystemError;
//# sourceMappingURL=filesystem-errors.d.ts.map