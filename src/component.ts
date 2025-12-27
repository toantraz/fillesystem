/**
 * Ignis Filesystem Component
 *
 * A component for @venizia/ignis framework that provides transparent file
 * operations across local and S3 storage backends.
 *
 * @example
 * ```typescript
 * import { BaseApplication } from '@venizia/ignis';
 * import { FilesystemComponent } from '@ignis/filesystem';
 *
 * class MyApp extends BaseApplication {
 *   constructor() {
 *     super();
 *   }
 *
 *   preConfigure() {
 *     // Register FilesystemComponent with configuration
 *     this.component(FilesystemComponent, {
 *       config: { type: 'local', local: { basePath: './storage' } }
 *     });
 *   }
 * }
 * ```
 */

import { BaseApplication } from '@venizia/ignis';
import { BaseComponent } from '@venizia/ignis';
import { inject } from '@venizia/ignis';
import { CoreBindings } from '@venizia/ignis';
import { Binding } from '@venizia/ignis';
import { createFilesystem } from './core/filesystem-factory';
import type { FilesystemConfig } from './types/config';
import { FilesystemBindingKeys } from './common/keys';
import type { IFilesystemComponentOptions } from './common/types';
import { validateConfig } from './types/config';
import type { ValueOrPromise } from '@venizia/ignis';

/**
 * Default filesystem configuration
 */
const DEFAULT_FILESYSTEM_CONFIG: FilesystemConfig = {
  type: 'local',
  local: {
    basePath: process.cwd(),
    createMissingDirs: false,
  },
  common: {},
};

/**
 * Filesystem Component for @venizia/ignis
 *
 * Extends the Ignis BaseComponent to provide filesystem operations
 * across multiple storage backends (local, S3).
 *
 * The component binds a Filesystem service to the Ignis DI container,
 * making it available for injection in other components and services.
 */
export class FilesystemComponent extends BaseComponent<IFilesystemComponentOptions> {
  private application: BaseApplication;
  private filesystem?: any; // Store filesystem instance for direct access

  constructor(
    @inject({ key: CoreBindings.APPLICATION_INSTANCE })
    application: BaseApplication,
  ) {
    super({
      scope: FilesystemComponent.name,
    });
    this.application = application;
  }

  /**
   * Get the filesystem instance directly from the component
   *
   * @returns The Filesystem instance
   */
  getFilesystem(): any {
    return this.filesystem;
  }

  /**
   * Component binding phase
   *
   * This is called by Ignis during the binding phase.
   * We initialize the filesystem and bind it to the DI container here.
   */
  override binding(): ValueOrPromise<void> {
    this.defineFilesystem();
  }

  /**
   * Define and bind the filesystem service
   *
   * Gets the configuration from bindings, validates it,
   * creates the filesystem instance, and binds it to the DI container.
   */
  private defineFilesystem(): void {
    // Get the filesystem configuration from bindings
    const config = this.application.get<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    });

    if (!config) {
      throw new Error(
        '[FilesystemComponent] Failed to get filesystem configuration from bindings',
      );
    }

    // Validate configuration
    const validationResult = validateConfig(config);
    if (!validationResult.isValid) {
      throw new Error(
        `[FilesystemComponent] Configuration validation failed: ${validationResult.errors?.join(', ')}`,
      );
    }

    // Create filesystem instance
    const filesystem = createFilesystem(config);
    this.filesystem = filesystem; // Store for direct access via getFilesystem()

    // Bind the filesystem instance for injection in services
    // Using a generic key that services can inject
    this.application
      .bind({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE })
      .toValue(filesystem);

    this.logger?.info('[FilesystemComponent] Filesystem component initialized', {
      adapterType: config.type,
    });
  }
}

/**
 * Default export
 */
export default FilesystemComponent;
