/**
 * Filesystem Component Types
 *
 * Defines all interfaces and types used by the FilesystemComponent.
 */

import type { FilesystemConfig } from '../types/config';

/**
 * Filesystem component configuration options
 */
export interface IFilesystemComponentOptions {
  /** Filesystem configuration */
  config: FilesystemConfig;
}

/**
 * Filesystem component state
 */
export interface IFilesystemComponentState {
  /** Whether component is initialized */
  initialized: boolean;

  /** Current configuration */
  config: FilesystemConfig;

  /** Active adapter type */
  adapterType: string;

  /** Health status */
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';

  /** Last error */
  lastError?: Error;
}
