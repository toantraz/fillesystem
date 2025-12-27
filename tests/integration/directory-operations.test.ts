/**
 * Integration Tests: Directory Operations
 *
 * Tests for User Story 3: Directory operations (create, list, remove)
 */

import { createFilesystem } from "../../src/core/filesystem-factory";
import { Filesystem } from "../../src/interfaces/filesystem.interface";
import { StorageError } from "../../src/errors/filesystem-errors";

describe("Directory Operations (User Story 3)", () => {
  describe("Local Filesystem", () => {
    let fs: Filesystem;
    const testDir = "./test-temp-dir-local";

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

    test("mkdir creates directory", async () => {
      const dirPath = "/test-dir";

      // Create directory
      await fs.mkdir(dirPath);

      // Verify directory exists
      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);

      // Verify it's a directory
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
    });

    test("mkdir with recursive option creates nested directories", async () => {
      const dirPath = "/nested/deep/directory";

      // Create nested directories
      await fs.mkdir(dirPath, { recursive: true });

      // Verify all levels exist
      expect(await fs.exists("/nested")).toBe(true);
      expect(await fs.exists("/nested/deep")).toBe(true);
      expect(await fs.exists("/nested/deep/directory")).toBe(true);

      // Verify they are directories
      const stats = await fs.stat("/nested/deep/directory");
      expect(stats.isDirectory()).toBe(true);
    });

    test("mkdir without recursive throws error for non-existent parent", async () => {
      const dirPath = "/non-existent-parent/new-dir";

      // Should throw because parent doesn't exist
      await expect(fs.mkdir(dirPath)).rejects.toThrow();
    });

    test("readdir lists directory contents", async () => {
      // Create test files and directories
      await fs.writeFile("/file1.txt", "Content 1", "utf8");
      await fs.writeFile("/file2.txt", "Content 2", "utf8");
      await fs.mkdir("/subdir");
      await fs.writeFile("/subdir/file3.txt", "Content 3", "utf8");

      // List root directory
      const entries = await fs.readdir("/");

      // Should contain our files and directory
      expect(entries).toContain("file1.txt");
      expect(entries).toContain("file2.txt");
      expect(entries).toContain("subdir");
      expect(entries.length).toBe(3);
    });

    test("readdir on empty directory returns empty array", async () => {
      const dirPath = "/empty-dir";
      await fs.mkdir(dirPath);

      const entries = await fs.readdir(dirPath);
      expect(entries).toEqual([]);
    });

    test("readdir throws error for non-existent directory", async () => {
      const nonExistentPath = "/does-not-exist";

      await expect(fs.readdir(nonExistentPath)).rejects.toThrow();
    });

    test("readdir throws error for file (not a directory)", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      await expect(fs.readdir(filePath)).rejects.toThrow();
    });

    test("rmdir removes empty directory", async () => {
      const dirPath = "/to-remove";
      await fs.mkdir(dirPath);

      // Verify directory exists
      expect(await fs.exists(dirPath)).toBe(true);

      // Remove directory
      await fs.rmdir(dirPath);

      // Verify directory no longer exists
      expect(await fs.exists(dirPath)).toBe(false);
    });

    test("rmdir with recursive option removes directory and contents", async () => {
      const dirPath = "/to-remove-recursive";
      await fs.mkdir(dirPath);
      await fs.writeFile(`${dirPath}/file1.txt`, "test", "utf8");
      await fs.mkdir(`${dirPath}/subdir`);
      await fs.writeFile(`${dirPath}/subdir/file2.txt`, "test", "utf8");

      // Verify directory exists with contents
      expect(await fs.exists(dirPath)).toBe(true);
      expect(await fs.exists(`${dirPath}/file1.txt`)).toBe(true);

      // Remove recursively
      await fs.rmdir(dirPath, { recursive: true });

      // Verify everything is gone
      expect(await fs.exists(dirPath)).toBe(false);
    });

    test("rmdir without recursive throws error for non-empty directory", async () => {
      const dirPath = "/non-empty-dir";
      await fs.mkdir(dirPath);
      await fs.writeFile(`${dirPath}/file.txt`, "test", "utf8");

      // Should throw because directory is not empty
      await expect(fs.rmdir(dirPath)).rejects.toThrow();
    });

    test("rmdir throws error for non-existent directory", async () => {
      const nonExistentPath = "/does-not-exist";

      await expect(fs.rmdir(nonExistentPath)).rejects.toThrow();
    });

    test("rmdir throws error for file (not a directory)", async () => {
      const filePath = "/test-file.txt";
      await fs.writeFile(filePath, "test", "utf8");

      await expect(fs.rmdir(filePath)).rejects.toThrow();
    });

    test("exists returns true for directory", async () => {
      const dirPath = "/test-dir-exists";
      await fs.mkdir(dirPath);

      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);
    });

    test("stat returns correct information for directory", async () => {
      const dirPath = "/test-dir-stats";
      await fs.mkdir(dirPath);

      const stats = await fs.stat(dirPath);

      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
      expect(typeof stats.size).toBe("number");
      expect(stats.mtime).toBeDefined();
      expect(stats.atime).toBeDefined();
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
    const testPrefix = `dir-test-${Date.now()}`;

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

    testCondition("mkdir creates directory marker", async () => {
      const dirPath = "/test-dir-s3";

      // Create directory
      await fs.mkdir(dirPath);

      // Verify directory exists (S3 directories are just prefixes)
      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);
    });

    testCondition("mkdir with recursive option creates nested directories", async () => {
      const dirPath = "/nested/deep/directory/s3";

      // Create nested directories
      await fs.mkdir(dirPath, { recursive: true });

      // Verify all levels exist (as prefixes)
      expect(await fs.exists("/nested")).toBe(true);
      expect(await fs.exists("/nested/deep")).toBe(true);
      expect(await fs.exists("/nested/deep/directory")).toBe(true);
      expect(await fs.exists("/nested/deep/directory/s3")).toBe(true);
    });

    testCondition("mkdir without recursive may throw for non-existent parent", async () => {
      const dirPath = "/non-existent-parent-s3/new-dir";

      // S3 may or may not enforce parent existence depending on implementation
      // We'll test that it either works or throws appropriately
      try {
        await fs.mkdir(dirPath);
        // If it succeeds, that's acceptable for S3
      } catch (error) {
        // If it fails, it should be a StorageError about parent not existing
        expect(error).toBeInstanceOf(StorageError);
      }
    });

    testCondition("readdir lists directory contents", async () => {
      // Create test files and directories
      await fs.writeFile("/file1-s3.txt", "Content 1", "utf8");
      await fs.writeFile("/file2-s3.txt", "Content 2", "utf8");
      await fs.mkdir("/subdir-s3");
      await fs.writeFile("/subdir-s3/file3.txt", "Content 3", "utf8");

      // List root directory
      const entries = await fs.readdir("/");

      // Should contain our files and directory
      // Note: S3 may return directory markers differently
      expect(entries).toContain("file1-s3.txt");
      expect(entries).toContain("file2-s3.txt");
      expect(entries).toContain("subdir-s3");
    });

    testCondition("readdir on empty directory returns empty array", async () => {
      const dirPath = "/empty-dir-s3";
      await fs.mkdir(dirPath);

      const entries = await fs.readdir(dirPath);
      expect(entries).toEqual([]);
    });

    testCondition("readdir throws error for non-existent directory", async () => {
      const nonExistentPath = "/does-not-exist-s3";

      await expect(fs.readdir(nonExistentPath)).rejects.toThrow();
    });

    testCondition("rmdir removes directory marker", async () => {
      const dirPath = "/to-remove-s3";
      await fs.mkdir(dirPath);

      // Verify directory exists
      expect(await fs.exists(dirPath)).toBe(true);

      // Remove directory
      await fs.rmdir(dirPath);

      // Verify directory no longer exists
      expect(await fs.exists(dirPath)).toBe(false);
    });

    testCondition("rmdir with recursive option removes directory and contents", async () => {
      const dirPath = "/to-remove-recursive-s3";
      await fs.mkdir(dirPath);
      await fs.writeFile(`${dirPath}/file1.txt`, "test", "utf8");
      await fs.mkdir(`${dirPath}/subdir`);
      await fs.writeFile(`${dirPath}/subdir/file2.txt`, "test", "utf8");

      // Verify directory exists with contents
      expect(await fs.exists(dirPath)).toBe(true);
      expect(await fs.exists(`${dirPath}/file1.txt`)).toBe(true);

      // Remove recursively
      await fs.rmdir(dirPath, { recursive: true });

      // Verify everything is gone
      expect(await fs.exists(dirPath)).toBe(false);
      expect(await fs.exists(`${dirPath}/file1.txt`)).toBe(false);
    });

    testCondition("rmdir without recursive throws error for non-empty directory", async () => {
      const dirPath = "/non-empty-dir-s3";
      await fs.mkdir(dirPath);
      await fs.writeFile(`${dirPath}/file.txt`, "test", "utf8");

      // Should throw because directory is not empty
      await expect(fs.rmdir(dirPath)).rejects.toThrow(StorageError);
    });

    testCondition("exists returns true for directory", async () => {
      const dirPath = "/test-dir-exists-s3";
      await fs.mkdir(dirPath);

      const exists = await fs.exists(dirPath);
      expect(exists).toBe(true);
    });

    testCondition("stat returns information for directory", async () => {
      const dirPath = "/test-dir-stats-s3";
      await fs.mkdir(dirPath);

      const stats = await fs.stat(dirPath);

      // S3 directories have limited stats
      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
      expect(typeof stats.size).toBe("number");
      expect(stats.mtime).toBeInstanceOf(Date);
    });
  });
});
