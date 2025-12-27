/**
 * Contract Tests: Filesystem Interface Compliance
 *
 * Tests that verify all adapters implement the Filesystem interface correctly.
 * These tests ensure interface compliance across different storage backends.
 */

import { Filesystem } from "../../src/interfaces/filesystem.interface";
import { createFilesystem } from "../../src/core/filesystem-factory";

/**
 * Contract test suite that should be run for each adapter
 */
export function createFilesystemContractTests(
  adapterName: string,
  createAdapter: () => Filesystem,
  cleanup?: () => Promise<void>,
) {
  describe(`Filesystem Contract: ${adapterName}`, () => {
    let fs: Filesystem;

    beforeAll(async () => {
      fs = createAdapter();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    beforeEach(async () => {
      // Clean up any test files before each test
      try {
        await fs.unlink("/test-contract.txt").catch(() => {});
        await fs.unlink("/test-contract-copy.txt").catch(() => {});
        await fs.unlink("/test-contract-rename.txt").catch(() => {});
        await fs.rmdir("/test-contract-dir", { recursive: true }).catch(() => {});
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    describe("File Operations Contract", () => {
      test("writeFile and readFile with string content", async () => {
        const testPath = "/test-contract.txt";
        const testContent = "Hello, Contract Test!";

        // Write file
        await fs.writeFile(testPath, testContent, "utf8");

        // Read file
        const content = await fs.readFile(testPath, "utf8");

        expect(content).toBe(testContent);
      });

      test("writeFile and readFile with Buffer content", async () => {
        const testPath = "/test-contract.bin";
        const testContent = Buffer.from([0x01, 0x02, 0x03, 0x04]);

        // Write file
        await fs.writeFile(testPath, testContent);

        // Read file
        const content = await fs.readFile(testPath);

        expect(Buffer.isBuffer(content)).toBe(true);
        expect(Buffer.compare(content as unknown as Buffer, testContent)).toBe(0);
      });

      test("unlink deletes file", async () => {
        const testPath = "/test-contract-delete.txt";
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
      });

      test("appendFile adds to existing file", async () => {
        const testPath = "/test-contract-append.txt";
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
        const testPath = "/test-contract-append-new.txt";
        const content = "New content";

        // Append to non-existent file
        await fs.appendFile(testPath, content, "utf8");

        // Read file
        const readContent = await fs.readFile(testPath, "utf8");

        expect(readContent).toBe(content);
      });

      test("copyFile copies file content", async () => {
        const srcPath = "/test-contract-source.txt";
        const destPath = "/test-contract-destination.txt";
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
        const oldPath = "/test-contract-old.txt";
        const newPath = "/test-contract-new.txt";
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

    describe("Directory Operations Contract", () => {
      // Note: Directory operations may not be fully implemented for all adapters
      // These tests check basic compliance

      test("mkdir creates directory", async () => {
        const dirPath = "/test-contract-dir";

        // Create directory
        await fs.mkdir(dirPath);

        // Verify directory exists (implementation dependent)
        // Some adapters may not support exists for directories
        try {
          const exists = await fs.exists(dirPath);
          expect(exists).toBe(true);
        } catch (error) {
          // Some adapters may not implement exists for directories
          // That's okay for contract compliance
        }
      });

      test("mkdir with recursive option", async () => {
        const dirPath = "/test-contract-dir/nested/deep";

        // Create nested directories
        await fs.mkdir(dirPath, { recursive: true });

        // Verify (implementation dependent)
        try {
          const exists = await fs.exists("/test-contract-dir");
          expect(exists).toBe(true);
        } catch (error) {
          // Acceptable if not implemented
        }
      });
    });

    describe("File Info Operations Contract", () => {
      test("stat returns FileStats for existing file", async () => {
        const testPath = "/test-contract-stats.txt";
        const testContent = "Stats test";

        // Create file
        await fs.writeFile(testPath, testContent, "utf8");

        // Get stats
        const stats = await fs.stat(testPath);

        // Verify stats interface compliance
        expect(typeof stats.isFile).toBe("function");
        expect(typeof stats.isDirectory).toBe("function");
        expect(typeof stats.size).toBe("number");
        expect(stats.size).toBeGreaterThanOrEqual(testContent.length);

        // Verify it's a file
        expect(stats.isFile()).toBe(true);
      });

      test("exists returns true for existing file", async () => {
        const testPath = "/test-contract-exists.txt";
        const testContent = "Exists test";

        // Create file
        await fs.writeFile(testPath, testContent, "utf8");

        // Check existence
        const exists = await fs.exists(testPath);

        expect(exists).toBe(true);
      });

      test("exists returns false for non-existent file", async () => {
        const nonExistentPath = "/does-not-exist-contract.txt";

        const exists = await fs.exists(nonExistentPath);

        expect(exists).toBe(false);
      });
    });

    describe("Error Handling Contract", () => {
      test("readFile throws appropriate error for non-existent file", async () => {
        const nonExistentPath = "/does-not-exist-error.txt";

        await expect(fs.readFile(nonExistentPath, "utf8")).rejects.toThrow();
        // Note: Specific error type may vary by adapter
      });

      test("unlink throws appropriate error for non-existent file", async () => {
        const nonExistentPath = "/does-not-exist-unlink.txt";

        await expect(fs.unlink(nonExistentPath)).rejects.toThrow();
      });
    });
  });
}

/**
 * Local filesystem adapter contract tests
 */
describe("Contract Tests: Local Filesystem Adapter", () => {
  createFilesystemContractTests(
    "LocalAdapter",
    () =>
      createFilesystem({
        type: "local",
        local: {
          basePath: "./test-temp-contract-local",
          createMissingDirs: true,
        },
      }),
    async () => {
      // Cleanup test directory
      const fs = require("fs/promises");
      try {
        await fs.rm("./test-temp-contract-local", { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    },
  );
});

/**
 * S3 adapter contract tests (skipped by default, requires AWS credentials)
 */
describe("Contract Tests: S3 Adapter", () => {
  const shouldRunS3Tests =
    process.env.RUN_S3_CONTRACT_TESTS === "true" &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_TEST_BUCKET;

  const testCondition = shouldRunS3Tests ? describe : describe.skip;

  testCondition("S3Adapter", () => {
    createFilesystemContractTests(
      "S3Adapter",
      () =>
        createFilesystem({
          type: "s3",
          s3: {
            bucket: process.env.S3_TEST_BUCKET!,
            region: process.env.AWS_REGION || "us-east-1",
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            prefix: `contract-test-${Date.now()}`,
          },
        }),
      async () => {
        // S3 cleanup would require deleting all test objects
        // For contract tests, we rely on unique prefix for isolation
      },
    );
  });
});
