/**
 * Filesystem interface compatible with Node.js fs module
 * Provides a subset of the most commonly used fs methods
 */
export interface Filesystem {
  // File operations
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
  appendFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
  unlink(path: string): Promise<void>;
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;

  // Directory operations
  readdir(path: string): Promise<string[]>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;

  // File info operations
  stat(path: string): Promise<FileStats>;
  lstat(path: string): Promise<FileStats>;
  access(path: string, mode?: number): Promise<void>;

  // Stream operations (simplified)
  createReadStream(path: string, options?: any): any;
  createWriteStream(path: string, options?: any): any;

  // Utility methods
  exists(path: string): Promise<boolean>;
  realpath(path: string): Promise<string>;
}

/**
 * File statistics interface matching Node.js fs.Stats
 */
export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isSymbolicLink(): boolean;
  isFIFO(): boolean;
  isSocket(): boolean;

  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}

/**
 * Filesystem configuration options
 */
export interface FilesystemConfig {
  type: "local" | "s3";
  local?: {
    basePath?: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
  };
}

/**
 * Filesystem factory options
 */
export interface FilesystemOptions {
  config: FilesystemConfig;
}
