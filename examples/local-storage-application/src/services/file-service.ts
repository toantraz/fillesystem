/**
 * File Service - Demonstrating Dependency Injection
 *
 * This service demonstrates how to use dependency injection in Ignis
 * to get access to the filesystem component.
 *
 * @see https://www.npmjs.com/package/@venizia/ignis
 */

import { Inject } from "@venizia/ignis";
import { Filesystem, FileStats } from "@ignis/filesystem";

// ============================================================================
// IGNIS CONCEPT: Dependency Injection with @Inject()
// ============================================================================
// The @Inject() decorator marks a constructor parameter for dependency injection.
// When the service is created, Ignis will resolve the dependency from the DI container
// and inject it automatically.
//
// Injection tokens:
// - 'filesystem.instance.default': The default filesystem instance
// - 'filesystem.component.instance': The component instance (for health checks)
//
// Benefits of DI:
// - Loose coupling: Service doesn't create its own dependencies
// - Testability: Can inject mock dependencies for testing
// - Flexibility: Can switch implementations without changing service code
// ============================================================================

/**
 * File Service
 *
 * This service demonstrates how to:
 * 1. Use constructor injection with @Inject() decorator
 * 2. Perform filesystem operations using the injected instance
 * 3. Handle errors gracefully with try-catch
 * 4. Log operations for visibility
 */
export class FileService {
  private filesystem: Filesystem;

  /**
   * Constructor - Dependency Injection
   *
   * The @Inject() decorator tells Ignis to inject the filesystem instance.
   * The token 'filesystem.instance.default' refers to the default filesystem
   * configured in the FilesystemComponent.
   *
   * @param filesystem - The injected filesystem instance
   */
  constructor(
    @Inject("filesystem.instance.default")
    filesystem: Filesystem,
  ) {
    this.filesystem = filesystem;
  }

  /**
   * Write a file
   *
   * Creates a file with the specified content at the given path.
   *
   * @param path - File path
   * @param content - File content
   */
  async writeFile(path: string, content: string): Promise<void> {
    try {
      console.log(`[DEMO] Writing file: ${path}`);
      await this.filesystem.writeFile(path, content, "utf8");
      console.log(`[DEMO] ✓ File written successfully`);
    } catch (error) {
      console.error(`[ERROR] Failed to write file: ${(error as Error).message}`);
      // Continue execution - don't throw
    }
  }

  /**
   * Read a file
   *
   * Reads and returns the content of a file.
   *
   * @param path - File path
   * @returns File content
   */
  async readFile(path: string): Promise<string | undefined> {
    try {
      console.log(`[DEMO] Reading file: ${path}`);
      const content = await this.filesystem.readFile(path, "utf8");
      console.log(`[DEMO] ✓ File content: "${content}"`);
      return content;
    } catch (error) {
      console.error(`[ERROR] Failed to read file: ${(error as Error).message}`);
      // Continue execution - don't throw
      return undefined;
    }
  }

  /**
   * Delete a file
   *
   * Deletes the file at the specified path.
   *
   * @param path - File path
   */
  async deleteFile(path: string): Promise<void> {
    try {
      console.log(`[DEMO] Deleting file: ${path}`);
      await this.filesystem.unlink(path);
      console.log(`[DEMO] ✓ File deleted successfully`);
    } catch (error) {
      console.error(`[ERROR] Failed to delete file: ${(error as Error).message}`);
      // Check if it's a permission error and provide helpful message
      if ((error as any).code === "EACCES") {
        console.error("[ERROR] Permission denied. Check file/directory permissions.");
      }
      // Continue execution - don't throw
    }
  }

  /**
   * List files in a directory
   *
   * Returns a list of file and directory names in the specified directory.
   *
   * @param directory - Directory path
   * @returns List of file names
   */
  async listFiles(directory: string): Promise<string[]> {
    try {
      console.log(`[DEMO] Listing directory: ${directory}`);
      const files = await this.filesystem.readdir(directory);
      console.log(`[DEMO] ✓ Directory contents: ${JSON.stringify(files)}`);
      return files;
    } catch (error) {
      console.error(`[ERROR] Failed to list directory: ${(error as Error).message}`);
      // Continue execution - don't throw
      return [];
    }
  }

  /**
   * Get file statistics
   *
   * Returns metadata about a file (size, dates, etc.).
   *
   * @param path - File path
   * @returns File statistics
   */
  async getFileStats(path: string): Promise<FileStats | undefined> {
    try {
      console.log(`[DEMO] Getting file stats: ${path}`);
      const stats = await this.filesystem.stat(path);
      console.log(`[DEMO] ✓ File size: ${stats.size} bytes`);
      return stats;
    } catch (error) {
      console.error(`[ERROR] Failed to get file stats: ${(error as Error).message}`);
      // Continue execution - don't throw
      return undefined;
    }
  }

  /**
   * Check if a file exists
   *
   * Returns true if the file exists, false otherwise.
   *
   * @param path - File path
   * @returns True if file exists
   */
  async checkExists(path: string): Promise<boolean> {
    try {
      console.log(`[DEMO] Checking if file exists: ${path}`);
      const exists = await this.filesystem.exists(path);
      console.log(`[DEMO] ✓ File exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error(`[ERROR] Failed to check file existence: ${(error as Error).message}`);
      // Continue execution - don't throw
      return false;
    }
  }

  // ============================================================================
  // ERROR HANDLING PATTERN
  // ============================================================================
  // Each method in this service demonstrates the error handling pattern:
  // 1. Wrap the operation in a try-catch block
  // 2. Log a clear error message with context
  // 3. Continue execution (don't throw) so the demo can proceed
  //
  // This pattern ensures that:
  // - Errors are visible (logged)
  // - The demo doesn't crash on single operation failure
  // - Users can see multiple operations even if one fails
  // ============================================================================
}
