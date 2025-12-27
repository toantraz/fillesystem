/**
 * Ignis Filesystem Example Application - Entry Point
 *
 * This file demonstrates how to:
 * 1. Load configuration from files or use inline defaults
 * 2. Create and boot an Ignis Application
 * 3. Handle graceful shutdown
 *
 * @see https://www.npmjs.com/package/@venizia/ignis
 */

import { Application } from "./app";
import type { FilesystemConfig } from "@ignis/filesystem";
import path from "node:path";

// ============================================================================
// IGNIS CONCEPT: Application Boot Pattern
// ============================================================================
// The Ignis framework follows a specific boot sequence:
// 1. Create Application instance with config
// 2. Call app.init() - Initialize the application
// 3. Call app.boot() - Boot all components and run postConfigure
// 4. Call app.start() - Start the HTTP server
// 5. Call app.stop() - Gracefully shutdown
// ============================================================================

/**
 * Inline default configuration
 */
const inlineConfig: FilesystemConfig = {
  type: "local",
  local: {
    basePath: path.join(__dirname, "../storage"),
    createMissingDirs: true,
  },
};

/**
 * Load configuration from file or use inline defaults
 */
async function loadConfiguration(): Promise<FilesystemConfig> {
  const fs = require("fs");

  // Try local configuration files first
  const configPaths = [
    path.join(__dirname, "../config/local.yaml"),
    path.join(__dirname, "../config/local.json"),
    path.join(__dirname, "../config/s3.yaml"),
    path.join(__dirname, "../config/s3.json"),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const ext = path.extname(configPath);
        if (ext === ".json") {
          const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
          console.log(`[INFO] Configuration loaded from: ${configPath}`);
          const config = configData.filesystem;
          if (config.type === "s3") {
            validateS3Credentials();
          }
          return config;
        } else if (ext === ".yaml" || ext === ".yml") {
          console.log(`[WARN] YAML support requires js-yaml package. Using inline config.`);
          break;
        }
      }
    } catch (error) {
      console.log(`[WARN] Failed to load config from ${configPath}: ${(error as Error).message}`);
    }
  }

  console.log("[WARN] Configuration file not found. Using inline default configuration.");
  return inlineConfig;
}

/**
 * Validate S3 credentials
 */
function validateS3Credentials(): void {
  const requiredVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error("[ERROR] Missing required AWS environment variables for S3:");
    missing.forEach(varName => console.error(`[ERROR]   - ${varName}`));
    console.error("[ERROR]");
    console.error("[ERROR] Please set these environment variables before running:");
    console.error("[ERROR]   export AWS_ACCESS_KEY_ID=your_access_key");
    console.error("[ERROR]   export AWS_SECRET_ACCESS_KEY=your_secret_key");
    console.error("[ERROR]   export AWS_REGION=us-east-1");
    throw new Error("Missing AWS credentials for S3. Set environment variables and try again.");
  }

  console.log("[INFO] AWS S3 credentials validated successfully");
}

/**
 * Main entry point
 */
async function main() {
  console.log("=== Ignis Filesystem Example Application ===");
  console.log();

  try {
    // Load configuration
    const config = await loadConfiguration();
    console.log(`[INFO] Configuration loaded:`, JSON.stringify(config, null, 2));
    console.log();

    // Create the application instance
    const application = new Application(config);

    // ============================================================================
    // IGNIS CONCEPT: Application Boot Sequence
    // ============================================================================
    // 1. init() - Initialize the application and bindings
    // 2. boot() - Boot all components and run postConfigure
    // 3. start() - Start the HTTP server (optional for this demo)
    // ============================================================================

    // Initialize the application
    console.log("[INFO] Initializing application...");
    application.init();
    console.log("[INFO] Application initialized successfully");
    console.log();

    // Manually call preConfigure to register components
    console.log("[INFO] Running preConfigure manually...");
    await (application as any).preConfigure();
    console.log();

    // Boot the application (runs component boot, postConfigure)
    console.log("[INFO] Booting application...");
    const bootReport = await application.boot();
    console.log("[INFO] Application booted successfully");
    console.log("[INFO] Boot report:", JSON.stringify(bootReport, null, 2));
    console.log();

    // Manually call postConfigure
    console.log("[INFO] Running postConfigure manually...");
    await (application as any).postConfigure();
    console.log();

    // ============================================================================
    // NOTE: Starting the HTTP server
    // ============================================================================
    // For this demo, we don't start the HTTP server since we're just
    // demonstrating the filesystem operations in postConfigure.
    //
    // To start the HTTP server, you would call:
    //   await application.start();
    // ============================================================================

    console.log("[INFO] Demo complete");
    console.log("[INFO] Press Ctrl+C to exit");
  } catch (error) {
    console.error("[ERROR] Application failed:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string) {
  console.log();
  console.log(`[INFO] Received ${signal}, shutting down gracefully...`);
  console.log("[INFO] Application stopped successfully");
  process.exit(0);
}

// Register shutdown handlers
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", error => {
  console.error("[ERROR] Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[ERROR] Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the application
main().catch(error => {
  console.error("[ERROR] Fatal error:", error);
  process.exit(1);
});
