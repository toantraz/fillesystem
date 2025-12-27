# Quick Start: Ignis Filesystem Component

**Feature**: `003-ignis-filesystem-component`  
**Date**: 2025-12-23

## Installation

```bash
# Install the component package
npm install @ignis/filesystem

# Install peer dependencies (if not already installed)
npm install @ignis/core

# For S3 support (optional)
npm install @aws-sdk/client-s3
```

## Basic Usage

### 1. Register the Component

```typescript
import { Application } from "@ignis/core";
import { FilesystemComponent } from "@ignis/filesystem";

const app = new Application();

// Register the filesystem component
app.component(FilesystemComponent);

// Configure for local filesystem (development)
app.configure({
  filesystem: {
    defaultAdapter: "local",
    adapters: {
      local: {
        type: "local",
        local: { basePath: "./storage" },
      },
    },
  },
});

// Start the application
await app.start();
```

### 2. Inject and Use Filesystem

```typescript
import { inject } from "@ignis/core";
import { Filesystem } from "@ignis/filesystem";

class MyService {
  constructor(
    @inject("filesystem.instance.default")
    private filesystem: Filesystem,
  ) {}

  async saveData(data: string) {
    // Write to file
    await this.filesystem.writeFile("data.txt", data);

    // Read from file
    const content = await this.filesystem.readFile("data.txt", "utf-8");
    return content;
  }
}
```

## Configuration Examples

### Local Filesystem (Development)

```yaml
# config/development.yaml
filesystem:
  defaultAdapter: "local"
  healthCheckEnabled: true
  logLevel: "debug"
  adapters:
    local:
      type: "local"
      local:
        basePath: "./storage"
        createMissingDirs: true
      options:
        timeout: 30000
        retries: 3
```

### S3 Storage (Production)

```yaml
# config/production.yaml
filesystem:
  defaultAdapter: "s3"
  healthCheckEnabled: true
  logLevel: "info"
  adapters:
    s3:
      type: "s3"
      s3:
        bucket: "my-app-production"
        region: "us-east-1"
        prefix: "uploads/"
      options:
        timeout: 60000
        retries: 5
```

**Important**: For S3, set these environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1  # Optional if specified in config
```

### Multiple Adapters

```typescript
app.configure({
  filesystem: {
    defaultAdapter: "local",
    adapters: {
      local: {
        type: "local",
        local: { basePath: "./storage" },
      },
      s3: {
        type: "s3",
        s3: { bucket: "backups", region: "us-west-2" },
      },
    },
  },
});

// Inject specific adapter
class BackupService {
  constructor(
    @inject("filesystem.instance.s3")
    private backupStorage: Filesystem,
  ) {}
}
```

## Dependency Injection

### Available Binding Keys

```typescript
// Default filesystem instance
@inject('filesystem.instance.default')

// Named adapter instance
@inject('filesystem.instance.{adapterName}')

// Component instance (advanced usage)
@inject('filesystem.component.instance')

// Configuration
@inject('filesystem.component.config')
```

### Service Example

```typescript
import { injectable, inject } from "@ignis/core";
import { Filesystem, FilesystemComponent } from "@ignis/filesystem";

@injectable()
class DocumentService {
  constructor(
    @inject("filesystem.instance.default")
    private filesystem: Filesystem,

    @inject("filesystem.component.instance")
    private component: FilesystemComponent,
  ) {}

  async processDocument(path: string) {
    // Check health before operation
    const health = await this.component.healthCheck();
    if (health.status !== "healthy") {
      throw new Error("Storage backend unavailable");
    }

    // Process file
    const content = await this.filesystem.readFile(path, "utf-8");
    // ... process content
    await this.filesystem.writeFile(`processed/${path}`, processedContent);
  }
}
```

## Health Checks

The component integrates with Ignis health check system:

```typescript
// Manual health check
const health = await app.get("filesystem.health.check").check();
console.log(health.status); // 'healthy', 'degraded', or 'unhealthy'

// Automatic health checks (if enabled in config)
// Component performs read/write tests periodically
```

## Error Handling

```typescript
import { FilesystemComponentError } from "@ignis/filesystem";

try {
  await filesystem.writeFile("/path/to/file.txt", "content");
} catch (error) {
  if (error instanceof FilesystemComponentError) {
    console.error(`Component error: ${error.message}`);
    console.error(`Original cause: ${error.cause?.message}`);
    console.error(`Adapter: ${error.adapterType}`);
  }
  throw error;
}
```

## Testing

### Unit Tests

```typescript
import { FilesystemComponent } from "@ignis/filesystem";
import { Application } from "@ignis/core";

describe("FilesystemComponent", () => {
  let app: Application;
  let component: FilesystemComponent;

  beforeEach(async () => {
    app = new Application();
    app.component(FilesystemComponent);
    app.configure({
      filesystem: {
        defaultAdapter: "local",
        adapters: {
          local: { type: "local", local: { basePath: "./test-storage" } },
        },
      },
    });
    await app.start();
    component = await app.get("filesystem.component.instance");
  });

  it("should perform health check", async () => {
    const health = await component.healthCheck();
    expect(health.status).toBe("healthy");
  });
});
```

### Integration Tests

```typescript
describe("Filesystem Integration", () => {
  it("should inject filesystem into service", async () => {
    const app = new Application();
    app.component(FilesystemComponent);

    class TestService {
      constructor(@inject("filesystem.instance.default") public fs: Filesystem) {}
    }

    app.service(TestService);
    await app.start();

    const service = await app.get(TestService);
    expect(service.fs).toBeDefined();
  });
});
```

## Common Patterns

### Environment-Specific Configuration

```typescript
// config/index.ts
const config = {
  development: {
    filesystem: {
      defaultAdapter: "local",
      adapters: {
        local: { type: "local", local: { basePath: "./storage" } },
      },
    },
  },
  test: {
    filesystem: {
      defaultAdapter: "local",
      adapters: {
        local: { type: "local", local: { basePath: "./test-storage" } },
      },
    },
  },
  production: {
    filesystem: {
      defaultAdapter: "s3",
      adapters: {
        s3: { type: "s3", s3: { bucket: "my-app", region: "us-east-1" } },
      },
    },
  },
};

app.configure(config[process.env.NODE_ENV || "development"]);
```

### File Upload Service

```typescript
@injectable()
class FileUploadService {
  constructor(
    @inject("filesystem.instance.default")
    private filesystem: Filesystem,
  ) {}

  async uploadFile(filename: string, content: Buffer | string) {
    const path = `uploads/${Date.now()}-${filename}`;
    await this.filesystem.writeFile(path, content);

    // Get file metadata
    const stats = await this.filesystem.stat(path);

    return {
      path,
      size: stats.size,
      uploadedAt: stats.mtime,
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **"Adapter not found" error**
   - Ensure adapter is configured in `adapters` object
   - Check that `defaultAdapter` matches a key in `adapters`

2. **S3 connection failures**
   - Verify environment variables are set: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - Check bucket permissions and region
   - Ensure network connectivity to AWS S3

3. **Health check failures**
   - Verify storage backend is accessible
   - Check permissions for read/write operations
   - Review health check timeout settings

4. **Dependency injection errors**
   - Ensure component is registered before services that depend on it
   - Verify binding keys match injection tokens

### Debugging

Enable debug logging:

```yaml
filesystem:
  logLevel: "debug"
```

Check component status:

```typescript
const component = await app.get("filesystem.component.instance");
console.log(component.getConfig());
const health = await component.healthCheck();
console.log(health);
```

## Next Steps

1. **Explore advanced features**:
   - Custom adapter implementation
   - File operation event hooks
   - Advanced caching strategies

2. **Production readiness**:
   - Set up monitoring and alerts
   - Configure backup strategies
   - Implement disaster recovery procedures

3. **Performance optimization**:
   - Tune adapter options (timeout, retries)
   - Implement connection pooling
   - Add caching layer

## Support

- **Documentation**: See full API documentation
- **Issues**: Report bugs on GitHub
- **Community**: Join Ignis framework community channels
