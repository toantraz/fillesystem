/**
 * AWS S3 Adapter
 *
 * Adapter for AWS S3 storage operations using AWS SDK v3.
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable, Writable } from "stream";
import { Readable as NodeReadable } from "stream";

import {
  BaseAdapter,
  ReadStreamOptions,
  WriteStreamOptions,
} from "../interfaces/adapter.interface";
import { FileStats } from "../interfaces/filesystem.interface";
import {
  FilesystemError,
  FileNotFoundError,
  PermissionError,
  StorageError,
  NetworkError,
} from "../errors/filesystem-errors";
import { normalizePath } from "../utils/path-utils";

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
  logger?: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: unknown,
  ) => void;
}

/**
 * S3 filesystem adapter implementation
 */
export class S3Adapter implements BaseAdapter {
  private config: S3AdapterConfig;
  private s3Client: S3Client;
  private logger: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: unknown,
  ) => void;

  constructor(config: S3AdapterConfig) {
    this.config = config;
    this.logger =
      config.logger ||
      ((level, message, metadata) => {
        if (config.debug) {
          console.log(`[${level}] ${message}`, metadata || "");
        }
      });

    // Log initialization
    this.logger("debug", "S3Adapter initialized", {
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint,
      prefix: config.prefix,
    });

    // Create S3 client with timeout and retry configuration
    const clientConfig: Record<string, unknown> = {
      region: this.config.region,
      credentials: this.config.accessKeyId
        ? {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
          }
        : undefined,
      endpoint: this.config.endpoint || undefined,
      forcePathStyle: this.config.forcePathStyle,
    };

    // Add timeout if configured
    if (this.config.timeout) {
      clientConfig.requestHandler = {
        // Note: In a real implementation, we would configure the HTTP client timeout
        // For now, we'll rely on AWS SDK default timeout handling
      };
    }

    // Add maxRetries if configured
    if (this.config.maxRetries !== undefined) {
      clientConfig.maxAttempts = this.config.maxRetries + 1; // AWS SDK uses maxAttempts
    }

    this.s3Client = new S3Client(clientConfig);
  }

  /**
   * Convert file path to S3 key
   */
  private pathToKey(filePath: string): string {
    const normalized = normalizePath(filePath);
    // Remove leading slash if present
    const cleanPath = normalized.startsWith("/") ? normalized.substring(1) : normalized;
    // Add prefix if configured
    if (this.config.prefix) {
      const prefix = this.config.prefix.endsWith("/")
        ? this.config.prefix
        : `${this.config.prefix}/`;
      return `${prefix}${cleanPath}`;
    }
    return cleanPath;
  }

  /**
   * Map S3 error to filesystem error
   */
  private mapS3Error(
    error: unknown,
    context: { path?: string; operation?: string },
  ): FilesystemError {
    // Type guard to check if error is an object with name and message properties
    const getErrorInfo = (err: unknown): { name: string; message: string } => {
      if (err && typeof err === "object") {
        const obj = err as Record<string, unknown>;
        return {
          name: (obj.name as string) || (obj.constructor?.name as string) || "UnknownError",
          message: (obj.message as string) || String(err),
        };
      }
      return { name: "UnknownError", message: String(err) };
    };

    const { name: errorName, message: errorMessage } = getErrorInfo(error);

    // Map common S3 errors
    if (errorName === "NoSuchKey" || errorName === "NotFound") {
      return new FileNotFoundError(context.path || "unknown", { cause: error as Error });
    }

    if (errorName === "AccessDenied" || errorName === "Forbidden") {
      return new PermissionError(context.path || "unknown", context.operation || "operation", {
        cause: error as Error,
      });
    }

    if (errorName === "NoSuchBucket") {
      return new StorageError(`Bucket not found: ${this.config.bucket}`, { cause: error as Error });
    }

    // Network-related errors
    if (
      errorName === "TimeoutError" ||
      errorName === "NetworkError" ||
      errorMessage.includes("network")
    ) {
      return new NetworkError(errorMessage, { cause: error as Error });
    }

    // Default to generic error
    return new FilesystemError(`S3 error: ${errorMessage}`, { cause: error as Error });
  }

  /**
   * Read entire file contents
   */
  async readFile(filePath: string): Promise<Buffer>;
  async readFile(filePath: string, encoding: BufferEncoding): Promise<string>;
  async readFile(filePath: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const key = this.pathToKey(filePath);

    this.logger("debug", "readFile called", { filePath, key, encoding });

    try {
      const startTime = Date.now();
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const duration = Date.now() - startTime;

      if (!response.Body) {
        this.logger("error", "readFile empty response body", { filePath, key });
        throw new FileNotFoundError(filePath, { cause: new Error("Empty response body") });
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as NodeReadable;

      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);

      this.logger("debug", "readFile completed", {
        filePath,
        key,
        duration,
        size: buffer.length,
        contentLength: response.ContentLength,
      });

      if (encoding) {
        return buffer.toString(encoding);
      } else {
        return buffer;
      }
    } catch (error) {
      this.logger("error", "readFile failed", { filePath, key, error });
      throw this.mapS3Error(error, { path: filePath, operation: "readFile" });
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
    const key = this.pathToKey(filePath);

    try {
      const body = typeof data === "string" ? Buffer.from(data, encoding) : data;

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw this.mapS3Error(error, { path: filePath, operation: "writeFile" });
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
    // S3 doesn't support append natively, so we need to read, append, and write
    try {
      // Read existing content
      let existingContent: Buffer;
      try {
        existingContent = (await this.readFile(filePath)) as Buffer;
      } catch (error) {
        // If file doesn't exist, start with empty buffer
        if (error instanceof FileNotFoundError) {
          existingContent = Buffer.alloc(0);
        } else {
          throw error;
        }
      }

      // Convert new data to buffer
      const newData = typeof data === "string" ? Buffer.from(data, encoding) : data;

      // Concatenate buffers
      const combined = Buffer.concat([existingContent, newData]);

      // Write back
      await this.writeFile(filePath, combined);
    } catch (error) {
      if (error instanceof FilesystemError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: filePath, operation: "appendFile" });
    }
  }

  /**
   * Delete a file
   */
  async unlink(filePath: string): Promise<void> {
    const key = this.pathToKey(filePath);

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw this.mapS3Error(error, { path: filePath, operation: "unlink" });
    }
  }

  /**
   * Copy file from source to destination
   */
  async copyFile(src: string, dest: string): Promise<void> {
    const srcKey = this.pathToKey(src);
    const destKey = this.pathToKey(dest);

    try {
      // S3 copy operation
      const command = new CopyObjectCommand({
        Bucket: this.config.bucket,
        Key: destKey,
        CopySource: `${this.config.bucket}/${srcKey}`,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw this.mapS3Error(error, { path: src, operation: "copyFile" });
    }
  }

  /**
   * Rename or move a file
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    // S3 doesn't support rename natively, so copy and delete
    try {
      await this.copyFile(oldPath, newPath);
      await this.unlink(oldPath);
    } catch (error) {
      if (error instanceof FilesystemError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: oldPath, operation: "rename" });
    }
  }

  /**
   * Read directory contents
   */
  async readdir(dirPath: string): Promise<string[]> {
    const prefix = this.pathToKey(dirPath);
    // Ensure prefix ends with slash for directory listing
    // Special case: empty prefix (root directory) should remain empty, not '/'
    const directoryPrefix = prefix === "" ? "" : prefix.endsWith("/") ? prefix : `${prefix}/`;

    this.logger("debug", "readdir called", { dirPath, prefix: directoryPrefix });

    try {
      const startTime = Date.now();
      // Build command params - omit Prefix entirely when listing root directory
      const commandParams: any = {
        Bucket: this.config.bucket,
      };
      // Only add Delimiter if not listing root directory (avoid MinIO path-style issue)
      if (directoryPrefix !== "") {
        commandParams.Delimiter = "/";
        commandParams.Prefix = directoryPrefix;
      }

      const command = new ListObjectsV2Command(commandParams);

      const response = await this.s3Client.send(command);
      const duration = Date.now() - startTime;

      // Combine objects and common prefixes (subdirectories)
      const entries: string[] = [];

      // Add files (objects without trailing slash)
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== directoryPrefix) {
            // Remove the directory prefix and trailing slash if present
            let entryName = object.Key.substring(directoryPrefix.length);
            if (entryName.endsWith("/")) {
              entryName = entryName.slice(0, -1);
            }
            // Only add if not empty (could be the directory marker itself)
            if (entryName) {
              entries.push(entryName);
            }
          }
        }
      }

      // Add subdirectories (common prefixes)
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          if (prefix.Prefix) {
            let entryName = prefix.Prefix.substring(directoryPrefix.length);
            if (entryName.endsWith("/")) {
              entryName = entryName.slice(0, -1);
            }
            if (entryName) {
              entries.push(entryName);
            }
          }
        }
      }

      this.logger("debug", "readdir completed", {
        dirPath,
        duration,
        entryCount: entries.length,
      });

      return entries;
    } catch (error) {
      this.logger("error", "readdir failed", { dirPath, error });
      throw this.mapS3Error(error, { path: dirPath, operation: "readdir" });
    }
  }

  /**
   * Create directory
   */
  async mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    const key = this.pathToKey(dirPath);
    // Ensure directory key ends with slash
    const directoryKey = key.endsWith("/") ? key : `${key}/`;

    this.logger("debug", "mkdir called", {
      dirPath,
      key: directoryKey,
      recursive: options?.recursive,
    });

    // In S3, directories don't really exist - they're just prefixes
    // We can create zero-byte marker objects to represent directories

    try {
      const startTime = Date.now();

      if (options?.recursive) {
        // For recursive creation, we need to create marker objects for all parent directories
        // Split the path into components and create each directory
        const pathComponents = dirPath.split("/").filter(component => component !== "");
        let currentPath = "";

        for (const component of pathComponents) {
          currentPath = currentPath ? `${currentPath}/${component}` : `/${component}`;
          const componentKey = this.pathToKey(currentPath);
          const componentDirectoryKey = componentKey.endsWith("/")
            ? componentKey
            : `${componentKey}/`;

          // Create marker for this directory level
          const command = new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: componentDirectoryKey,
            Body: Buffer.alloc(0),
            ContentLength: 0,
          });

          await this.s3Client.send(command);
        }
      } else {
        // Non-recursive: just create the requested directory
        // Check if parent directory exists (in S3 terms, if there's a marker for it)
        const parentPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
        if (parentPath && parentPath !== "/") {
          const parentKey = this.pathToKey(parentPath);
          const parentDirectoryKey = parentKey.endsWith("/") ? parentKey : `${parentKey}/`;

          // Try to check if parent exists by listing objects with parent prefix
          try {
            const listCommand = new ListObjectsV2Command({
              Bucket: this.config.bucket,
              Prefix: parentDirectoryKey,
              MaxKeys: 1,
            });

            const listResponse = await this.s3Client.send(listCommand);
            if (!listResponse.Contents || listResponse.Contents.length === 0) {
              // Parent doesn't exist (no marker object)
              throw new StorageError(
                `Parent directory ${parentPath} does not exist. Use recursive: true to create parent directories.`,
                { cause: new Error("Parent directory not found") },
              );
            }
          } catch (error) {
            if (error instanceof StorageError) {
              throw error;
            }
            // If listing fails for other reasons, we'll still try to create the directory
          }
        }

        // Create directory marker object
        const command = new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: directoryKey,
          Body: Buffer.alloc(0),
          ContentLength: 0,
        });

        await this.s3Client.send(command);
      }

      const duration = Date.now() - startTime;
      this.logger("debug", "mkdir completed", {
        dirPath,
        duration,
        recursive: options?.recursive || false,
      });
    } catch (error) {
      this.logger("error", "mkdir failed", { dirPath, error });
      if (error instanceof FilesystemError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: dirPath, operation: "mkdir" });
    }
  }

  /**
   * Remove directory
   */
  async rmdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    const prefix = this.pathToKey(dirPath);
    // Ensure prefix ends with slash for directory deletion
    const directoryPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;

    this.logger("debug", "rmdir called", {
      dirPath,
      prefix: directoryPrefix,
      recursive: options?.recursive,
    });

    try {
      const startTime = Date.now();

      if (options?.recursive) {
        // Recursive delete: list and delete all objects with this prefix
        let deleteCount = 0;
        let continuationToken: string | undefined;

        do {
          // List objects with this prefix
          const listCommand = new ListObjectsV2Command({
            Bucket: this.config.bucket,
            Prefix: directoryPrefix,
            ContinuationToken: continuationToken,
          });

          const listResponse = await this.s3Client.send(listCommand);

          if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Delete objects in batches (S3 supports up to 1000 objects per DeleteObjects)
            const deletePromises: Promise<DeleteObjectCommandOutput>[] = [];

            for (const object of listResponse.Contents) {
              if (object.Key) {
                const deleteCommand = new DeleteObjectCommand({
                  Bucket: this.config.bucket,
                  Key: object.Key,
                });
                deletePromises.push(this.s3Client.send(deleteCommand));
                deleteCount++;
              }
            }

            // Wait for all deletions to complete
            await Promise.all(deletePromises);
          }

          continuationToken = listResponse.NextContinuationToken;
        } while (continuationToken);

        const duration = Date.now() - startTime;
        this.logger("debug", "rmdir recursive completed", {
          dirPath,
          duration,
          objectsDeleted: deleteCount,
        });
      } else {
        // Non-recursive delete: only delete if directory is empty
        // Check if directory contains any objects (excluding the directory marker itself)
        const listCommand = new ListObjectsV2Command({
          Bucket: this.config.bucket,
          Prefix: directoryPrefix,
          MaxKeys: 2, // We only need to know if there's more than the marker
        });

        const listResponse = await this.s3Client.send(listCommand);

        // Count objects that are not the directory marker itself
        const nonMarkerObjects =
          listResponse.Contents?.filter(object => object.Key && object.Key !== directoryPrefix) ||
          [];

        if (nonMarkerObjects.length > 0) {
          throw new StorageError(
            `Directory ${dirPath} is not empty. Use recursive: true to delete non-empty directories.`,
            { cause: new Error(`Directory contains ${nonMarkerObjects.length} objects`) },
          );
        }

        // Delete the directory marker
        const deleteCommand = new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: directoryPrefix,
        });

        await this.s3Client.send(deleteCommand);

        const duration = Date.now() - startTime;
        this.logger("debug", "rmdir completed", {
          dirPath,
          duration,
          markerDeleted: true,
        });
      }
    } catch (error) {
      this.logger("error", "rmdir failed", { dirPath, error });
      if (error instanceof FilesystemError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: dirPath, operation: "rmdir" });
    }
  }

  /**
   * Get file/directory statistics
   */
  async stat(filePath: string): Promise<FileStats> {
    const key = this.pathToKey(filePath);

    try {
      // First try to get the object as a file
      try {
        const command = new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        });

        const response = await this.s3Client.send(command);

        // Convert S3 metadata to FileStats for a file
        return this.convertS3MetadataToFileStats(response, false);
      } catch (error: any) {
        // If HeadObject fails with NoSuchKey/NotFound, check if it's a directory
        const errorName = error?.name || error?.constructor?.name;
        if (errorName === "NoSuchKey" || errorName === "NotFound") {
          // Check if this is a directory by looking for directory marker
          const directoryKey = key.endsWith("/") ? key : `${key}/`;

          try {
            const dirCommand = new HeadObjectCommand({
              Bucket: this.config.bucket,
              Key: directoryKey,
            });

            const dirResponse = await this.s3Client.send(dirCommand);

            // It's a directory (directory marker object)
            return this.convertS3MetadataToFileStats(dirResponse, true);
          } catch (dirError: any) {
            // Not a directory either - file doesn't exist
            throw new FileNotFoundError(filePath, { cause: error });
          }
        }
        // Re-throw other errors
        throw error;
      }
    } catch (error) {
      if (error instanceof FilesystemError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: filePath, operation: "stat" });
    }
  }

  /**
   * Convert S3 metadata to FileStats interface
   */
  private convertS3MetadataToFileStats(s3Response: any, isDirectory: boolean): FileStats {
    const lastModified = s3Response.LastModified || new Date(0);
    const contentLength = s3Response.ContentLength || 0;

    return {
      // Type checks
      isFile: () => !isDirectory,
      isDirectory: () => isDirectory,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false,

      // Properties
      dev: 0,
      ino: 0,
      mode: isDirectory ? 0o755 : 0o644, // Default permissions
      nlink: 1,
      uid: 0,
      gid: 0,
      rdev: 0,
      size: isDirectory ? 0 : contentLength,
      blksize: 4096,
      blocks: isDirectory ? 0 : Math.ceil(contentLength / 4096),
      atimeMs: lastModified.getTime(),
      mtimeMs: lastModified.getTime(),
      ctimeMs: lastModified.getTime(),
      birthtimeMs: 0,
      atime: lastModified,
      mtime: lastModified,
      ctime: lastModified,
      birthtime: new Date(0),
    };
  }

  /**
   * Get symbolic link statistics
   */
  async lstat(filePath: string): Promise<FileStats> {
    // S3 doesn't support symbolic links, so same as stat
    return this.stat(filePath);
  }

  /**
   * Check file accessibility
   */
  async access(filePath: string, _mode?: number): Promise<void> {
    // Try to get file stats - if it succeeds, file is accessible
    try {
      await this.stat(filePath);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        throw error;
      }
      throw this.mapS3Error(error, { path: filePath, operation: "access" });
    }
  }

  /**
   * Create readable stream for file
   */
  createReadStream(filePath: string, options?: ReadStreamOptions): Readable {
    const key = this.pathToKey(filePath);

    this.logger("debug", "createReadStream called", { filePath, key, options });

    try {
      // Create a custom readable stream that fetches from S3
      const readable = new Readable({
        read() {
          // This will be called when the stream wants data
          // We'll handle the actual S3 fetching in the implementation
        },
      });

      // We need to fetch the S3 object asynchronously
      // For simplicity, we'll use the existing readFile method and pipe it
      // In a production implementation, we would use GetObjectCommand with streaming
      this.readFile(filePath)
        .then(data => {
          if (Buffer.isBuffer(data)) {
            readable.push(data);
          } else {
            readable.push(Buffer.from(data, options?.encoding || "utf8"));
          }
          readable.push(null); // End of stream
        })
        .catch(error => {
          readable.destroy(error);
        });

      return readable;
    } catch (error) {
      this.logger("error", "createReadStream failed", { filePath, key, error });
      throw this.mapS3Error(error, { path: filePath, operation: "createReadStream" });
    }
  }

  /**
   * Create writable stream for file
   */
  createWriteStream(filePath: string, options?: WriteStreamOptions): Writable {
    const key = this.pathToKey(filePath);

    this.logger("debug", "createWriteStream called", { filePath, key, options });

    // For S3, we need to collect all chunks and upload at once
    // In a production implementation, we would use multipart upload for large files
    const chunks: Buffer[] = [];

    const writable = new Writable({
      write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        callback();
      },

      final(callback: (error?: Error | null) => void) {
        // When stream ends, upload all collected data to S3
        const combined = Buffer.concat(chunks);
        const adapter = (this as { _adapter?: S3Adapter })._adapter as S3Adapter;

        adapter
          .writeFile(filePath, combined, options?.encoding)
          .then(() => callback())
          .catch(callback);
      },
    });

    // Store adapter reference for use in final()
    (writable as { _adapter?: S3Adapter })._adapter = this;

    return writable;
  }

  /**
   * Check if file/directory exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await this.stat(filePath);
      return true;
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Resolve symbolic links and relative paths
   */
  async realpath(filePath: string): Promise<string> {
    // S3 doesn't support symbolic links, so just normalize the path
    return normalizePath(filePath);
  }
}
