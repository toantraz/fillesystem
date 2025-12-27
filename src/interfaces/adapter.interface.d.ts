/**
 * Base Adapter Interface
 *
 * Defines the contract that all storage adapters must implement.
 * Based on the Filesystem interface from contracts/filesystem-api.md
 */
import { Readable, Writable } from "stream";
import { FileStats } from "./filesystem.interface";
/**
 * Base adapter interface that all storage adapters must implement
 */
export interface BaseAdapter {
    readFile(path: string, encoding?: BufferEncoding): Promise<string>;
    readFile(path: string): Promise<Buffer>;
    writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
    appendFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
    unlink(path: string): Promise<void>;
    copyFile(src: string, dest: string): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    readdir(path: string): Promise<string[]>;
    mkdir(path: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    rmdir(path: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    stat(path: string): Promise<FileStats>;
    lstat(path: string): Promise<FileStats>;
    access(path: string, mode?: number): Promise<void>;
    createReadStream(path: string, options?: ReadStreamOptions): Readable;
    createWriteStream(path: string, options?: WriteStreamOptions): Writable;
    exists(path: string): Promise<boolean>;
    realpath(path: string): Promise<string>;
}
/**
 * Read stream options
 */
export interface ReadStreamOptions {
    encoding?: BufferEncoding;
    start?: number;
    end?: number;
    highWaterMark?: number;
}
/**
 * Write stream options
 */
export interface WriteStreamOptions {
    encoding?: BufferEncoding;
    flags?: string;
    mode?: number;
}
/**
 * Adapter configuration options (backend-specific)
 */
export interface AdapterConfig {
    basePath?: string;
    [key: string]: any;
}
/**
 * Adapter factory function type
 */
export type AdapterFactory<T extends AdapterConfig = AdapterConfig> = (config: T) => BaseAdapter;
/**
 * Adapter capabilities
 */
export interface AdapterCapabilities {
    /** Whether the adapter supports streaming */
    streaming: boolean;
    /** Whether the adapter supports symbolic links */
    symbolicLinks: boolean;
    /** Whether the adapter supports file permissions */
    permissions: boolean;
    /** Whether the adapter supports directory operations */
    directories: boolean;
    /** Maximum file size supported (in bytes, 0 for unlimited) */
    maxFileSize: number;
    /** Whether the adapter is network-based (has latency) */
    networkBased: boolean;
}
/**
 * Adapter metadata
 */
export interface AdapterMetadata {
    /** Adapter name */
    name: string;
    /** Adapter version */
    version: string;
    /** Adapter capabilities */
    capabilities: AdapterCapabilities;
    /** Whether adapter is available/connected */
    isAvailable: boolean;
}
//# sourceMappingURL=adapter.interface.d.ts.map