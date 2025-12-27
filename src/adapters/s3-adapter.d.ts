/**
 * AWS S3 Adapter
 *
 * Adapter for AWS S3 storage operations using AWS SDK v3.
 */
import { Readable, Writable } from "stream";
import { BaseAdapter, ReadStreamOptions, WriteStreamOptions } from "../interfaces/adapter.interface";
import { FileStats } from "../interfaces/filesystem.interface";
/**
 * S3 adapter configuration
 */
export interface S3AdapterConfig {
    /** S3 bucket name */
    bucket: string;
    /** AWS region */
    region: string;
    /** AWS access key ID */
    accessKeyId: string;
    /** AWS secret access key */
    secretAccessKey: string;
    /** Custom S3 endpoint */
    endpoint: string;
    /** Use path-style addressing */
    forcePathStyle: boolean;
    /** Key prefix for all operations */
    prefix: string;
    /** S3-specific timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retries for S3 operations */
    maxRetries?: number;
    /** Enable debug logging */
    debug?: boolean;
    /** Custom logger function */
    logger?: (level: "debug" | "info" | "warn" | "error", message: string, metadata?: unknown) => void;
}
/**
 * S3 filesystem adapter implementation
 */
export declare class S3Adapter implements BaseAdapter {
    private config;
    private s3Client;
    private logger;
    constructor(config: S3AdapterConfig);
    /**
     * Convert file path to S3 key
     */
    private pathToKey;
    /**
     * Map S3 error to filesystem error
     */
    private mapS3Error;
    /**
     * Read entire file contents
     */
    readFile(filePath: string): Promise<Buffer>;
    readFile(filePath: string, encoding: BufferEncoding): Promise<string>;
    /**
     * Write data to file
     */
    writeFile(filePath: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
    /**
     * Append data to file
     */
    appendFile(filePath: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
    /**
     * Delete a file
     */
    unlink(filePath: string): Promise<void>;
    /**
     * Copy file from source to destination
     */
    copyFile(src: string, dest: string): Promise<void>;
    /**
     * Rename or move a file
     */
    rename(oldPath: string, newPath: string): Promise<void>;
    /**
     * Read directory contents
     */
    readdir(dirPath: string): Promise<string[]>;
    /**
     * Create directory
     */
    mkdir(dirPath: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    /**
     * Remove directory
     */
    rmdir(dirPath: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    /**
     * Get file/directory statistics
     */
    stat(filePath: string): Promise<FileStats>;
    /**
     * Convert S3 metadata to FileStats interface
     */
    private convertS3MetadataToFileStats;
    /**
     * Get symbolic link statistics
     */
    lstat(filePath: string): Promise<FileStats>;
    /**
     * Check file accessibility
     */
    access(filePath: string, _mode?: number): Promise<void>;
    /**
     * Create readable stream for file
     */
    createReadStream(filePath: string, options?: ReadStreamOptions): Readable;
    /**
     * Create writable stream for file
     */
    createWriteStream(filePath: string, options?: WriteStreamOptions): Writable;
    /**
     * Check if file/directory exists
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Resolve symbolic links and relative paths
     */
    realpath(filePath: string): Promise<string>;
}
//# sourceMappingURL=s3-adapter.d.ts.map