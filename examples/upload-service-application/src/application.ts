/**
 * Upload Service Application
 *
 * Ignis application class demonstrating FilesystemComponent integration
 * with proper controller/service patterns for file upload REST API.
 *
 * Features:
 * - Single and multiple file upload endpoints
 * - Server-side progress tracking
 * - Web interface for browser uploads
 * - Proper error handling and logging
 *
 * @see https://github.com/VENIZIA-AI/ignis
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
} from "@ignis/filesystem";
import type { TUploadConfiguration } from "./types/upload.types";
import { DEFAULT_UPLOAD_CONFIG } from "./types/upload.types";
import path from "node:path";
import packageJson from "./../package.json";

// --------------------------------------------------------------------------------
/** Application configuration */
export const appConfigs: IApplicationConfigs = {
  host: process.env.APP_ENV_SERVER_HOST ?? "localhost",
  port: +(process.env.APP_ENV_SERVER_PORT ?? 3000),
  path: {
    base: process.env.APP_ENV_SERVER_BASE_PATH ?? "/api",
    isStrict: true,
  },
  debug: {
    shouldShowRoutes: process.env.NODE_ENV !== "production",
  },
  bootOptions: {},
};

// --------------------------------------------------------------------------------
/**
 * Upload Service Application Class
 *
 * Extends BaseApplication to provide file upload REST API.
 * Demonstrates proper Ignis patterns:
 * - Component registration with this.component()
 * - Service binding with this.service()
 * - Controller registration with this.controller()
 * - Static file serving via setupMiddlewares()
 */
export class Application extends BaseApplication {
  private filesystemConfig: FilesystemConfig;
  private uploadConfig: TUploadConfiguration;

  constructor(filesystemConfig: FilesystemConfig, uploadConfig?: Partial<TUploadConfiguration>) {
    super({
      scope: "UploadServiceApplication",
      config: appConfigs,
    });
    this.filesystemConfig = filesystemConfig;
    this.uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...uploadConfig };
  }

  // --------------------------------------------------------------------------------
  /**
   * Get the project root directory
   */
  override getProjectRoot(): string {
    const projectRoot = path.dirname(__dirname);
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
    // Static assets configured in setupMiddlewares
  }

  // --------------------------------------------------------------------------------
  /**
   * Setup middlewares (CORS, static serving, etc.)
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

    // Static file serving for web interface
    const publicDir = path.join(this.getProjectRoot(), "public");

    // Serve static files from /static/* route using manual implementation
    server.get("/static/*", async (c) => {
      const { readFile } = await import("node:fs/promises");
      const filePath = c.req.path.slice("/static".length) || "/index.html";
      const fullPath = path.join(publicDir, filePath);

      try {
        const content = await readFile(fullPath);
        const ext = path.extname(fullPath);
        const contentType = getContentType(ext);
        return c.body(content, 200, {
          "Content-Type": contentType,
        });
      } catch {
        return c.html("Not Found", 404);
      }
    });

    // Serve index.html at root path
    server.get("/", async (c) => {
      const { readFile } = await import("node:fs/promises");
      const fullPath = path.join(publicDir, "index.html");
      try {
        const content = await readFile(fullPath);
        return c.html(content.toString());
      } catch {
        return c.html("Not Found", 404);
      }
    });

    this.logger.info("[Application][setupMiddlewares] Middlewares configured successfully");
  }

  // --------------------------------------------------------------------------------
  /**
   * Pre-configure phase: Register components, services, and controllers
   *
   * This is the main hook for registering all application resources.
   * Follows the Ignis pattern:
   * 1. Bind component configurations
   * 2. Register components (FilesystemComponent)
   * 3. Bind service configurations
   * 4. Register services (UploadSessionService, UploadService)
   * 5. Register controllers (UploadController)
   */
  override preConfigure(): ValueOrPromise<void> {
    // Bind the filesystem configuration for the FilesystemComponent
    this.bind<FilesystemConfig>({
      key: FilesystemBindingKeys.FILESYSTEM_CONFIG,
    }).toValue(this.filesystemConfig);

    // Register the FilesystemComponent
    this.component(FilesystemComponent as any);

    // Bind upload configuration for injection
    this.bind<TUploadConfiguration>({ key: "upload.configuration" }).toValue(this.uploadConfig);

    // Import and register services and controllers
    // Import here to avoid circular dependency issues
    const { UploadSessionService } = require("./services/upload-session.service");
    const { UploadService } = require("./services/upload-service.service");
    const { UploadController } = require("./controllers/upload.controller");

    // Register UploadSessionService as a service
    this.service(UploadSessionService);

    // Register UploadService (will have filesystem injected via @inject)
    this.service(UploadService);

    // Register UploadController (will have services injected via @inject)
    this.controller(UploadController);

    this.logger.info("[Application][preConfigure] All resources registered successfully");
  }

  // --------------------------------------------------------------------------------
  /**
   * Post-configure phase: Additional setup after all resources are configured
   */
  override postConfigure(): ValueOrPromise<void> {
    this.logger.info("[Application][postConfigure] Upload service application ready");
  }
}

// --------------------------------------------------------------------------------
/** Helper function to get content type by file extension */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
  };
  return contentTypes[ext] || "application/octet-stream";
}
