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
export const DEFAULT_LOCAL_CONFIG: Required<LocalConfig> = {
  basePath: process.cwd(),
  createMissingDirs: false,
};

/**
 * Default common configuration values
 */
export const DEFAULT_COMMON_CONFIG: Required<CommonConfig> = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  debug: false,
  logger: () => {}, // No-op logger by default
};

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
export function validateConfig(config: FilesystemConfig): ConfigValidationResult {
  const errors: string[] = [];

  // Validate type
  if (!config.type) {
    errors.push('Configuration must specify a type ("local" or "s3")');
  } else if (config.type !== "local" && config.type !== "s3") {
    errors.push(`Invalid type: "${config.type}". Must be "local" or "s3"`);
  }

  // Validate type-specific configuration
  if (config.type === "local") {
    if (!config.local) {
      errors.push('Local configuration required when type is "local"');
    } else {
      // Validate local config
      if (config.local.basePath && typeof config.local.basePath !== "string") {
        errors.push("Local basePath must be a string");
      }
      if (config.local.createMissingDirs && typeof config.local.createMissingDirs !== "boolean") {
        errors.push("Local createMissingDirs must be a boolean");
      }
    }
  } else if (config.type === "s3") {
    if (!config.s3) {
      errors.push('S3 configuration required when type is "s3"');
    } else {
      // Validate S3 config
      if (!config.s3.bucket || typeof config.s3.bucket !== "string") {
        errors.push("S3 bucket is required and must be a string");
      }
      if (!config.s3.region || typeof config.s3.region !== "string") {
        errors.push("S3 region is required and must be a string");
      }
      if (config.s3.accessKeyId && typeof config.s3.accessKeyId !== "string") {
        errors.push("S3 accessKeyId must be a string if provided");
      }
      if (config.s3.secretAccessKey && typeof config.s3.secretAccessKey !== "string") {
        errors.push("S3 secretAccessKey must be a string if provided");
      }
      if (config.s3.endpoint && typeof config.s3.endpoint !== "string") {
        errors.push("S3 endpoint must be a string if provided");
      }
      if (config.s3.forcePathStyle && typeof config.s3.forcePathStyle !== "boolean") {
        errors.push("S3 forcePathStyle must be a boolean if provided");
      }
      if (config.s3.prefix && typeof config.s3.prefix !== "string") {
        errors.push("S3 prefix must be a string if provided");
      }
      if (config.s3.timeout && (typeof config.s3.timeout !== "number" || config.s3.timeout <= 0)) {
        errors.push("S3 timeout must be a positive number if provided");
      }
      if (
        config.s3.maxRetries &&
        (typeof config.s3.maxRetries !== "number" || config.s3.maxRetries < 0)
      ) {
        errors.push("S3 maxRetries must be a non-negative number if provided");
      }
    }
  }

  // Validate common config if provided
  if (config.common) {
    if (
      config.common.timeout &&
      (typeof config.common.timeout !== "number" || config.common.timeout <= 0)
    ) {
      errors.push("Common timeout must be a positive number if provided");
    }
    if (
      config.common.maxRetries &&
      (typeof config.common.maxRetries !== "number" || config.common.maxRetries < 0)
    ) {
      errors.push("Common maxRetries must be a non-negative number if provided");
    }
    if (config.common.debug && typeof config.common.debug !== "boolean") {
      errors.push("Common debug must be a boolean if provided");
    }
    if (config.common.logger && typeof config.common.logger !== "function") {
      errors.push("Common logger must be a function if provided");
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Create validated config with defaults
  let validatedConfig: ValidatedFilesystemConfig;

  // Merge common config with defaults
  const commonConfig: Required<CommonConfig> = {
    timeout: config.common?.timeout ?? DEFAULT_COMMON_CONFIG.timeout,
    maxRetries: config.common?.maxRetries ?? DEFAULT_COMMON_CONFIG.maxRetries,
    debug: config.common?.debug ?? DEFAULT_COMMON_CONFIG.debug,
    logger: config.common?.logger ?? DEFAULT_COMMON_CONFIG.logger,
  };

  if (config.type === "local") {
    validatedConfig = {
      type: "local",
      local: {
        basePath: config.local?.basePath || DEFAULT_LOCAL_CONFIG.basePath,
        createMissingDirs:
          config.local?.createMissingDirs || DEFAULT_LOCAL_CONFIG.createMissingDirs,
      },
      common: commonConfig,
    };
  } else {
    // S3 config - merge S3-specific timeout/retries with common defaults
    const s3Timeout = config.s3?.timeout ?? commonConfig.timeout;
    const s3MaxRetries = config.s3?.maxRetries ?? commonConfig.maxRetries;

    validatedConfig = {
      type: "s3",
      local: DEFAULT_LOCAL_CONFIG, // Include local defaults for consistency
      s3: {
        bucket: config.s3!.bucket,
        region: config.s3!.region,
        accessKeyId: config.s3!.accessKeyId || "",
        secretAccessKey: config.s3!.secretAccessKey || "",
        endpoint: config.s3!.endpoint || "",
        forcePathStyle: config.s3!.forcePathStyle || false,
        prefix: config.s3!.prefix || "",
        timeout: s3Timeout,
        maxRetries: s3MaxRetries,
      },
      common: commonConfig,
    };
  }

  return { isValid: true, errors: [], config: validatedConfig };
}
