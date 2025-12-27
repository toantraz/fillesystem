/**
 * S3 Filesystem Example Application - Entry Point
 *
 * This file demonstrates how to:
 * 1. Load S3 configuration from files or environment variables
 * 2. Create and boot an Ignis Application with S3 backend
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
 * S3-specific default configuration for MinIO
 * Uses path-style access (forcePathStyle: true) which is required for MinIO compatibility
 */
const inlineConfig: FilesystemConfig = {
  type: "s3",
  s3: {
    bucket: "test-bucket",
    region: "us-east-1",
    // AWS credentials - accessKeyId and secretAccessKey at the s3 config level
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    // CRITICAL: forcePathStyle must be true for MinIO compatibility
    // MinIO uses path-style URLs (http://localhost:9000/bucket/key)
    // AWS S3 uses virtual-hosted style (http://bucket.s3.amazonaws.com/key)
    forcePathStyle: true,
  },
};

/**
 * Load configuration from file or use inline defaults
 *
 * Configuration loading priority (highest to lowest):
 * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
 * 2. Config file (config/s3.json)
 * 3. Inline defaults (fallback)
 */
async function loadConfiguration(): Promise<FilesystemConfig> {
  const fs = require("fs");

  // Try S3 configuration files first
  const configPaths = [
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
          const config = configData.filesystem || configData;
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
 * Validate S3 credentials from environment variables
 *
 * For MinIO local development, these default to minioadmin/minioadmin
 * For AWS S3, actual AWS credentials are required
 */
function validateS3Credentials(): void {
  // Check if credentials are explicitly set or using defaults
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "minioadmin";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "minioadmin";

  // If using default MinIO credentials, just log a warning
  if (accessKeyId === "minioadmin" && secretAccessKey === "minioadmin") {
    console.log("[INFO] Using default MinIO credentials (minioadmin/minioadmin)");
    console.log("[INFO] For production, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
    return;
  }

  // For non-default credentials, verify both are set
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
    console.error("[ERROR]");
    console.error("[ERROR] Or for local MinIO testing:");
    console.error("[ERROR]   export AWS_ACCESS_KEY_ID=minioadmin");
    console.error("[ERROR]   export AWS_SECRET_ACCESS_KEY=minioadmin");
    throw new Error("Missing AWS credentials for S3. Set environment variables and try again.");
  }

  console.log("[INFO] AWS S3 credentials validated successfully");
}

/**
 * Main entry point
 */
async function main() {
  console.log("=== S3 Filesystem Example Application ===");
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

    // Provide helpful error messages for common S3/MinIO issues
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("ECONNREFUSED")) {
      console.error("[ERROR]");
      console.error("[ERROR] Connection refused. Is MinIO running?");
      console.error("[ERROR] Start MinIO with: cd docker && docker compose up");
    } else if (
      errorMessage.includes("InvalidAccessKeyId") ||
      errorMessage.includes("SignatureDoesNotMatch")
    ) {
      console.error("[ERROR]");
      console.error("[ERROR] Authentication failed. Check your AWS credentials:");
      console.error("[ERROR]   export AWS_ACCESS_KEY_ID=minioadmin");
      console.error("[ERROR]   export AWS_SECRET_ACCESS_KEY=minioadmin");
    } else if (errorMessage.includes("NoSuchBucket")) {
      console.error("[ERROR]");
      console.error("[ERROR] Bucket not found. Initialize the test bucket:");
      console.error("[ERROR]   cd docker && ./init-buckets.sh");
    }

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
