/**
 * Filesystem Component Constants
 *
 * Defines all constants used by the FilesystemComponent.
 */

export class FilesystemConstants {
  // Default binding keys for convenience
  static readonly DEFAULT_INSTANCE_KEY = '@services/filesystem/instance';

  // Health status values
  static readonly HEALTH_STATUS_HEALTHY = 'healthy' as const;
  static readonly HEALTH_STATUS_UNHEALTHY = 'unhealthy' as const;
  static readonly HEALTH_STATUS_UNKNOWN = 'unknown' as const;
}
