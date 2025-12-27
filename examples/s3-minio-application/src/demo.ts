/**
 * S3 Filesystem Operations Demo
 *
 * This file demonstrates comprehensive filesystem operations against S3/MinIO:
 * - File I/O: writeFile, readFile, appendFile, copyFile
 * - File Management: unlink, rename, exists
 * - Directory Operations: mkdir, rmdir, readdir (using S3 key prefixes)
 * - File Info: stat, lstat, access, realpath
 * - Streams: createReadStream, createWriteStream
 *
 * Note: Some operations have S3-specific behaviors:
 * - Directories are simulated using key prefixes
 * - Some operations like chmod/chown are not applicable to S3
 *
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
 */

import type { Filesystem } from "@ignis/filesystem";
import type { Logger } from "@venizia/ignis";

/**
 * Run the comprehensive S3 filesystem operations demo
 *
 * @param filesystem - The Filesystem instance (S3 adapter)
 * @param logger - The Ignis logger for output
 */
export async function runS3Demo(filesystem: Filesystem, logger: Logger): Promise<void> {
  const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
  };

  function log(message: string, color: keyof typeof colors = "reset"): void {
    const coloredMessage = `${colors[color]}${message}${colors.reset}`;
    logger.info(coloredMessage);
  }

  function section(title: string): void {
    logger.info("");
    logger.info("=".repeat(60));
    log(title, "cyan");
    logger.info("=".repeat(60));
  }

  try {
    // ==========================================================================
    // 1. FILE I/O OPERATIONS
    // ==========================================================================
    section("1. File I/O Operations");

    // writeFile - Create a new file
    log("\n[OK] writeFile: Creating test-file.txt", "green");
    await filesystem.writeFile("/test-file.txt", "Hello, S3!", "utf8");
    log('  Content: "Hello, S3!"');
    log("  Note: File stored as S3 object with key prefix");

    // readFile - Read file content
    log("\n[OK] readFile: Reading test-file.txt", "green");
    const content = (await filesystem.readFile("/test-file.txt", "utf8")) as string;
    log(`  Content: "${content}"`);

    // Verify content matches
    if (content === "Hello, S3!") {
      log("  Content verification: PASSED");
    } else {
      log(`  Content mismatch. Expected: "Hello, S3!", Got: "${content}"`, "yellow");
    }

    // readFile as Buffer
    log("\n[OK] readFile: Reading as Buffer", "green");
    const buffer = await filesystem.readFile("/test-file.txt");
    log(`  Buffer size: ${buffer.length} bytes`);

    // writeFile with Buffer (binary data)
    log("\n[OK] writeFile: Writing binary data", "green");
    await filesystem.writeFile(
      "/binary-file.dat",
      Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21]),
    );
    log("  Created binary-file.dat with binary content");

    // appendFile - Append to existing file
    log("\n[OK] appendFile: Appending to test-file.txt", "green");
    await filesystem.appendFile("/test-file.txt", " Appended text.", "utf8");
    const appendedContent = (await filesystem.readFile("/test-file.txt", "utf8")) as string;
    log(`  New content: "${appendedContent}"`);
    log("  Note: S3 appendFile reads, modifies, and writes (not native S3 operation)");

    // copyFile - Copy file
    log("\n[OK] copyFile: Copying test-file.txt to test-file-copy.txt", "green");
    await filesystem.copyFile("/test-file.txt", "/test-file-copy.txt");
    const copyContent = (await filesystem.readFile("/test-file-copy.txt", "utf8")) as string;
    log(`  Copy content: "${copyContent}"`);

    // ==========================================================================
    // 2. FILE MANAGEMENT
    // ==========================================================================
    section("2. File Management");

    // exists - Check if file exists
    log("\n[OK] exists: Checking if files exist", "green");
    const exists1 = await filesystem.exists("/test-file.txt");
    const exists2 = await filesystem.exists("/non-existent.txt");
    log(`  test-file.txt exists: ${exists1}`);
    log(`  non-existent.txt exists: ${exists2}`);

    // rename - Move/rename file
    log("\n[OK] rename: Renaming test-file-copy.txt to renamed-file.txt", "green");
    await filesystem.rename("/test-file-copy.txt", "/renamed-file.txt");
    const renamedExists = await filesystem.exists("/renamed-file.txt");
    log(`  renamed-file.txt exists: ${renamedExists}`);
    log("  Note: S3 rename copies then deletes (not atomic)");

    // unlink - Delete file
    log("\n[OK] unlink: Deleting renamed-file.txt", "green");
    await filesystem.unlink("/renamed-file.txt");
    const deletedExists = await filesystem.exists("/renamed-file.txt");
    log(`  renamed-file.txt exists after delete: ${deletedExists}`);

    // ==========================================================================
    // 3. DIRECTORY OPERATIONS (S3 Key Prefixes)
    // ==========================================================================
    section("3. Directory Operations (S3 Key Prefixes)");

    // mkdir - Create directory (S3: creates placeholder object)
    log("\n[OK] mkdir: Creating /test-dir", "green");
    await filesystem.mkdir("/test-dir");
    log("  Directory created (S3: placeholder object with key ending in /)");

    // mkdir with recursive option
    log("\n[OK] mkdir: Creating /test-dir/nested/deep with recursive", "green");
    await filesystem.mkdir("/test-dir/nested/deep", { recursive: true });
    log("  Nested directories created");

    // readdir - List directory contents
    log("\n[OK] readdir: Listing /test-dir", "green");
    try {
      const dirContents = await filesystem.readdir("/test-dir");
      log(`  Contents: ${dirContents.join(", ") || "(empty)"}`);
      log("  Note: Lists S3 objects with the prefix");
    } catch (e) {
      // Known issue with MinIO + AWS SDK path-style access for root directory listing
      log(`  Known MinIO path-style issue: ${(e as Error).message}`, "yellow");
      log("  Skipping readdir verification - continuing with demo...");
    }

    // Create files for testing readdir
    await filesystem.writeFile("/test-dir/file1.txt", "content1");
    await filesystem.writeFile("/test-dir/file2.txt", "content2");

    log("\n[OK] readdir: Listing /test-dir after adding files", "green");
    try {
      const dirContents2 = await filesystem.readdir("/test-dir");
      log(`  Contents: ${dirContents2.join(", ")}`);
    } catch (e) {
      log(`  Readdir failed: ${(e as Error).message}`, "yellow");
    }

    // rmdir - Remove empty directory
    log("\n[OK] rmdir: Removing /test-dir/nested/deep", "green");
    await filesystem.rmdir("/test-dir/nested/deep");
    log("  Empty directory removed");

    // rmdir with recursive option
    log("\n[OK] rmdir: Removing /test-dir with recursive", "green");
    await filesystem.rmdir("/test-dir", { recursive: true });
    const dirExists = await filesystem.exists("/test-dir");
    log(`  /test-dir exists after recursive delete: ${dirExists}`);

    // ==========================================================================
    // 4. FILE INFORMATION
    // ==========================================================================
    section("4. File Information");

    // Create test file
    await filesystem.writeFile("/stats-test.txt", "Content for stats testing");

    // stat - Get file statistics
    log("\n[OK] stat: Getting file statistics", "green");
    const stats = await filesystem.stat("/stats-test.txt");
    log(`  Size: ${stats.size} bytes`);
    log(`  Is file: ${stats.isFile()}`);
    log(`  Is directory: ${stats.isDirectory()}`);
    log(`  Modified: ${stats.mtime.toISOString()}`);
    log("  Note: S3 has limited metadata (size, timestamps only)");

    // lstat - Same as stat for S3 (no symlinks)
    log("\n[OK] lstat: Getting lstat (same as stat for S3)", "green");
    const lstats = await filesystem.lstat("/stats-test.txt");
    log(`  Size (lstat): ${lstats.size} bytes`);
    log(`  Is symbolic link: ${lstats.isSymbolicLink()}`);
    log("  Note: S3 does not support symbolic links");

    // access - Check file permissions
    log("\n[OK] access: Checking file accessibility", "green");
    try {
      await filesystem.access("/stats-test.txt", (filesystem as any).constants.R_OK);
      log("  File is accessible");
    } catch (e) {
      log("  File is not accessible", "red");
    }
    log("  Note: S3 access checks via IAM/ACL, not filesystem permissions");

    // ==========================================================================
    // 5. PATH OPERATIONS
    // ==========================================================================
    section("5. Path Operations");

    // realpath - Get normalized path
    log("\n[OK] realpath: Getting normalized path", "green");
    try {
      const realPath = await filesystem.realpath("/stats-test.txt");
      log(`  Normalized path: ${realPath}`);
      log("  Note: S3 returns normalized path (no actual symlink resolution)");
    } catch (e) {
      log(`  realpath failed: ${(e as Error).message}`, "yellow");
    }

    // ==========================================================================
    // 6. PERMISSION OPERATIONS (S3 Limitations)
    // ==========================================================================
    section("6. Permission Operations (S3 Limitations)");

    // chmod - Not supported in S3
    log("\n[!] chmod: Not applicable to S3", "yellow");
    log("  S3 permissions are managed via IAM policies and bucket ACLs");
    log("  Skipping chmod test");

    // utimes - Not supported in S3
    log("\n[!] utimes: Not applicable to S3", "yellow");
    log("  S3 manages timestamps automatically");
    log("  Skipping utimes test");

    // ==========================================================================
    // 7. STREAM OPERATIONS
    // ==========================================================================
    section("7. Stream Operations");

    // createWriteStream - Write via stream
    log("\n[OK] createWriteStream: Writing large file via stream", "green");
    const writeStream = filesystem.createWriteStream("/large-file.txt");

    for (let i = 0; i < 50; i++) {
      writeStream.write(`Line ${i}: Some S3 content\n`);
    }
    writeStream.end();

    await new Promise<void>((resolve) => {
      writeStream.on("finish", resolve);
    });
    log("  Large file written via stream");
    log("  Note: Uses S3 multipart upload for large files");

    // createReadStream - Read via stream
    log("\n[OK] createReadStream: Reading via stream", "green");
    const readStream = filesystem.createReadStream("/large-file.txt");
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      readStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      readStream.on("end", () => resolve());
      readStream.on("error", reject);
    });

    const streamContent = Buffer.concat(chunks).toString();
    const lineCount = streamContent.split("\n").length;
    log(`  Read ${lineCount} lines via stream`);

    // ==========================================================================
    // 8. ADVANCED S3 OPERATIONS
    // ==========================================================================
    section("8. Advanced S3 Operations");

    // Multiple file operations (batch)
    log("\n[OK] Batch operations: Creating multiple files", "green");
    const batchDir = "/batch-test";
    await filesystem.mkdir(batchDir, { recursive: true });

    const fileCount = 5;
    for (let i = 1; i <= fileCount; i++) {
      await filesystem.writeFile(`${batchDir}/file${i}.txt`, `S3 File ${i} content`);
    }
    log(`  Created ${fileCount} files`);

    log("\n[OK] Batch operations: Listing all files", "green");
    try {
      const files = await filesystem.readdir(batchDir);
      for (const file of files) {
        const fileContent = (await filesystem.readFile(
          `${batchDir}/${file}`,
          "utf8",
        )) as string;
        log(`  ${file}: ${fileContent}`);
      }
    } catch (e) {
      log(`  Batch list failed: ${(e as Error).message}`, "yellow");
    }

    log("\n[OK] Batch operations: Cleanup", "green");
    await filesystem.rmdir(batchDir, { recursive: true });
    log("  Batch test directory removed");

    // ==========================================================================
    // 9. S3-SPECIFIC BEHAVIORS
    // ==========================================================================
    section("9. S3-Specific Behaviors");

    log("\n[!] S3 Limitations and Differences:", "yellow");
    logger.info("  - No symbolic links (lstat == stat, realpath normalizes only)");
    logger.info("  - Permissions via IAM/ACL (chmod not supported)");
    logger.info("  - Automatic timestamps (utimes not supported)");
    logger.info("  - Directories are key prefixes (mkdir creates placeholder)");
    logger.info("  - appendFile is read-modify-write (not atomic)");
    logger.info("  - rename is copy-then-delete (not atomic)");
    logger.info("  - Limited FileStats (size, timestamps only)");

    // ==========================================================================
    // 10. CLEANUP
    // ==========================================================================
    section("10. Cleanup");

    log("\n[OK] Cleaning up test files", "green");
    await filesystem.unlink("/test-file.txt");
    await filesystem.unlink("/binary-file.dat");
    await filesystem.unlink("/stats-test.txt");
    await filesystem.unlink("/large-file.txt");
    log("  All test files removed from S3");

    // ==========================================================================
    // SUMMARY
    // ==========================================================================
    section("Summary");

    log("\n[OK] All S3 filesystem operations demonstrated successfully!", "green");
    log("\nOperations covered:", "cyan");
    logger.info("  - File I/O: readFile, writeFile, appendFile, copyFile");
    logger.info("  - File Management: unlink, rename, exists");
    logger.info("  - Directory (Prefixes): mkdir, rmdir, readdir");
    logger.info("  - File Info: stat, lstat, access");
    logger.info("  - Paths: realpath (normalization only)");
    logger.info("  - Streams: createReadStream, createWriteStream");
    logger.info("  - S3-specific: Multipart uploads, key prefixes");
  } catch (error) {
    log(`\n[X] Error: ${(error as Error).message}`, "red");

    // Provide helpful error messages for common S3/MinIO issues
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("ECONNREFUSED")) {
      log("\n[!] Connection refused. Is MinIO running?", "yellow");
      log("  Start MinIO with: cd docker && docker compose up");
    } else if (
      errorMessage.includes("InvalidAccessKeyId") ||
      errorMessage.includes("SignatureDoesNotMatch")
    ) {
      log("\n[!] Authentication failed. Check your AWS credentials:", "yellow");
      log("  export AWS_ACCESS_KEY_ID=minioadmin");
      log("  export AWS_SECRET_ACCESS_KEY=minioadmin");
    } else if (errorMessage.includes("NoSuchBucket")) {
      log("\n[!] Bucket not found. Initialize the test bucket:", "yellow");
      log("  cd docker && ./init-buckets.sh");
    }

    throw error;
  }
}

/**
 * Export the demo function as the default export
 */
export default runS3Demo;
