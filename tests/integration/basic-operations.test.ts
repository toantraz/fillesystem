/**
 * Integration Tests: Basic File Operations
 *
 * Tests for User Story 1: Basic file operations (read, write, delete)
 */

import { createFilesystem } from "../../src/core/filesystem-factory";
import { Filesystem } from "../../src/interfaces/filesystem.interface";
import { FileNotFoundError } from "../../src/errors/filesystem-errors";

describe("Basic File Operations (User Story 1)", () => {
  describe("Local Filesystem", () => {
    let fs: Filesystem;
    const testDir = "./test-temp-local";

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

    test("writeFile and readFile with string content", async () => {
      const testPath = "/test.txt";
      const testContent = "Hello, World!";

      // Write file
      await fs.writeFile(testPath, testContent, "utf8");

      // Read file
      const content = await fs.readFile(testPath, "utf8");

      expect(content).toBe(testContent);
    });

    test("writeFile and readFile with Buffer content", async () => {
      const testPath = "/test.bin";
      const testContent = Buffer.from([0x01, 0x02, 0x03, 0x04]);

      // Write file
      await fs.writeFile(testPath, testContent);

      // Read file
      const content = await fs.readFile(testPath);

      expect(Buffer.isBuffer(content)).toBe(true);
      expect(Buffer.compare(content as unknown as Buffer, testContent)).toBe(0);
    });

    test("unlink deletes file", async () => {
      const testPath = "/to-delete.txt";
      const testContent = "Delete me";

      // Create file
      await fs.writeFile(testPath, testContent, "utf8");

      // Verify file exists
      const existsBefore = await fs.exists(testPath);
      expect(existsBefore).toBe(true);

      // Delete file
      await fs.unlink(testPath);

      // Verify file no longer exists
      const existsAfter = await fs.exists(testPath);
      expect(existsAfter).toBe(false);

      // Attempt to read deleted file should throw
      await expect(fs.readFile(testPath, "utf8")).rejects.toThrow(FileNotFoundError);
    });

    test("readFile throws FileNotFoundError for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist.txt";

      await expect(fs.readFile(nonExistentPath, "utf8")).rejects.toThrow(FileNotFoundError);
    });

    test("exists returns false for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist.txt";

      const exists = await fs.exists(nonExistentPath);
      expect(exists).toBe(false);
    });

    test("exists returns true for existing file", async () => {
      const testPath = "/exists.txt";
      await fs.writeFile(testPath, "test", "utf8");

      const exists = await fs.exists(testPath);
      expect(exists).toBe(true);
    });

    test("appendFile adds to existing file", async () => {
      const testPath = "/append.txt";
      const initialContent = "Hello";
      const appendedContent = ", World!";

      // Create file with initial content
      await fs.writeFile(testPath, initialContent, "utf8");

      // Append to file
      await fs.appendFile(testPath, appendedContent, "utf8");

      // Read file
      const content = await fs.readFile(testPath, "utf8");

      expect(content).toBe(initialContent + appendedContent);
    });

    test("appendFile creates file if it does not exist", async () => {
      const testPath = "/append-new.txt";
      const content = "New content";

      // Append to non-existent file
      await fs.appendFile(testPath, content, "utf8");

      // Read file
      const readContent = await fs.readFile(testPath, "utf8");

      expect(readContent).toBe(content);
    });

    test("copyFile copies file content", async () => {
      const srcPath = "/source.txt";
      const destPath = "/destination.txt";
      const content = "Copy me";

      // Create source file
      await fs.writeFile(srcPath, content, "utf8");

      // Copy file
      await fs.copyFile(srcPath, destPath);

      // Verify destination exists with same content
      const destContent = await fs.readFile(destPath, "utf8");
      expect(destContent).toBe(content);

      // Verify source still exists
      const srcExists = await fs.exists(srcPath);
      expect(srcExists).toBe(true);
    });

    test("rename moves file", async () => {
      const oldPath = "/old.txt";
      const newPath = "/new.txt";
      const content = "Move me";

      // Create file at old path
      await fs.writeFile(oldPath, content, "utf8");

      // Rename file
      await fs.rename(oldPath, newPath);

      // Verify file exists at new path
      const newContent = await fs.readFile(newPath, "utf8");
      expect(newContent).toBe(content);

      // Verify file no longer exists at old path
      const oldExists = await fs.exists(oldPath);
      expect(oldExists).toBe(false);
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
    const testPrefix = `test-${Date.now()}`;

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
      // Note: In a real implementation, we would list and delete all test files
      // For now, we rely on the test prefix to isolate test files
    });

    testCondition("writeFile and readFile with string content", async () => {
      const testPath = "/test.txt";
      const testContent = "Hello, S3 World!";

      // Write file
      await fs.writeFile(testPath, testContent, "utf8");

      // Read file
      const content = await fs.readFile(testPath, "utf8");

      expect(content).toBe(testContent);
    });

    testCondition("writeFile and readFile with Buffer content", async () => {
      const testPath = "/test.bin";
      const testContent = Buffer.from([0x01, 0x02, 0x03, 0x04]);

      // Write file
      await fs.writeFile(testPath, testContent);

      // Read file - explicitly cast to Buffer since we're not providing encoding
      const content = (await fs.readFile(testPath)) as unknown as Buffer;

      expect(Buffer.isBuffer(content)).toBe(true);
      expect(Buffer.compare(content, testContent)).toBe(0);
    });

    testCondition("unlink deletes file", async () => {
      const testPath = "/to-delete.txt";
      const testContent = "Delete me from S3";

      // Create file
      await fs.writeFile(testPath, testContent, "utf8");

      // Verify file exists
      const existsBefore = await fs.exists(testPath);
      expect(existsBefore).toBe(true);

      // Delete file
      await fs.unlink(testPath);

      // Verify file no longer exists
      const existsAfter = await fs.exists(testPath);
      expect(existsAfter).toBe(false);
    });

    testCondition("readFile throws FileNotFoundError for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist-in-s3.txt";

      await expect(fs.readFile(nonExistentPath, "utf8")).rejects.toThrow(FileNotFoundError);
    });

    testCondition("exists returns false for non-existent file", async () => {
      const nonExistentPath = "/does-not-exist-in-s3.txt";

      const exists = await fs.exists(nonExistentPath);
      expect(exists).toBe(false);
    });

    testCondition("appendFile adds to existing file", async () => {
      const testPath = "/append-s3.txt";
      const initialContent = "Hello S3";
      const appendedContent = ", World!";

      // Create file with initial content
      await fs.writeFile(testPath, initialContent, "utf8");

      // Append to file
      await fs.appendFile(testPath, appendedContent, "utf8");

      // Read file
      const content = await fs.readFile(testPath, "utf8");

      expect(content).toBe(initialContent + appendedContent);
    });

    testCondition("copyFile copies file content", async () => {
      const srcPath = "/source-s3.txt";
      const destPath = "/destination-s3.txt";
      const content = "Copy me in S3";

      // Create source file
      await fs.writeFile(srcPath, content, "utf8");

      // Copy file
      await fs.copyFile(srcPath, destPath);

      // Verify destination exists with same content
      const destContent = await fs.readFile(destPath, "utf8");
      expect(destContent).toBe(content);
    });

    testCondition("rename moves file", async () => {
      const oldPath = "/old-s3.txt";
      const newPath = "/new-s3.txt";
      const content = "Move me in S3";

      // Create file at old path
      await fs.writeFile(oldPath, content, "utf8");

      // Rename file
      await fs.rename(oldPath, newPath);

      // Verify file exists at new path
      const newContent = await fs.readFile(newPath, "utf8");
      expect(newContent).toBe(content);

      // Verify file no longer exists at old path
      const oldExists = await fs.exists(oldPath);
      expect(oldExists).toBe(false);
    });
  });
});
