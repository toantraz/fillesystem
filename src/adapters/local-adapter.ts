/**
 * Local Filesystem Adapter
 *
 * Adapter for local filesystem operations using Node.js fs module.
 */

import fs from "fs/promises";
import fsSync from "fs";
import { Readable, Writable } from "stream";
import path from "path";

import {
  BaseAdapter,
  ReadStreamOptions,
  WriteStreamOptions,
} from "../interfaces/adapter.interface";
import { FileStats } from "../interfaces/filesystem.interface";
import { mapNativeError, PermissionError } from "../errors/filesystem-errors";
import { normalizePath } from "../utils/path-utils";

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
  logger?: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: unknown,
  ) => void;
}

/**
 * Local filesystem adapter implementation
 */
export class LocalAdapter implements BaseAdapter {
  private config: LocalAdapterConfig;
  private logger: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: unknown,
  ) => void;

  constructor(config: LocalAdapterConfig) {
    this.config = config;
    this.logger =
      config.logger ||
      ((level, message, metadata) => {
        if (config.debug) {
          console.log(`[${level}] ${message}`, metadata || "");
        }
      });

    // Log initialization
    this.logger("debug", "LocalAdapter initialized", {
      basePath: config.basePath,
      createMissingDirs: config.createMissingDirs,
    });

    // Ensure base path exists if createMissingDirs is true
    if (this.config.createMissingDirs) {
      this.ensureDirectoryExists(this.config.basePath).catch(error => {
        this.logger("warn", "Failed to create base directory during initialization", { error });
      });
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
      if (error instanceof Error && !error.message.includes("EEXIST")) {
        throw mapNativeError(error, { path: dirPath, operation: "mkdir" });
      }
    }
  }

  /**
   * Resolve a path relative to the base path
   */
  private resolvePath(filePath: string): string {
    const normalized = normalizePath(filePath);
    const resolved = path.resolve(this.config.basePath, normalized);

    // Security check: ensure path is within base path
    if (!resolved.startsWith(path.resolve(this.config.basePath))) {
      throw new PermissionError(filePath, "access", {
        cause: new Error("Path traversal attempt detected"),
      });
    }

    return resolved;
  }

  /**
   * Read entire file contents
   */
  async readFile(filePath: string): Promise<Buffer>;
  async readFile(filePath: string, encoding: BufferEncoding): Promise<string>;
  async readFile(filePath: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const resolvedPath = this.resolvePath(filePath);

    this.logger("debug", "readFile called", { filePath, resolvedPath, encoding });

    try {
      const startTime = Date.now();
      const result = encoding
        ? await fs.readFile(resolvedPath, encoding)
        : await fs.readFile(resolvedPath);
      const duration = Date.now() - startTime;

      this.logger("debug", "readFile completed", {
        filePath,
        duration,
        size: Buffer.isBuffer(result) ? result.length : result.length,
      });

      return result;
    } catch (error) {
      this.logger("error", "readFile failed", { filePath, error });
      throw mapNativeError(error as Error, { path: filePath, operation: "readFile" });
    }
  }

  /**
   * Write data to file
   */
  async writeFile(
    filePath: string,
    data: string | Buffer,
    encoding?: BufferEncoding,
  ): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    // Ensure directory exists if configured
    if (this.config.createMissingDirs) {
      const dir = path.dirname(resolvedPath);
      await this.ensureDirectoryExists(dir);
    }

    try {
      if (encoding && typeof data === "string") {
        await fs.writeFile(resolvedPath, data, encoding);
      } else {
        await fs.writeFile(resolvedPath, data);
      }
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "writeFile" });
    }
  }

  /**
   * Append data to file
   */
  async appendFile(
    filePath: string,
    data: string | Buffer,
    encoding?: BufferEncoding,
  ): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    // Ensure directory exists if configured
    if (this.config.createMissingDirs) {
      const dir = path.dirname(resolvedPath);
      await this.ensureDirectoryExists(dir);
    }

    try {
      if (encoding && typeof data === "string") {
        await fs.appendFile(resolvedPath, data, encoding);
      } else {
        await fs.appendFile(resolvedPath, data);
      }
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "appendFile" });
    }
  }

  /**
   * Delete a file
   */
  async unlink(filePath: string): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      await fs.unlink(resolvedPath);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "unlink" });
    }
  }

  /**
   * Copy file from source to destination
   */
  async copyFile(src: string, dest: string): Promise<void> {
    const resolvedSrc = this.resolvePath(src);
    const resolvedDest = this.resolvePath(dest);

    // Ensure destination directory exists if configured
    if (this.config.createMissingDirs) {
      const dir = path.dirname(resolvedDest);
      await this.ensureDirectoryExists(dir);
    }

    try {
      await fs.copyFile(resolvedSrc, resolvedDest);
    } catch (error) {
      throw mapNativeError(error as Error, { path: src, operation: "copyFile" });
    }
  }

  /**
   * Rename or move a file
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const resolvedOld = this.resolvePath(oldPath);
    const resolvedNew = this.resolvePath(newPath);

    // Ensure destination directory exists if configured
    if (this.config.createMissingDirs) {
      const dir = path.dirname(resolvedNew);
      await this.ensureDirectoryExists(dir);
    }

    try {
      await fs.rename(resolvedOld, resolvedNew);
    } catch (error) {
      throw mapNativeError(error as Error, { path: oldPath, operation: "rename" });
    }
  }

  /**
   * Read directory contents
   */
  async readdir(dirPath: string): Promise<string[]> {
    const resolvedPath = this.resolvePath(dirPath);

    try {
      return await fs.readdir(resolvedPath);
    } catch (error) {
      throw mapNativeError(error as Error, { path: dirPath, operation: "readdir" });
    }
  }

  /**
   * Create directory
   */
  async mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    const resolvedPath = this.resolvePath(dirPath);

    try {
      await fs.mkdir(resolvedPath, { recursive: options?.recursive });
    } catch (error) {
      throw mapNativeError(error as Error, { path: dirPath, operation: "mkdir" });
    }
  }

  /**
   * Remove directory
   */
  async rmdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    const resolvedPath = this.resolvePath(dirPath);

    try {
      if (options?.recursive) {
        await fs.rm(resolvedPath, { recursive: true, force: true });
      } else {
        await fs.rmdir(resolvedPath);
      }
    } catch (error) {
      throw mapNativeError(error as Error, { path: dirPath, operation: "rmdir" });
    }
  }

  /**
   * Get file/directory statistics
   */
  async stat(filePath: string): Promise<FileStats> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      const stats = await fs.stat(resolvedPath);
      return this.convertStats(stats);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "stat" });
    }
  }

  /**
   * Get symbolic link statistics
   */
  async lstat(filePath: string): Promise<FileStats> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      const stats = await fs.lstat(resolvedPath);
      return this.convertStats(stats);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "lstat" });
    }
  }

  /**
   * Check file accessibility
   */
  async access(filePath: string, mode?: number): Promise<void> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      await fs.access(resolvedPath, mode);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "access" });
    }
  }

  /**
   * Create readable stream for file
   */
  createReadStream(filePath: string, options?: ReadStreamOptions): Readable {
    const resolvedPath = this.resolvePath(filePath);

    try {
      return fsSync.createReadStream(resolvedPath, options);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "createReadStream" });
    }
  }

  /**
   * Create writable stream for file
   */
  createWriteStream(filePath: string, options?: WriteStreamOptions): Writable {
    const resolvedPath = this.resolvePath(filePath);

    // Ensure directory exists if configured
    if (this.config.createMissingDirs) {
      const dir = path.dirname(resolvedPath);
      // Note: This is synchronous because createWriteStream is synchronous
      try {
        fsSync.mkdirSync(dir, { recursive: true });
      } catch (error) {
        // Ignore error if directory already exists
        if (error instanceof Error && !error.message.includes("EEXIST")) {
          throw mapNativeError(error, { path: filePath, operation: "createWriteStream" });
        }
      }
    }

    try {
      return fsSync.createWriteStream(resolvedPath, options);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "createWriteStream" });
    }
  }

  /**
   * Check if file/directory exists
   */
  async exists(filePath: string): Promise<boolean> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      await fs.access(resolvedPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolve symbolic links and relative paths
   */
  async realpath(filePath: string): Promise<string> {
    const resolvedPath = this.resolvePath(filePath);

    try {
      const realPath = await fs.realpath(resolvedPath);
      // Convert back to relative path from base path
      const relativePath = path.relative(this.config.basePath, realPath);
      return normalizePath(relativePath);
    } catch (error) {
      throw mapNativeError(error as Error, { path: filePath, operation: "realpath" });
    }
  }

  /**
   * Convert Node.js fs.Stats to FileStats interface
   */
  private convertStats(stats: fsSync.Stats): FileStats {
    return {
      // Type checks
      isFile: () => stats.isFile(),
      isDirectory: () => stats.isDirectory(),
      isBlockDevice: () => stats.isBlockDevice(),
      isCharacterDevice: () => stats.isCharacterDevice(),
      isSymbolicLink: () => stats.isSymbolicLink(),
      isFIFO: () => stats.isFIFO(),
      isSocket: () => stats.isSocket(),

      // Properties
      dev: stats.dev,
      ino: stats.ino,
      mode: stats.mode,
      nlink: stats.nlink,
      uid: stats.uid,
      gid: stats.gid,
      rdev: stats.rdev,
      size: stats.size,
      blksize: stats.blksize,
      blocks: stats.blocks,
      atimeMs: stats.atimeMs,
      mtimeMs: stats.mtimeMs,
      ctimeMs: stats.ctimeMs,
      birthtimeMs: stats.birthtimeMs,
      atime: stats.atime,
      mtime: stats.mtime,
      ctime: stats.ctime,
      birthtime: stats.birthtime,
    };
  }
}
