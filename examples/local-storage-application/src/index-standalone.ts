/**
 * Ignis Filesystem Example Application - Standalone Version
 *
 * This is a simplified standalone example that demonstrates the Filesystem
 * library directly without requiring the Ignis framework.
 *
 * This example shows:
 * 1. How to use createFilesystem factory
 * 2. How to use the filesystem for operations
 *
 * @see https://www.npmjs.com/package/@venizia/ignis
 */

import { createFilesystem, type Filesystem, type FilesystemConfig } from "@ignis/filesystem";

// ============================================================================
// INLINE CONFIGURATION
// ============================================================================
const inlineConfig: FilesystemConfig = {
  type: "local",
  local: {
    basePath: "./storage",
    createMissingDirs: true,
  },
};

/**
 * Load configuration from file or use inline defaults
 */
async function loadConfiguration(): Promise<FilesystemConfig> {
  const fs = require("fs");
  const path = require("path");

  // Try local configuration files first
  const configPaths = [
    path.join(__dirname, "../config/local.json"),
    path.join(__dirname, "../config/s3.json"),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        console.log(`[INFO] Configuration loaded from: ${configPath}`);
        return configData.filesystem;
      }
    } catch (error) {
      console.log(`[WARN] Failed to load config from ${configPath}: ${(error as Error).message}`);
    }
  }

  console.log("[WARN] Configuration file not found. Using inline default configuration.");
  return inlineConfig;
}

/**
 * Main entry point
 */
async function main() {
  console.log("=== Ignis Filesystem Example Application (Standalone) ===");
  console.log();

  try {
    // Load configuration
    const config = await loadConfiguration();
    console.log(`[INFO] Configuration loaded:`, JSON.stringify(config, null, 2));
    console.log();

    // Create the filesystem instance
    console.log("[INFO] Creating filesystem instance...");
    const filesystem: Filesystem = createFilesystem(config);
    console.log("[INFO] Filesystem created successfully");
    console.log();

    // ============================================================================
    // DEMONSTRATION: Core Filesystem Operations
    // ============================================================================
    console.log("=== Running Filesystem Operations Demo ===");
    console.log();

    const testFilePath = "/test-file.txt";
    const testContent = "Hello from Ignis Filesystem!";

    // 1. Write a file
    console.log(`[DEMO] Writing file: ${testFilePath}`);
    await filesystem.writeFile(testFilePath, testContent, "utf8");
    console.log("[DEMO] ✓ File written successfully");
    console.log();

    // 2. Read the file back
    console.log(`[DEMO] Reading file: ${testFilePath}`);
    const content = await filesystem.readFile(testFilePath, "utf8");
    console.log(`[DEMO] ✓ File content: "${content}"`);
    console.log();

    // 3. Check if file exists
    console.log(`[DEMO] Checking if file exists: ${testFilePath}`);
    const exists = await filesystem.exists(testFilePath);
    console.log(`[DEMO] ✓ File exists: ${exists}`);
    console.log();

    // 4. Get file stats
    console.log(`[DEMO] Getting file stats: ${testFilePath}`);
    const stats = await filesystem.stat(testFilePath);
    console.log(`[DEMO] ✓ File size: ${stats.size} bytes`);
    console.log();

    // 5. List directory contents
    console.log(`[DEMO] Listing directory: /`);
    const files = await filesystem.readdir("/");
    console.log(`[DEMO] ✓ Directory contents: ${JSON.stringify(files)}`);
    console.log();

    // 6. Delete the test file (cleanup)
    console.log(`[DEMO] Deleting file: ${testFilePath}`);
    await filesystem.unlink(testFilePath);
    console.log("[DEMO] ✓ File deleted successfully");
    console.log();

    console.log("=== Demo Complete ===");
    console.log();
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
