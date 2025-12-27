# Research: S3 Filesystem Example with MinIO

**Feature**: 001-s3-example
**Date**: 2025-12-24

## Overview

This document consolidates research findings for implementing the S3/MinIO example. All unknowns from the Technical Context have been resolved.

---

## 1. MinIO Docker Setup

### Decision: Use MinIO Official Docker Image with Docker Compose

**Chosen**: `minio/minio:latest` with Docker Compose orchestration

**Rationale**:

- Official image maintained by MinIO team
- Automatic updates with latest stable releases
- Excellent documentation and community support
- Lightweight (~100MB compressed)

**Alternatives Considered**:

- `minio/minio:RELEASE.2024-*`: Specific version tag (more stable, less automatic updates)
- Self-built MinIO from source: More control but higher maintenance burden

**Implementation Details**:

```yaml
# docker-compose.yml structure
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000" # API
      - "9001:9001" # Console
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
```

---

## 2. Bucket Initialization

### Decision: Use Entrypoint Script with MinIO Client (mc)

**Chosen**: Shell script that waits for MinIO to be ready, then uses `mc` to create bucket

**Rationale**:

- MinIO provides official `mc` (MinIO Client) image for admin operations
- Idempotent: script can be run multiple times safely
- Can verify bucket creation before proceeding
- Allows custom bucket policies if needed

**Alternatives Considered**:

- AWS CLI with `--endpoint-url`: Requires additional AWS package, heavier
- Application-side bucket creation: Creates circular dependency (app needs bucket, bucket needs app)
- Manual bucket creation: Not automated, violates "single command setup" requirement

**Implementation Details**:

```bash
# init-buckets.sh structure
- Wait for MinIO API to be ready (health check)
- Configure mc alias for local MinIO
- Create bucket "test-bucket"
- Verify creation succeeded
```

---

## 3. S3 Adapter Configuration

### Decision: Use Existing S3 Adapter from @ignis/filesystem

**Chosen**: Leverage existing `s3-adapter.ts` in the core package

**Rationale**:

- Already implements Filesystem interface
- Supports S3Config with endpoint URL override
- Handles AWS SDK v3 client configuration
- Tested and maintained

**Configuration Requirements**:

```typescript
{
  type: 's3',
  s3: {
    bucket: 'test-bucket',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin'
    },
    endpoint: 'http://localhost:9000',
    forcePathStyle: true  // Required for MinIO
  }
}
```

---

## 4. Path-Style Access

### Decision: Force Path-Style for MinIO Compatibility

**Chosen**: Set `forcePathStyle: true` in S3 client configuration

**Rationale**:

- MinIO uses path-style: `http://localhost:9000/bucket/key`
- AWS S3 uses virtual-hosted style: `http://bucket.s3.amazonaws.com/key`
- Without this flag, AWS SDK attempts virtual-hosted style which fails with MinIO
- Required for any S3-compatible storage that's not actual AWS S3

**Alternatives Considered**:

- DNS aliasing for virtual-hosted style: Too complex for local development
- Proxy/rewrite layer: Unnecessary overhead

**Technical Detail**:

```typescript
// In S3Client configuration
const client = new S3Client({
  endpoint: "http://localhost:9000",
  forcePathStyle: true, // ← Critical for MinIO
  // ...
});
```

---

## 5. Environment Variables

### Decision: Use Standard AWS Credential Variable Names

**Chosen**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

**Rationale**:

- AWS SDK v3 automatically detects these environment variables
- Industry standard - works with real AWS credentials if needed
- No custom variable names or parsing logic
- Compatible with credential files and profiles

**Alternatives Considered**:

- Custom `MINIO_*` variables: Would require custom credential loading code
- Config file only: Less flexible for CI/CD environments

**Configuration Loading Priority**:

1. Environment variables (highest)
2. Config file (s3.json)
3. Inline defaults (fallback)

---

## 6. Edge Case Handling

### Decision: Graceful Degradation with Clear Error Messages

**Chosen**: Validate MinIO connectivity at startup, fail fast with helpful errors

**Scenarios Covered**:

| Scenario              | Behavior                                                            |
| --------------------- | ------------------------------------------------------------------- |
| Docker not installed  | Clear error: "Docker required. Install from docker.com"             |
| Port already in use   | Docker Compose error with port conflict details                     |
| MinIO not started     | Wait timeout with "Start MinIO first: docker compose up"            |
| Wrong credentials     | AWS error wrapped: "Authentication failed. Check AWS_ACCESS_KEY_ID" |
| Network issues        | Timeout with "Cannot reach MinIO at http://localhost:9000"          |
| Bucket already exists | Idempotent: continue if bucket exists with correct permissions      |

---

## 7. Additional Technical Findings

### MinIO Console Access

- Console runs on port 9001
- Browse to `http://localhost:9001`
- Login with minioadmin/minioadmin
- Can manually verify bucket contents and file operations

### Filesystem Operations to Demonstrate

All operations from existing Filesystem interface:

- `writeFile(path, content)` - Upload file to S3
- `readFile(path)` - Download file from S3
- `exists(path)` - Check if key exists in bucket
- `stat(path)` - Get object metadata (size, last modified)
- `readdir(path)` - List objects with prefix
- `unlink(path)` - Delete object from bucket

### Application Structure Decision

Reuse existing Ignis application pattern from `examples/ignis-application`:

- Same BaseApplication extension
- Same FilesystemComponent registration
- Same preConfigure/postConfigure lifecycle
- Only difference: S3 config instead of local config

---

## Summary

All research items resolved. Key technical decisions:

1. **MinIO latest** with Docker Compose
2. **mc-based** bucket initialization script
3. **forcePathStyle: true** for MinIO compatibility
4. **Standard AWS** environment variables
5. **Fail-fast** error handling with clear messages

Ready to proceed to Phase 1: Design & Contracts.
