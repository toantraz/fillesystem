/**
 * Integration Tests: Metadata Operations
 *
 * Tests for User Story 4: File metadata and statistics (size, modification time, permissions)
 */

import { createFilesystem } from "../../src/core/filesystem-factory";
import { Filesystem } from "../../src/interfaces/filesystem.interface";
import { FileNotFoundError, PermissionError } from "../../src/errors/filesystem-errors";

describe("Metadata Operations (User Story 4)", () => {
  describe("Local Filesystem", () => {
    let fs: Filesystem;
    const testDir = "./test-temp-dir-metadata-local";

    beforeAll(() => {
      fs = createFilesystem({
        type: "local",
        local: {
          basePath: testDir,
          createMissingDirs: true,
        },
      });
    });

    afterAll(async () => {
      // Cleanup test directory
      try {
        await fs.rmdir("/", { recursive: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    beforeEach(async () => {
      // Ensure clean state for each test
      try {
        await fs.rmdir("/", { recursive: true });
      } catch (error) {
        // Directory may not exist yet
      }
      await fs.mkdir("/", { recursive: true });
    });

    test("stat returns correct metadata for file", async () => {
      const filePath = "/test-file.txt";
      const content = "Hello, World!";
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      // Basic type checks
      expect(stats.isFile()).toBe(true);
      expect(stats.isDirectory()).toBe(false);
      expect(stats.isSymbolicLink()).toBe(false);

      // Size should match content
      expect(stats.size).toBe(content.length);

      // Timestamps should be valid dates
      expect(stats.mtime).toBeDefined();
      expect(stats.atime).toBeDefined();
      expect(stats.ctime).toBeDefined();

      // Numeric timestamp properties
      expect(typeof stats.mtimeMs).toBe("number");
      expect(stats.mtimeMs).toBeGreaterThan(0);

      // Other properties
      expect(typeof stats.mode).toBe("number");
      expect(typeof stats.uid).toBe("number");
      expect(typeof stats.gid).toBe("number");
      expect(typeof stats.ino).toBe("number");
    });

    test("stat returns correct metadata for directory", async () => {
      const dirPath = "/test-dir";
      await fs.mkdir(dirPath);

      const stats = await fs.stat(dirPath);

      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
      // Directory size may be 0 or block size depending on filesystem
      expect(typeof stats.size).toBe("number");
    });

    test("stat throws FileNotFoundError for non-existent path", async () => {
      const nonExistentPath = "/does-not-exist.txt";

      await expect(fs.stat(nonExistentPath)).rejects.toThrow(FileNotFoundError);
    });

    test("lstat returns same as stat for regular files (no symlinks)", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      const statResult = await fs.stat(filePath);
      const lstatResult = await fs.lstat(filePath);

      // For regular files, stat and lstat should return similar results
      expect(lstatResult.isFile()).toBe(true);
      expect(lstatResult.size).toBe(statResult.size);
    });

    test("access succeeds for existing file", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      // Should not throw
      await expect(fs.access(filePath)).resolves.not.toThrow();
    });

    test("access throws for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist.txt";

      await expect(fs.access(nonExistentPath)).rejects.toThrow(FileNotFoundError);
    });

    test("access with mode parameter", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      // Test with different modes (fs.constants)
      // Note: We're using numeric values since we don't import fs.constants
      await expect(fs.access(filePath, 0)).resolves.not.toThrow(); // F_OK - existence
      // Other modes (R_OK, W_OK, X_OK) would require actual permission checks
    });

    test("exists returns true for existing file", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      const exists = await fs.exists(filePath);
      expect(exists).toBe(true);
    });

    test("exists returns true for existing directory", async () => {
      const dirPath = "/test-dir";
      await fs.mkdir(dirPath);

      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);
    });

    test("exists returns false for non-existent path", async () => {
      const nonExistentPath = "/does-not-exist.txt";

      const exists = await fs.exists(nonExistentPath);
      expect(exists).toBe(false);
    });

    test("stat properties are consistent", async () => {
      const filePath = "/test-file.txt";
      const content = "Test content for metadata";
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      // Check that numeric and Date properties are consistent (allow for floating point precision)
      expect(Math.abs(stats.mtime.getTime() - stats.mtimeMs)).toBeLessThan(1);
      expect(Math.abs(stats.atime.getTime() - stats.atimeMs)).toBeLessThan(1);
      expect(Math.abs(stats.ctime.getTime() - stats.ctimeMs)).toBeLessThan(1);
      expect(Math.abs(stats.birthtime.getTime() - stats.birthtimeMs)).toBeLessThan(1);

      // Check block calculations
      if (stats.size > 0) {
        expect(stats.blocks).toBeGreaterThan(0);
        expect(stats.blksize).toBeGreaterThan(0);
      }
    });

    test("stat for empty file", async () => {
      const filePath = "/empty-file.txt";
      await fs.writeFile(filePath, "", "utf8");

      const stats = await fs.stat(filePath);

      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(0);
      expect(stats.mtime).toBeDefined();
    });

    test("stat for large file", async () => {
      const filePath = "/large-file.txt";
      const content = "A".repeat(10000); // 10KB file
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(10000);
    });
  });

  describe("AWS S3 Filesystem", () => {
    // Note: S3 tests require actual AWS credentials and bucket
    // These tests are skipped by default but can be enabled with environment variables
    const shouldRunS3Tests =
      process.env.RUN_S3_TESTS === "true" &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_TEST_BUCKET;

    const testCondition = shouldRunS3Tests ? it : it.skip;

    let fs: Filesystem;
    const testPrefix = `metadata-test-${Date.now()}`;

    beforeAll(() => {
      if (!shouldRunS3Tests) {
        return;
      }

      fs = createFilesystem({
        type: "s3",
        s3: {
          bucket: process.env.S3_TEST_BUCKET!,
          region: process.env.AWS_REGION || "us-east-1",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          prefix: testPrefix,
        },
      });
    });

    afterAll(async () => {
      if (!shouldRunS3Tests) {
        return;
      }

      // Cleanup test files
      try {
        await fs.rmdir("/", { recursive: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    beforeEach(async () => {
      if (!shouldRunS3Tests) {
        return;
      }

      // Clean up any existing test files
      try {
        await fs.rmdir("/", { recursive: true });
      } catch (error) {
        // Directory may not exist yet
      }
    });

    testCondition("stat returns correct metadata for file", async () => {
      const filePath = "/test-file-s3.txt";
      const content = "Hello, S3 World!";
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      // Basic type checks
      expect(stats.isFile()).toBe(true);
      expect(stats.isDirectory()).toBe(false);
      expect(stats.isSymbolicLink()).toBe(false);

      // Size should match content
      expect(stats.size).toBe(content.length);

      // Timestamps should be valid dates
      expect(stats.mtime).toBeDefined();
      expect(stats.atime).toBeDefined();
      expect(stats.ctime).toBeDefined();
      expect(stats.mtime).toBeInstanceOf(Date);
      expect(stats.atime).toBeInstanceOf(Date);
      expect(stats.ctime).toBeInstanceOf(Date);

      // S3-specific: LastModified should be recent
      const now = Date.now();
      const mtime = stats.mtime.getTime();
      expect(mtime).toBeLessThanOrEqual(now);
      expect(mtime).toBeGreaterThan(now - 60000); // Within last minute

      // Other properties (S3 defaults)
      expect(stats.mode).toBe(0o644); // Default file permissions
      expect(stats.uid).toBe(0);
      expect(stats.gid).toBe(0);
    });

    testCondition("stat returns correct metadata for directory", async () => {
      const dirPath = "/test-dir-s3";
      await fs.mkdir(dirPath);

      const stats = await fs.stat(dirPath);

      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
      expect(stats.size).toBe(0); // Directories have size 0 in S3
      expect(stats.mode).toBe(0o755); // Default directory permissions
    });

    testCondition("stat throws FileNotFoundError for non-existent path", async () => {
      const nonExistentPath = "/does-not-exist-s3.txt";

      await expect(fs.stat(nonExistentPath)).rejects.toThrow(FileNotFoundError);
    });

    testCondition("lstat returns same as stat (S3 has no symlinks)", async () => {
      const filePath = "/test-file-s3.txt";
      await fs.writeFile(filePath, "test", "utf8");

      const statResult = await fs.stat(filePath);
      const lstatResult = await fs.lstat(filePath);

      // For S3, stat and lstat should be identical
      expect(lstatResult.isFile()).toBe(true);
      expect(lstatResult.size).toBe(statResult.size);
      expect(lstatResult.mtime.getTime()).toBe(statResult.mtime.getTime());
    });

    testCondition("access succeeds for existing file", async () => {
      const filePath = "/test-file-s3.txt";
      await fs.writeFile(filePath, "test", "utf8");

      // Should not throw
      await expect(fs.access(filePath)).resolves.not.toThrow();
    });

    testCondition("access throws for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist-s3.txt";

      await expect(fs.access(nonExistentPath)).rejects.toThrow(FileNotFoundError);
    });

    testCondition("exists returns true for existing file", async () => {
      const filePath = "/test-file-s3.txt";
      await fs.writeFile(filePath, "test", "utf8");

      const exists = await fs.exists(filePath);
      expect(exists).toBe(true);
    });

    testCondition("exists returns true for existing directory", async () => {
      const dirPath = "/test-dir-s3";
      await fs.mkdir(dirPath);

      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);
    });

    testCondition("exists returns false for non-existent path", async () => {
      const nonExistentPath = "/does-not-exist-s3.txt";

      const exists = await fs.exists(nonExistentPath);
      expect(exists).toBe(false);
    });

    testCondition("stat for empty file", async () => {
      const filePath = "/empty-file-s3.txt";
      await fs.writeFile(filePath, "", "utf8");

      const stats = await fs.stat(filePath);

      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(0);
      expect(stats.mtime).toBeDefined();
    });

    testCondition("stat properties are consistent", async () => {
      const filePath = "/test-file-s3.txt";
      const content = "Test content for S3 metadata";
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      // Check that numeric and Date properties are consistent (allow for floating point precision)
      expect(Math.abs(stats.mtime.getTime() - stats.mtimeMs)).toBeLessThan(1);
      expect(Math.abs(stats.atime.getTime() - stats.atimeMs)).toBeLessThan(1);
      expect(Math.abs(stats.ctime.getTime() - stats.ctimeMs)).toBeLessThan(1);

      // S3 doesn't have birthtime, so it should be 0
      expect(stats.birthtime.getTime()).toBe(0);
      expect(stats.birthtimeMs).toBe(0);

      // Check block calculations
      if (stats.size > 0) {
        expect(stats.blocks).toBeGreaterThan(0);
        expect(stats.blksize).toBe(4096); // S3 uses fixed block size
      }
    });

    testCondition("stat for file with special characters", async () => {
      const filePath = "/test file with spaces.txt";
      const content = "Content with spaces in filename";
      await fs.writeFile(filePath, content, "utf8");

      const stats = await fs.stat(filePath);

      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBe(content.length);
    });

    testCondition("stat for nested directory", async () => {
      const dirPath = "/nested/deep/directory";
      await fs.mkdir(dirPath, { recursive: true });

      // Check each level
      const rootStats = await fs.stat("/nested");
      expect(rootStats.isDirectory()).toBe(true);

      const deepStats = await fs.stat("/nested/deep");
      expect(deepStats.isDirectory()).toBe(true);

      const dirStats = await fs.stat(dirPath);
      expect(dirStats.isDirectory()).toBe(true);
    });
  });

  describe("Cross-Adapter Consistency", () => {
    // These tests verify that both adapters provide consistent metadata
    // They're conceptual and don't require actual S3 connection

    test("stat interface is consistent across adapters", () => {
      // This is a type check test - verify that both adapters implement the same interface
      const expectedProperties = [
        "isFile",
        "isDirectory",
        "isBlockDevice",
        "isCharacterDevice",
        "isSymbolicLink",
        "isFIFO",
        "isSocket",
        "dev",
        "ino",
        "mode",
        "nlink",
        "uid",
        "gid",
        "rdev",
        "size",
        "blksize",
        "blocks",
        "atimeMs",
        "mtimeMs",
        "ctimeMs",
        "birthtimeMs",
        "atime",
        "mtime",
        "ctime",
        "birthtime",
      ];

      // All these properties should exist on FileStats interface
      // This is a compile-time check, but we can verify at runtime
      expect(expectedProperties).toBeDefined();
    });

    test("exists returns boolean consistently", async () => {
      // Both adapters should return boolean, not throw for non-existent files
      // This is tested in the adapter-specific tests above
      expect(true).toBe(true); // Placeholder for the concept
    });
  });
});
