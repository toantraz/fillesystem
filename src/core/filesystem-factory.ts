/**
 * Filesystem Factory
 *
 * Factory function to create filesystem instances based on configuration.
 */

import { Filesystem } from "../interfaces/filesystem.interface";
import { BaseAdapter } from "../interfaces/adapter.interface";
import { FilesystemConfig, ValidatedFilesystemConfig, validateConfig } from "../types/config";
import { ValidationError } from "../errors/filesystem-errors";
import { LocalAdapter, LocalAdapterConfig } from "../adapters/local-adapter";
import { S3Adapter, S3AdapterConfig } from "../adapters/s3-adapter";

/**
 * Filesystem factory implementation
 */
export class FilesystemFactory {
  /**
   * Create a filesystem instance based on configuration
   */
  static create(config: FilesystemConfig): Filesystem {
    // Validate configuration
    const validationResult = validateConfig(config);
    if (!validationResult.isValid) {
      throw new ValidationError(
        `Invalid filesystem configuration: ${validationResult.errors.join(", ")}`,
      );
    }

    // Get validated config
    const validatedConfig = validationResult.config!;

    // Create appropriate adapter based on type
    let adapter: BaseAdapter;

    try {
      if (validatedConfig.type === "local") {
        adapter = FilesystemFactory.createLocalAdapter(validatedConfig);
      } else {
        // type is 's3'
        adapter = FilesystemFactory.createS3Adapter(validatedConfig);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to create ${validatedConfig.type} adapter: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error instanceof Error ? error : undefined },
      );
    }

    // Create filesystem wrapper around adapter
    return FilesystemFactory.createFilesystemWrapper(adapter);
  }

  /**
   * Create local filesystem adapter
   */
  private static createLocalAdapter(config: ValidatedFilesystemConfig): BaseAdapter {
    const adapterConfig: LocalAdapterConfig = {
      basePath: config.local.basePath,
      createMissingDirs: config.local.createMissingDirs,
      timeout: config.common.timeout,
      maxRetries: config.common.maxRetries,
      debug: config.common.debug,
      logger: config.common.logger,
    };

    return new LocalAdapter(adapterConfig);
  }

  /**
   * Create S3 adapter
   */
  private static createS3Adapter(config: ValidatedFilesystemConfig): BaseAdapter {
    const adapterConfig: S3AdapterConfig = {
      bucket: config.s3!.bucket,
      region: config.s3!.region,
      accessKeyId: config.s3!.accessKeyId,
      secretAccessKey: config.s3!.secretAccessKey,
      endpoint: config.s3!.endpoint,
      forcePathStyle: config.s3!.forcePathStyle,
      prefix: config.s3!.prefix,
      timeout: config.s3!.timeout,
      maxRetries: config.s3!.maxRetries,
      debug: config.common.debug,
      logger: config.common.logger,
    };

    return new S3Adapter(adapterConfig);
  }

  /**
   * Create filesystem wrapper around adapter
   */
  private static createFilesystemWrapper(adapter: BaseAdapter): Filesystem {
    // The adapter already implements the Filesystem interface,
    // but we wrap it to add additional functionality if needed
    return {
      // File operations
      readFile: adapter.readFile.bind(adapter),
      writeFile: adapter.writeFile.bind(adapter),
      appendFile: adapter.appendFile.bind(adapter),
      unlink: adapter.unlink.bind(adapter),
      copyFile: adapter.copyFile.bind(adapter),
      rename: adapter.rename.bind(adapter),

      // Directory operations
      readdir: adapter.readdir.bind(adapter),
      mkdir: adapter.mkdir.bind(adapter),
      rmdir: adapter.rmdir.bind(adapter),

      // File info operations
      stat: adapter.stat.bind(adapter),
      lstat: adapter.lstat.bind(adapter),
      access: adapter.access.bind(adapter),

      // Stream operations
      createReadStream: adapter.createReadStream.bind(adapter),
      createWriteStream: adapter.createWriteStream.bind(adapter),

      // Utility methods
      exists: adapter.exists.bind(adapter),
      realpath: adapter.realpath.bind(adapter),
    };
  }
}

/**
 * Factory function to create filesystem instance
 *
 * This is the main export that users will call.
 */
export function createFilesystem(config: FilesystemConfig): Filesystem {
  return FilesystemFactory.create(config);
}

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
export function createFilesystemFromEnv(): Filesystem {
  // Simple environment variable parsing
  const type = process.env.FILESYSTEM_TYPE as "local" | "s3";

  if (!type || (type !== "local" && type !== "s3")) {
    throw new ValidationError(
      "Cannot create filesystem from environment variables. " +
        'Set FILESYSTEM_TYPE to "local" or "s3" and provide required configuration.',
    );
  }

  const config: FilesystemConfig = {
    type,
    common: {
      timeout: process.env.FILESYSTEM_TIMEOUT
        ? parseInt(process.env.FILESYSTEM_TIMEOUT)
        : undefined,
      maxRetries: process.env.FILESYSTEM_MAX_RETRIES
        ? parseInt(process.env.FILESYSTEM_MAX_RETRIES)
        : undefined,
      debug: process.env.FILESYSTEM_DEBUG === "true",
    },
  };

  if (type === "local") {
    config.local = {
      basePath: process.env.FILESYSTEM_LOCAL_BASE_PATH,
      createMissingDirs: process.env.FILESYSTEM_LOCAL_CREATE_MISSING_DIRS === "true",
    };
  } else {
    config.s3 = {
      bucket: process.env.FILESYSTEM_S3_BUCKET || "",
      region: process.env.FILESYSTEM_S3_REGION || "",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.FILESYSTEM_S3_ENDPOINT,
      forcePathStyle: process.env.FILESYSTEM_S3_FORCE_PATH_STYLE === "true",
      prefix: process.env.FILESYSTEM_S3_PREFIX,
    };
  }

  return FilesystemFactory.create(config);
}
