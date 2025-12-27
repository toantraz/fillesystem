/**
 * S3 Filesystem Example Application
 *
 * This file demonstrates how to:
 * 1. Extend BaseApplication from @venizia/ignis
 * 2. Configure the application with S3 filesystem config
 * 3. Register the FilesystemComponent
 * 4. Implement required abstract methods
 *
 * @see https://github.com/VENIZIA-AI/ignis/blob/develop/examples/vert/src/application.ts
 */

import {
  BaseApplication,
  BindingKeys,
  BindingNamespaces,
  CoreBindings,
  IApplicationConfigs,
  IApplicationInfo,
  ValueOrPromise,
} from "@venizia/ignis";
import { FilesystemComponent, type FilesystemConfig, type Filesystem } from "@ignis/filesystem";
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
 * S3 Example Application Class
 *
 * Extends BaseApplication to demonstrate FilesystemComponent integration
 * with S3 backend (MinIO or AWS S3).
 */
export class Application extends BaseApplication {
  private filesystemConfig: FilesystemConfig;

  constructor(config: FilesystemConfig) {
    super({
      scope: "S3ExampleApplication",
      config: appConfigs,
    });
    this.filesystemConfig = config;
  }

  // --------------------------------------------------------------------------------
  /**
   * Get the project root directory
   */
  override getProjectRoot(): string {
    console.log("[DEBUG] getProjectRoot called");
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
   *
   * This is where we register the FilesystemComponent with our S3 configuration.
   * The component will be initialized during the boot phase.
   */
  override preConfigure(): ValueOrPromise<void> {
    console.log("[DEBUG] preConfigure called");
    // Register the FilesystemComponent with configuration
    // Type cast is needed because FilesystemComponent is compiled separately
    // and the types don't exactly match due to protected member handling across compilation boundaries
    (this.component as any)(FilesystemComponent, {
      enable: true, // Component has initDefault: { enable: false } so we must explicitly enable it
      config: { config: this.filesystemConfig },
    });

    this.logger.info("[preConfigure] FilesystemComponent registered successfully");
  }

  // --------------------------------------------------------------------------------
  /**
   * Post-configure phase: Run filesystem operations demo
   *
   * This is called after the component has been booted and configured.
   * We can now access the filesystem instance and run our demo.
   */
  override async postConfigure(): Promise<void> {
    console.log("[DEBUG] postConfigure called");
    try {
      this.logger.info("[postConfigure] Running S3 filesystem operations demo...");

      // Get the filesystem component and manually configure it
      // The component registration happens in preConfigure but we need to ensure
      // the component's configure() method is called with our config
      const component = this.get({
        key: BindingKeys.build({
          namespace: BindingNamespaces.COMPONENT,
          key: FilesystemComponent.name,
        }),
      }) as FilesystemComponent;
      await component.configure({ config: this.filesystemConfig });

      // Now getFilesystem() should return the initialized filesystem
      const filesystem = component.getFilesystem() as Filesystem;

      // Get the demo function and run it
      const { runS3Demo } = await import("./demo.js");
      await runS3Demo(filesystem, this.logger);

      this.logger.info("[postConfigure] S3 filesystem operations demo completed");
    } catch (error) {
      this.logger.error(`[postConfigure] Error: ${(error as Error).message}`);
      this.logger.error(`[postConfigure] Stack: ${(error as Error).stack}`);

      // Re-throw to stop the application if demo fails
      throw error;
    }
  }
}
