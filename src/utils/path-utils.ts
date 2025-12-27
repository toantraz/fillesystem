/**
 * Path Utility Functions
 *
 * Utilities for normalizing and manipulating file paths across storage backends.
 */

import { ValidationError } from "../errors/filesystem-errors";

/**
 * Normalize a path for consistent handling
 * - Converts backslashes to forward slashes
 * - Removes duplicate slashes
 * - Removes trailing slashes (except for root)
 * - Resolves . and .. segments
 * - Ensures path starts with / for absolute paths
 */
export function normalizePath(path: string): string {
  if (typeof path !== "string") {
    throw new ValidationError(`Path must be a string, got ${typeof path}`);
  }

  // Handle empty path
  if (path === "") {
    return ".";
  }

  // Convert backslashes to forward slashes
  let normalized = path.replace(/\\/g, "/");

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, "/");

  // Handle absolute paths on Windows (e.g., C:/)
  const windowsDriveMatch = normalized.match(/^([a-zA-Z]):\//);
  const hasWindowsDrive = windowsDriveMatch !== null;

  // Split into segments
  const segments = normalized.split("/");
  const result: string[] = [];

  for (const segment of segments) {
    if (segment === "" || segment === ".") {
      // Skip empty segments and current directory markers
      continue;
    }

    if (segment === "..") {
      // Go up one directory
      if (result.length > 0 && result[result.length - 1] !== "..") {
        result.pop();
      } else {
        result.push("..");
      }
    } else {
      result.push(segment);
    }
  }

  // Reconstruct path
  normalized = result.join("/");

  // Handle special cases
  if (normalized === "") {
    normalized = ".";
  }

  // Restore Windows drive prefix if present
  if (hasWindowsDrive && windowsDriveMatch) {
    normalized = `${windowsDriveMatch[0]}${normalized}`;
  }

  return normalized;
}

/**
 * Join multiple path segments
 */
export function joinPath(...segments: string[]): string {
  if (segments.length === 0) {
    return ".";
  }

  // Filter out empty segments
  const nonEmptySegments = segments.filter(segment => segment !== "");

  if (nonEmptySegments.length === 0) {
    return ".";
  }

  // Join with forward slashes and normalize
  const joined = nonEmptySegments.join("/");
  return normalizePath(joined);
}

/**
 * Get the directory name from a path
 */
export function dirname(path: string): string {
  const normalized = normalizePath(path);

  // Handle root and current directory
  if (normalized === "/" || normalized === "." || normalized === "..") {
    return normalized;
  }

  const lastSlashIndex = normalized.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return ".";
  }

  const dir = normalized.substring(0, lastSlashIndex);
  return dir || "/";
}

/**
 * Get the base name from a path
 */
export function basename(path: string, ext?: string): string {
  const normalized = normalizePath(path);

  // Handle root and special directories
  if (normalized === "/") {
    return "";
  }

  if (normalized === "." || normalized === "..") {
    return normalized;
  }

  const lastSlashIndex = normalized.lastIndexOf("/");
  const base = lastSlashIndex === -1 ? normalized : normalized.substring(lastSlashIndex + 1);

  // Remove extension if specified
  if (ext && base.endsWith(ext)) {
    return base.substring(0, base.length - ext.length);
  }

  return base;
}

/**
 * Get the extension from a path
 */
export function extname(path: string): string {
  const base = basename(path);
  const lastDotIndex = base.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return "";
  }

  return base.substring(lastDotIndex);
}

/**
 * Check if a path is absolute
 */
export function isAbsolute(path: string): boolean {
  if (typeof path !== "string") {
    return false;
  }

  // Unix absolute path
  if (path.startsWith("/")) {
    return true;
  }

  // Windows absolute path (drive letter)
  if (/^[a-zA-Z]:[\\/]/.test(path)) {
    return true;
  }

  return false;
}

/**
 * Resolve a path relative to a base directory
 */
export function resolvePath(base: string, relativePath: string): string {
  const normalizedBase = normalizePath(base);
  const normalizedRelative = normalizePath(relativePath);

  if (isAbsolute(normalizedRelative)) {
    return normalizedRelative;
  }

  return joinPath(normalizedBase, normalizedRelative);
}

/**
 * Convert a path to be relative to a base directory
 */
export function relativePath(from: string, to: string): string {
  const normalizedFrom = normalizePath(from);
  const normalizedTo = normalizePath(to);

  // Handle identical paths
  if (normalizedFrom === normalizedTo) {
    return ".";
  }

  // Split into segments
  const fromSegments = normalizedFrom.split("/").filter(s => s !== "");
  const toSegments = normalizedTo.split("/").filter(s => s !== "");

  // Find common prefix
  let commonLength = 0;
  const minLength = Math.min(fromSegments.length, toSegments.length);

  while (commonLength < minLength && fromSegments[commonLength] === toSegments[commonLength]) {
    commonLength++;
  }

  // Build relative path
  const upLevels = fromSegments.length - commonLength;
  const downSegments = toSegments.slice(commonLength);

  const resultSegments: string[] = [];

  // Add up levels
  for (let i = 0; i < upLevels; i++) {
    resultSegments.push("..");
  }

  // Add down segments
  resultSegments.push(...downSegments);

  // Handle empty result
  if (resultSegments.length === 0) {
    return ".";
  }

  return resultSegments.join("/");
}

/**
 * Validate a path for common issues
 */
export function validatePath(path: string): { isValid: boolean; error?: string } {
  if (typeof path !== "string") {
    return { isValid: false, error: "Path must be a string" };
  }

  // Check for null characters
  if (path.includes("\0")) {
    return { isValid: false, error: "Path contains null character" };
  }

  // Check for invalid characters (OS-dependent, basic check)
  // This is a basic check; actual validation depends on the storage backend
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path)) {
    return { isValid: false, error: "Path contains invalid characters" };
  }

  // Check for reserved names on Windows
  const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  const base = basename(path);
  if (windowsReservedNames.test(base)) {
    return { isValid: false, error: "Path uses reserved Windows name" };
  }

  return { isValid: true };
}
