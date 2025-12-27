/**
 * Filename Sanitizer Utility
 *
 * Sanitizes filenames by replacing unsafe characters with underscore.
 * Prevents path traversal attacks and ensures filesystem compatibility.
 *
 * Unsafe characters: < > : " / \ | ? * @ #
 *
 * @example
 * ```ts
 * sanitizeFilename("my@file#.pdf") // "my_file_.pdf"
 * sanitizeFilename("report:final.docx") // "report_final.docx"
 * ```
 */

/**
 * Sanitize a filename by replacing unsafe characters with underscore
 *
 * @param filename - The original filename from the client
 * @returns Sanitized filename safe for filesystem storage
 */
export function sanitizeFilename(filename: string): string {
  // Windows unsafe characters: < > : " / \ | ? *
  // Additional characters from clarification: @ #
  // Path separators: / \
  const unsafeChars = /[<>:"/\\|?*#@]/g;

  return filename.replace(unsafeChars, "_");
}

/**
 * Check if a filename contains only safe characters
 *
 * @param filename - The filename to check
 * @returns true if filename is safe, false otherwise
 */
export function isFilenameSafe(filename: string): boolean {
  const unsafeChars = /[<>:"/\\|?*#@]/g;
  return !unsafeChars.test(filename);
}
