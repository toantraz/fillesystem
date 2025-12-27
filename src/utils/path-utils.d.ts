/**
 * Path Utility Functions
 *
 * Utilities for normalizing and manipulating file paths across storage backends.
 */
/**
 * Normalize a path for consistent handling
 * - Converts backslashes to forward slashes
 * - Removes duplicate slashes
 * - Removes trailing slashes (except for root)
 * - Resolves . and .. segments
 * - Ensures path starts with / for absolute paths
 */
export declare function normalizePath(path: string): string;
/**
 * Join multiple path segments
 */
export declare function joinPath(...segments: string[]): string;
/**
 * Get the directory name from a path
 */
export declare function dirname(path: string): string;
/**
 * Get the base name from a path
 */
export declare function basename(path: string, ext?: string): string;
/**
 * Get the extension from a path
 */
export declare function extname(path: string): string;
/**
 * Check if a path is absolute
 */
export declare function isAbsolute(path: string): boolean;
/**
 * Resolve a path relative to a base directory
 */
export declare function resolvePath(base: string, relativePath: string): string;
/**
 * Convert a path to be relative to a base directory
 */
export declare function relativePath(from: string, to: string): string;
/**
 * Validate a path for common issues
 */
export declare function validatePath(path: string): {
    isValid: boolean;
    error?: string;
};
//# sourceMappingURL=path-utils.d.ts.map