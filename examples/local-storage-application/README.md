# Local Storage Example Application

A complete, runnable example application demonstrating how to integrate and use the `@ignis/filesystem` component with local storage within an Ignis application.

## Overview

This example demonstrates:

- **Component Registration**: How to register the FilesystemComponent with an Ignis Application
- **Dependency Injection**: How to inject the filesystem into your services using `@Inject()` decorator
- **Configuration**: How to configure the filesystem for local and S3 storage adapters
- **Lifecycle Management**: How the component lifecycle (initialize, start, stop) works
- **File Operations**: How to perform common file operations (read, write, delete, list, etc.)

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **TypeScript**: 5.0.0 or higher (installed via dev dependencies)

## Installation

### 1. Navigate to the Example Directory

```bash
cd examples/local-storage-application
```

### 2. Install Dependencies

```bash
npm install
```

This installs:

- `@venizia/ignis` - Core Ignis framework
- `@ignis/filesystem` - Filesystem component (from workspace)
- TypeScript and development tools

## Running the Example

### Local Filesystem (Default)

The example is configured to use local filesystem by default.

```bash
npm start
```

Or for development with ts-node:

```bash
npm run dev
```

### Expected Output

```
=== Ignis Filesystem Example Application ===

[INFO] Configuration loaded: { type: 'local', local: { basePath: './storage', createMissingDirs: true } }
[INFO] Registering FilesystemComponent...
[INFO] Starting application...
[INFO] FilesystemComponent initialized successfully
[INFO] FilesystemComponent started successfully

=== Running Filesystem Operations Demo ===

[DEMO] Writing file: /test-file.txt
[DEMO] ✓ File written successfully
[DEMO] Reading file: /test-file.txt
[DEMO] ✓ File content: "Hello from Ignis Filesystem!"
[DEMO] Checking if file exists: /test-file.txt
[DEMO] ✓ File exists: true
[DEMO] Getting file stats: /test-file.txt
[DEMO] ✓ File size: 31 bytes
[DEMO] Listing directory: /
[DEMO] ✓ Directory contents: ["test-file.txt"]
[DEMO] Deleting file: /test-file.txt
[DEMO] ✓ File deleted successfully

=== Demo Complete ===

[INFO] Stopping application...
[INFO] Application stopped successfully
```

## Switching Adapters

### How Adapter Switching Works

One of the key benefits of the FilesystemComponent is that you can switch between storage backends by changing only the configuration - **no code changes required**!

### Switching to S3

**Option 1: Modify configuration file**

Edit `config/local.yaml` and change:

```yaml
filesystem:
  type: "s3" # Change from 'local' to 's3'
  s3:
    bucket: "your-bucket-name"
    region: "us-east-1"
    prefix: "example/"
```

Or use `config/s3.yaml` directly.

**Option 2: Modify inline configuration**

Edit `src/index.ts` and change the `inlineConfig` object from:

```typescript
type: 'local',
local: { basePath: './storage', createMissingDirs: true }
```

To:

```typescript
type: 's3',
s3: { bucket: 'your-bucket', region: 'us-east-1', prefix: 'example/' }
```

### Setting S3 Credentials

For S3, set these environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### Key Point

**The same code works with both adapters!** All filesystem operations (readFile, writeFile, etc.) work identically whether you're using local storage or S3. This abstraction allows you to:

- Develop locally with the local adapter
- Deploy to production with S3
- Switch between environments without code changes

## Configuration Files

The example includes configuration files for both local and S3 adapters in both YAML and JSON formats:

| File                | Description                           |
| ------------------- | ------------------------------------- |
| `config/local.yaml` | Local filesystem configuration (YAML) |
| `config/local.json` | Local filesystem configuration (JSON) |
| `config/s3.yaml`    | S3 configuration (YAML)               |
| `config/s3.json`    | S3 configuration (JSON)               |

## Code Structure

```
examples/local-storage-application/
├── src/
│   ├── index.ts            # Entry point - creates app and runs demo
│   ├── app.ts              # ExampleApplication class
│   └── services/
│       └── file-service.ts # FileService demonstrating DI
├── config/                 # Configuration files
├── storage/                # Default local storage directory
├── package.json
├── tsconfig.json
└── README.md
```

## Adding Your Own Service

To add your own service that uses the filesystem, follow these steps:

### Step 1: Create the Service File

Create a new service file in `src/services/` (e.g., `my-custom-service.ts`):

```typescript
import { Inject } from "@venizia/ignis";
import { Filesystem } from "@ignis/filesystem";

/**
 * My Custom Service
 *
 * This service demonstrates how to create your own service that uses
 * the injected filesystem for your business logic.
 */
export class MyCustomService {
  private filesystem: Filesystem;

  /**
   * Constructor - Dependency Injection
   *
   * The @Inject() decorator tells Ignis to inject the filesystem instance.
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
   * Example: Process a file
   *
   * This method demonstrates how to use the injected filesystem
   * for your own business logic.
   */
  async processFile(path: string): Promise<string> {
    // Read the file
    const content = await this.filesystem.readFile(path, "utf8");

    // Your business logic here
    const processed = content.toUpperCase();

    // Write the processed content
    await this.filesystem.writeFile(path + ".processed", processed, "utf8");

    return processed;
  }

  /**
   * Example: Backup a file
   *
   * Another example of using the filesystem.
   */
  async backupFile(path: string): Promise<void> {
    const content = await this.filesystem.readFile(path, "utf8");
    await this.filesystem.writeFile(`/backup/${path}`, content, "utf8");
  }
}
```

### Step 2: Register Your Service (Optional)

In a real Ignis application, you would register your service with the DI container in `src/app.ts`:

```typescript
import { MyCustomService } from "./services/my-custom-service";

// In the registerComponents method:
this.app.bind("my-custom-service").to(MyCustomService);
```

Then you can resolve it when needed:

```typescript
const myService = await this.app.get<MyCustomService>("my-custom-service");
await myService.processFile("/some-file.txt");
```

### Step 3: Use Your Service

For this example, you can simply create and use the service directly (as shown in the FileService).

### Key Points

1. **Constructor Injection**: Use `@Inject('filesystem.instance.default')` in your constructor to get the filesystem
2. **Type Safety**: TypeScript ensures the filesystem is correctly typed
3. **Loose Coupling**: Your service doesn't need to know which adapter (local/S3) is being used
4. **Testability**: You can easily inject a mock filesystem for testing

## Understanding the Integration Patterns

### Component Registration

The `FilesystemComponent` is registered with the Ignis Application:

```typescript
import { Application } from "@venizia/ignis";
import { FilesystemComponent } from "@ignis/filesystem";

const app = new Application();
app.component(FilesystemComponent);
app.configure({ filesystem: config });
await app.start();
```

### Dependency Injection

Services can inject the filesystem using the `@Inject()` decorator:

```typescript
import { Inject } from "@venizia/ignis";
import { Filesystem } from "@ignis/filesystem";

class FileService {
  constructor(
    @Inject("filesystem.instance.default")
    private filesystem: Filesystem,
  ) {}

  async writeFile(path: string, content: string) {
    await this.filesystem.writeFile(path, content);
  }
}
```

### Configuration Loading Priority

The example loads configuration in this order:

1. Try `config/local.yaml` or `config/local.json`
2. If not found, try `config/s3.yaml` or `config/s3.json`
3. If no config files found, use inline default configuration

## Common Issues

### "Configuration file not found"

This is expected if you don't have config files. The example falls back to inline defaults:

```
[WARN] Configuration file not found: config/local.yaml
[WARN] Using inline default configuration
```

### "Missing AWS credentials"

When using S3, make sure environment variables are set:

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### "Permission denied"

Make sure the local storage directory is writable:

```bash
mkdir -p ./storage
chmod u+w ./storage
```

## Next Steps

1. **Explore the code**: Read through `src/index.ts`, `src/app.ts`, and `src/services/file-service.ts`
2. **Modify the example**: Add your own file operations
3. **Create your own service**: Add a new service that injects the filesystem
4. **Switch adapters**: Try switching between local and S3 configurations

## Sources

- **@venizia/ignis npm**: https://www.npmjs.com/package/@venizia/ignis
- **@ignis/filesystem**: Main filesystem library
