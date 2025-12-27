# Data Model: S3 Filesystem Example with MinIO

**Feature**: 001-s3-example
**Date**: 2025-12-24

## Overview

This is an example/demo application, so there is no persistent application data model. The "data" in this context consists of:

1. Configuration files (Docker, S3 config)
2. Test files stored in MinIO during the demo

---

## Configuration Entities

### S3Config

S3 connection configuration for the filesystem adapter.

| Field                            | Type    | Required | Default       | Description                                         |
| -------------------------------- | ------- | -------- | ------------- | --------------------------------------------------- |
| `type`                           | enum    | Yes      | -             | Must be `"s3"`                                      |
| `s3.bucket`                      | string  | Yes      | -             | S3 bucket name (`"test-bucket"`)                    |
| `s3.region`                      | string  | Yes      | `"us-east-1"` | AWS region (MinIO uses this as default)             |
| `s3.credentials.accessKeyId`     | string  | Yes      | -             | AWS access key or MinIO root user                   |
| `s3.credentials.secretAccessKey` | string  | Yes      | -             | AWS secret key or MinIO root password               |
| `s3.endpoint`                    | string  | No\*     | -             | S3 endpoint URL (`http://localhost:9000` for MinIO) |
| `s3.forcePathStyle`              | boolean | No\*     | `false`       | Must be `true` for MinIO compatibility              |

\*Required for MinIO, optional for AWS S3

**Validation Rules**:

- `type` must be exactly `"s3"`
- `bucket` must be a valid S3 bucket name (DNS-compliant, lowercase, 3-63 chars)
- `accessKeyId` and `secretAccessKey` must be non-empty strings
- `endpoint` must be a valid HTTP/HTTPS URL when provided
- `forcePathStyle` must be `true` when using MinIO

**Example**:

```json
{
  "type": "s3",
  "s3": {
    "bucket": "test-bucket",
    "region": "us-east-1",
    "credentials": {
      "accessKeyId": "minioadmin",
      "secretAccessKey": "minioadmin"
    },
    "endpoint": "http://localhost:9000",
    "forcePathStyle": true
  }
}
```

---

## Environment Variables

### AWS Credentials

Standard AWS credential variable names (auto-detected by AWS SDK v3):

| Variable                | Required | Default     | Description                           |
| ----------------------- | -------- | ----------- | ------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Yes\*    | -           | MinIO root user or AWS access key     |
| `AWS_SECRET_ACCESS_KEY` | Yes\*    | -           | MinIO root password or AWS secret key |
| `AWS_REGION`            | No       | `us-east-1` | AWS region                            |

\*Can be overridden in config file

### MinIO Credentials (Optional)

Custom MinIO credentials (override defaults):

| Variable              | Default      | Description         |
| --------------------- | ------------ | ------------------- |
| `MINIO_ROOT_USER`     | `minioadmin` | MinIO root username |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO root password |

---

## Docker Configuration

### Docker Compose Service

**Service Name**: `minio`

| Field           | Value                                    | Description               |
| --------------- | ---------------------------------------- | ------------------------- |
| `image`         | `minio/minio:latest`                     | MinIO server image        |
| `command`       | `server /data --console-address ":9001"` | Start server with console |
| `ports.api`     | `9000:9000`                              | S3 API port               |
| `ports.console` | `9001:9001`                              | Web console port          |
| `volumes`       | `minio_data:/data`                       | Persistent data volume    |

---

## Test Files (Runtime Data)

### Demo Files Created During Execution

These are temporary files created by the demo application to verify S3 operations:

| Path                   | Content                       | Purpose                 |
| ---------------------- | ----------------------------- | ----------------------- |
| `/test-file.txt`       | `"Hello from S3 Filesystem!"` | Basic write/read test   |
| `/demo-dir/nested.txt` | `"Nested file content"`       | Directory creation test |

**Lifecycle**:

1. Created during demo execution
2. Verified (read, stat, list)
3. Deleted after verification
4. Does not persist after demo completes

---

## State Transitions

### MinIO Container States

```
[Not Running] → [Starting] → [Ready] → [Bucket Created] → [Ready for App]
     ↓              ↓            ↓              ↓                   ↓
   Docker      docker compose up  health       init-buckets        app start
```

### Application States

```
[Idle] → [Config Loaded] → [S3 Client Created] → [Validated] → [Demo Running] → [Complete]
```

---

## Relationships

```
┌─────────────────┐
│  Docker Compose │
└────────┬────────┘
         │ starts
         ↓
┌─────────────────┐
│     MinIO       │
│   Container     │
└────────┬────────┘
         │ initializes
         ↓
┌─────────────────┐
│  test-bucket    │
└────────┬────────┘
         │ configured for
         ↓
┌─────────────────┐
│  Application    │
│  (TypeScript)   │
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│ @venizia/       │
│ filesystem      │
│ S3 Adapter      │
└─────────────────┘
```

---

## Summary

This is a demo/example application with no persistent data model. The key "entities" are:

1. **S3Config** - Configuration for S3 adapter
2. **Environment Variables** - AWS/MinIO credentials
3. **Docker Compose** - MinIO container definition
4. **Test Files** - Temporary runtime data for demo

All configuration is external (JSON files, environment variables), enabling easy customization without code changes.
