/**
 * Local Filesystem Adapter
 *
 * Adapter for local filesystem operations using Node.js fs module.
 */
import { Readable, Writable } from "stream";
import { BaseAdapter, ReadStreamOptions, WriteStreamOptions } from "../interfaces/adapter.interface";
import { FileStats } from "../interfaces/filesystem.interface";
/**
 * Local adapter configuration
 */
export interface LocalAdapterConfig {
    /** Base directory for all file operations */
    basePath: string;
    /** Whether to create missing directories automatically */
    createMissingDirs: boolean;
    /** Operation timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retries for failed operations */
    maxRetries?: number;
    /** Enable debug logging */
    debug?: boolean;
    /** Custom logger function */
    logger?: (level: "debug" | "info" | "warn" | "error", message: string, metadata?: unknown) => void;
}
/**
 * Local filesystem adapter implementation
 */
export declare class LocalAdapter implements BaseAdapter {
    private config;
    private logger;
    constructor(config: LocalAdapterConfig);
    /**
     * Ensure a directory exists, creating it if necessary
     */
    private ensureDirectoryExists;
    /**
     * Resolve a path relative to the base path
     */
    private resolvePath;
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
     * Get symbolic link statistics
     */
    lstat(filePath: string): Promise<FileStats>;
    /**
     * Check file accessibility
     */
    access(filePath: string, mode?: number): Promise<void>;
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
    /**
     * Convert Node.js fs.Stats to FileStats interface
     */
    private convertStats;
}
//# sourceMappingURL=local-adapter.d.ts.map