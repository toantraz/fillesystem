/**
 * Ignis Filesystem Example Application
 *
 * This file demonstrates how to:
 * 1. Extend BaseApplication from @venizia/ignis
 * 2. Configure the application with proper configs
 * 3. Register the FilesystemComponent
 * 4. Implement required abstract methods
 *
 * @see https://github.com/VENIZIA-AI/ignis/blob/develop/examples/vert/src/application.ts
 */

import {
  BaseApplication,
  CoreBindings,
  IApplicationConfigs,
  IApplicationInfo,
  ValueOrPromise,
} from "@venizia/ignis";
import {
  FilesystemComponent,
  FilesystemBindingKeys,
  type FilesystemConfig,
  type Filesystem,
} from "@ignis/filesystem";
import path from "node:path";
import packageJson from "./../package.json";

// --------------------------------------------------------------------------------
export const appConfigs: IApplicationConfigs = {
  host: process.env.APP_ENV_SERVER_HOST ?? "localhost",
  port: +(process.env.APP_ENV_SERVER_PORT ?? 3000),
  path: {
    base: process.env.APP_ENV_SERVER_BASE_PATH ?? "/",
    isStrict: true,
  },
  debug: {
    shouldShowRoutes: process.env.NODE_ENV !== "production",
  },
  bootOptions: {},
};

// --------------------------------------------------------------------------------
/**
 * Example Application Class
 *
 * Extends BaseApplication to demonstrate FilesystemComponent integration.
 */
export class Application extends BaseApplication {
  private filesystemConfig: FilesystemConfig;

  constructor(config: FilesystemConfig) {
    super({
      scope: "ExampleApplication",
      config: appConfigs,
    });
    this.filesystemConfig = config;
  }

  // --------------------------------------------------------------------------------
  /**
   * Get the project root directory
   */
  override getProjectRoot(): string {
    const projectRoot = __dirname;
    this.bind({ key: CoreBindings.APPLICATION_PROJECT_ROOT }).toValue(projectRoot);
    return projectRoot;
  }

  // --------------------------------------------------------------------------------
  /**
   * Get application information (package.json)
   */
  override getAppInfo(): ValueOrPromise<IApplicationInfo> {
    return {
      ...(packageJson as any),
      author:
        typeof packageJson.author === "string" ? { name: packageJson.author } : packageJson.author,
    } as IApplicationInfo;
  }

  // --------------------------------------------------------------------------------
  /**
   * Configure static assets
   */
  staticConfigure(): void {
    // No static assets for this example
  }

  // --------------------------------------------------------------------------------
  /**
   * Setup middlewares (CORS, body parsing, etc.)
   */
  override async setupMiddlewares() {
    const server = this.getServer();

    // CORS middleware
    const { cors } = await import("hono/cors");
    server.use(
      "*",
      cors({
        origin: "*",
        allowMethods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        maxAge: 86400,
        credentials: true,
      }),
    );

    this.logger.info("[setupMiddlewares] Middlewares configured successfully");
  }

  // --------------------------------------------------------------------------------
  /**
   * Pre-configure phase: Register components
   */
  override preConfigure(): ValueOrPromise<void> {
    // Bind the filesystem configuration for the FilesystemComponent
    this.bind<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    }).toValue(this.filesystemConfig);

    // Create and bind the filesystem instance directly
    const { createFilesystem } = require("@ignis/filesystem");
    const filesystem = createFilesystem(this.filesystemConfig);
    this.bind({ key: FilesystemBindingKeys.FILESYSTEM_INSTANCE }).toValue(filesystem);

    this.logger.info("[preConfigure] Filesystem initialized and bound successfully");
  }

  // --------------------------------------------------------------------------------
  /**
   * Post-configure phase: Run comprehensive filesystem operations demo
   *
   * This is called after the component has been booted and configured.
   * We can now access the filesystem instance from the DI container and run our demo.
   */
  override async postConfigure(): Promise<void> {
    try {
      this.logger.info("[postConfigure] Running comprehensive filesystem operations demo...");

      // Get the filesystem instance from the DI container
      const filesystem = this.get<Filesystem>({
        key: FilesystemBindingKeys.FILESYSTEM_INSTANCE,
      });

      // Get the comprehensive demo function and run it
      const { runLocalDemo } = await import("./demo.js");
      await runLocalDemo(filesystem, this.logger);

      this.logger.info("[postConfigure] Comprehensive filesystem operations demo completed");
    } catch (error) {
      this.logger.error(`[postConfigure] Error: ${(error as Error).message}`);
      this.logger.error(`[postConfigure] Stack: ${(error as Error).stack}`);

      // Re-throw to stop the application if demo fails
      throw error;
    }
  }
}
