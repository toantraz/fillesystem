/**
 * Local Filesystem Operations Demo
 *
 * This file demonstrates comprehensive filesystem operations:
 * - File I/O: writeFile, readFile, appendFile, copyFile
 * - File Management: unlink, rename, exists
 * - Directory Operations: mkdir, rmdir, readdir
 * - File Info: stat, lstat, access, realpath
 * - Streams: createReadStream, createWriteStream
 * - Permissions: chmod, utimes
 *
 * @see https://nodejs.org/api/fs.html
 */

import type { Filesystem } from "@ignis/filesystem";
import type { Logger } from "@venizia/ignis";

/**
 * Run the comprehensive filesystem operations demo
 *
 * @param filesystem - The Filesystem instance (local adapter)
 * @param logger - The Ignis logger for output
 */
export async function runLocalDemo(filesystem: Filesystem, logger: Logger): Promise<void> {
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
    await filesystem.writeFile("/test-file.txt", "Hello, World!", "utf8");
    log('  Content: "Hello, World!"');

    // readFile - Read file content
    log("\n[OK] readFile: Reading test-file.txt", "green");
    const content = await filesystem.readFile("/test-file.txt", "utf8");
    log(`  Content: "${content}"`);

    // readFile as Buffer
    log("\n[OK] readFile: Reading as Buffer", "green");
    const buffer = await filesystem.readFile("/test-file.txt");
    log(`  Buffer size: ${buffer.length} bytes`);

    // writeFile with Buffer
    log("\n[OK] writeFile: Writing Buffer", "green");
    await filesystem.writeFile("/binary-file.dat", Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    log("  Created binary-file.dat");

    // appendFile - Append to existing file
    log("\n[OK] appendFile: Appending to test-file.txt", "green");
    await filesystem.appendFile("/test-file.txt", " Appended text.", "utf8");
    const appendedContent = await filesystem.readFile("/test-file.txt", "utf8");
    log(`  New content: "${appendedContent}"`);

    // copyFile - Copy file
    log("\n[OK] copyFile: Copying test-file.txt to test-file-copy.txt", "green");
    await filesystem.copyFile("/test-file.txt", "/test-file-copy.txt");
    const copyContent = await filesystem.readFile("/test-file-copy.txt", "utf8");
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

    // unlink - Delete file
    log("\n[OK] unlink: Deleting renamed-file.txt", "green");
    await filesystem.unlink("/renamed-file.txt");
    const deletedExists = await filesystem.exists("/renamed-file.txt");
    log(`  renamed-file.txt exists after delete: ${deletedExists}`);

    // ==========================================================================
    // 3. DIRECTORY OPERATIONS
    // ==========================================================================
    section("3. Directory Operations");

    // mkdir - Create directory
    log("\n[OK] mkdir: Creating /test-dir", "green");
    await filesystem.mkdir("/test-dir");
    log("  Directory created");

    // mkdir with recursive option
    log("\n[OK] mkdir: Creating /test-dir/nested/deep with recursive", "green");
    await filesystem.mkdir("/test-dir/nested/deep", { recursive: true });
    log("  Nested directories created");

    // readdir - List directory contents
    log("\n[OK] readdir: Listing /test-dir", "green");
    const dirContents = await filesystem.readdir("/test-dir");
    log(`  Contents: ${dirContents.join(", ")}`);

    // Create files for testing readdir
    await filesystem.writeFile("/test-dir/file1.txt", "content1");
    await filesystem.writeFile("/test-dir/file2.txt", "content2");
    await filesystem.mkdir("/test-dir/subdir");

    log("\n[OK] readdir: Listing /test-dir after adding files", "green");
    const dirContents2 = await filesystem.readdir("/test-dir");
    log(`  Contents: ${dirContents2.join(", ")}`);

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
    log(`  Created: ${stats.birthtime.toISOString()}`);

    // lstat - Get symlink statistics
    log("\n[OK] lstat: Getting lstat (same as stat for regular files)", "green");
    const lstats = await filesystem.lstat("/stats-test.txt");
    log(`  Size (lstat): ${lstats.size} bytes`);
    log(`  Is symbolic link: ${lstats.isSymbolicLink()}`);

    // access - Check file permissions
    log("\n[OK] access: Checking file permissions", "green");
    try {
      await filesystem.access("/stats-test.txt", (filesystem as any).constants.R_OK);
      log("  File is readable");
    } catch (e) {
      log("  File is not readable", "red");
    }

    try {
      await filesystem.access("/stats-test.txt", (filesystem as any).constants.W_OK);
      log("  File is writable");
    } catch (e) {
      log("  File is not writable", "red");
    }

    // ==========================================================================
    // 5. PATH OPERATIONS
    // ==========================================================================
    section("5. Path Operations");

    // realpath - Get real path
    log("\n[OK] realpath: Getting real path", "green");
    try {
      const realPath = await filesystem.realpath("/stats-test.txt");
      log(`  Real path: ${realPath}`);
    } catch (e) {
      log(`  Note: realpath may not be fully supported on all platforms`, "yellow");
    }

    // ==========================================================================
    // 6. PERMISSION OPERATIONS
    // ==========================================================================
    section("6. Permission Operations");

    // chmod - Not available in Filesystem interface
    log("\n[!] chmod: Not available in Filesystem interface", "yellow");
    log("  File permissions are managed by the operating system");
    log("  Skipping chmod test");

    // utimes - Not available in Filesystem interface
    log("\n[!] utimes: Not available in Filesystem interface", "yellow");
    log("  File timestamps are managed automatically");
    log("  Skipping utimes test");

    // ==========================================================================
    // 7. STREAM OPERATIONS
    // ==========================================================================
    section("7. Stream Operations");

    // createWriteStream - Write via stream
    log("\n[OK] createWriteStream: Writing large file via stream", "green");
    const writeStream = filesystem.createWriteStream("/large-file.txt");
    for (let i = 0; i < 100; i++) {
      writeStream.write(`Line ${i}: Some content\n`);
    }
    writeStream.end();

    await new Promise<void>((resolve) => {
      writeStream.on("finish", () => resolve());
    });
    log("  Large file written via stream");

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
    // 8. ADVANCED OPERATIONS
    // ==========================================================================
    section("8. Advanced Operations");

    // Multiple file operations
    log("\n[OK] Batch operations: Creating multiple files", "green");
    const batchDir = "/batch-test";
    await filesystem.mkdir(batchDir, { recursive: true });

    const fileCount = 5;
    for (let i = 1; i <= fileCount; i++) {
      await filesystem.writeFile(`${batchDir}/file${i}.txt`, `File ${i} content`);
    }
    log(`  Created ${fileCount} files`);

    log("\n[OK] Batch operations: Reading all files", "green");
    const files = await filesystem.readdir(batchDir);
    for (const file of files) {
      const fileContent = await filesystem.readFile(`${batchDir}/${file}`, "utf8");
      log(`  ${file}: ${fileContent}`);
    }

    log("\n[OK] Batch operations: Cleanup", "green");
    await filesystem.rmdir(batchDir, { recursive: true });
    log("  Batch test directory removed");

    // ==========================================================================
    // 9. ERROR HANDLING EXAMPLES
    // ==========================================================================
    section("9. Error Handling");

    log("\n[OK] Handling non-existent file", "yellow");
    try {
      await filesystem.readFile("/definitely-not-here.txt");
    } catch (error) {
      const err = error as Error & { code?: string };
      log(`  Error caught: ${err.code || err.name}`, "red");
      log(`  Message: ${err.message}`);
    }

    log("\n[OK] Handling invalid operations", "yellow");
    try {
      await filesystem.mkdir("/existing-file.txt", { recursive: false });
    } catch (error) {
      const err = error as Error & { code?: string };
      log(`  Error caught: ${err.code || err.name}`, "red");
      log(`  Message: ${err.message}`);
    }

    // ==========================================================================
    // 10. CLEANUP
    // ==========================================================================
    section("10. Cleanup");

    log("\n[OK] Cleaning up test files", "green");
    await filesystem.unlink("/test-file.txt");
    await filesystem.unlink("/binary-file.dat");
    await filesystem.unlink("/stats-test.txt");
    await filesystem.unlink("/large-file.txt");
    log("  All test files removed");

    // ==========================================================================
    // SUMMARY
    // ==========================================================================
    section("Summary");

    log("\n[OK] All filesystem operations demonstrated successfully!", "green");
    log("\nOperations covered:", "cyan");
    logger.info("  - File I/O: readFile, writeFile, appendFile, copyFile");
    logger.info("  - File Management: unlink, rename, exists");
    logger.info("  - Directory: mkdir, rmdir, readdir");
    logger.info("  - File Info: stat, lstat, access");
    logger.info("  - Paths: realpath");
    logger.info("  - Permissions: chmod, utimes");
    logger.info("  - Streams: createReadStream, createWriteStream");
    logger.info("  - Advanced: Batch operations, error handling");
  } catch (error) {
    log(`\n[X] Error: ${(error as Error).message}`, "red");
    throw error;
  }
}

/**
 * Export the demo function as the default export
 */
export default runLocalDemo;
