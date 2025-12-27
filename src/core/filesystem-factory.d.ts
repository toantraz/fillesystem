/**
 * Filesystem Factory
 *
 * Factory function to create filesystem instances based on configuration.
 */
import { Filesystem } from "../interfaces/filesystem.interface";
import { FilesystemConfig } from "../types/config";
/**
 * Filesystem factory implementation
 */
export declare class FilesystemFactory {
    /**
     * Create a filesystem instance based on configuration
     */
    static create(config: FilesystemConfig): Filesystem;
    /**
     * Create local filesystem adapter
     */
    private static createLocalAdapter;
    /**
     * Create S3 adapter
     */
    private static createS3Adapter;
    /**
     * Create filesystem wrapper around adapter
     */
    private static createFilesystemWrapper;
}
/**
 * Factory function to create filesystem instance
 *
 * This is the main export that users will call.
 */
export declare function createFilesystem(config: FilesystemConfig): Filesystem;
/**
 * Create filesystem instance from environment variables
 *
 * Reads configuration from environment variables:
 * - FILESYSTEM_TYPE: 'local' or 's3'
 * - For local: FILESYSTEM_LOCAL_BASE_PATH, FILESYSTEM_LOCAL_CREATE_MISSING_DIRS
 * - For S3: FILESYSTEM_S3_BUCKET, FILESYSTEM_S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.
 * - Common: FILESYSTEM_TIMEOUT, FILESYSTEM_MAX_RETRIES, FILESYSTEM_DEBUG
 *
 * @throws {ValidationError} if environment variables are invalid or incomplete
 */
export declare function createFilesystemFromEnv(): Filesystem;
//# sourceMappingURL=filesystem-factory.d.ts.map