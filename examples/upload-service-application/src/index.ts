/**
 * Upload Service Example - Entry Point
 *
 * Bootstrap script for the upload service application.
 * Creates FilesystemConfig, instantiates Application, and starts the server.
 *
 * Demonstrates proper Ignis application bootstrap pattern:
 * - Create application configuration
 * - Instantiate Application with configuration
 * - Start the server
 *
 * @see https://github.com/VENIZIA-AI/filesystem
 */

import path from "node:path";
import { Application } from "./application.js";
import type { FilesystemConfig } from "@ignis/filesystem";

// --------------------------------------------------------------------------------
/** Filesystem configuration for local storage */
const filesystemConfig: FilesystemConfig = {
  type: "local",
  local: {
    basePath: path.join(process.cwd(), "uploads"),
    createMissingDirs: true,
  },
} as FilesystemConfig;

// --------------------------------------------------------------------------------
/** Upload service configuration (optional customization) */
const uploadConfig = {
  targetDirectory: path.join(process.cwd(), "uploads"),
  autoCreateDirectory: true,
  allowedFileTypes: null, // null = all types accepted
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxConcurrentUploads: 10,
  enableProgressTracking: true,
};

// --------------------------------------------------------------------------------
/** Create and start the application */
async function main() {
  console.log("Starting Upload Service Example...");
  console.log(`Upload directory: ${uploadConfig.targetDirectory}`);
  console.log(`Max file size: ${uploadConfig.maxFileSize / (1024 * 1024)}MB`);

  const app = new Application(filesystemConfig, uploadConfig);

  try {
    // Initialize the application and register core bindings
    app.init();

    // Start the server
    await app.start();
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

// --------------------------------------------------------------------------------
/** Start the application */
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
