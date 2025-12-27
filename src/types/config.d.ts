/**
 * Filesystem Component Configuration Types
 *
 * Type definitions for filesystem configuration options.
 * Based on contracts/filesystem-api.md and data-model.md
 */
/**
 * Main filesystem configuration
 */
export interface FilesystemConfig {
    /** Storage backend type */
    type: "local" | "s3";
    /** Local filesystem configuration (required when type is 'local') */
    local?: LocalConfig;
    /** AWS S3 configuration (required when type is 's3') */
    s3?: S3Config;
    /** Common configuration options for all backends */
    common?: CommonConfig;
}
/**
 * Local filesystem configuration
 */
export interface LocalConfig {
    /** Base directory for all file operations (default: current directory) */
    basePath?: string;
    /** Whether to create missing directories automatically (default: false) */
    createMissingDirs?: boolean;
}
/**
 * AWS S3 configuration
 */
export interface S3Config {
    /** S3 bucket name (required) */
    bucket: string;
    /** AWS region (required) */
    region: string;
    /** AWS access key ID (optional, uses AWS credentials chain if not provided) */
    accessKeyId?: string;
    /** AWS secret access key (optional, uses AWS credentials chain if not provided) */
    secretAccessKey?: string;
    /** Custom S3 endpoint for S3-compatible services (optional) */
    endpoint?: string;
    /** Use path-style addressing (required for some S3-compatible services) */
    forcePathStyle?: boolean;
    /** Key prefix for all operations (virtual directory) */
    prefix?: string;
    /** S3-specific timeout in milliseconds (optional) */
    timeout?: number;
    /** Maximum number of retries for S3 operations (optional) */
    maxRetries?: number;
}
/**
 * Common configuration options for all storage backends
 */
export interface CommonConfig {
    /** Operation timeout in milliseconds (optional) */
    timeout?: number;
    /** Maximum number of retries for failed operations (optional) */
    maxRetries?: number;
    /** Enable debug logging (optional) */
    debug?: boolean;
    /** Custom logger function (optional) */
    logger?: (level: "debug" | "info" | "warn" | "error", message: string, metadata?: any) => void;
}
/**
 * Validated filesystem configuration (after validation)
 */
export interface ValidatedFilesystemConfig {
    type: "local" | "s3";
    local: Required<LocalConfig>;
    s3?: Required<S3Config>;
    common: Required<CommonConfig>;
}
/**
 * Default configuration values
 */
export declare const DEFAULT_LOCAL_CONFIG: Required<LocalConfig>;
/**
 * Default common configuration values
 */
export declare const DEFAULT_COMMON_CONFIG: Required<CommonConfig>;
/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    config?: ValidatedFilesystemConfig;
}
/**
 * Validate filesystem configuration
 */
export declare function validateConfig(config: FilesystemConfig): ConfigValidationResult;
//# sourceMappingURL=config.d.ts.map