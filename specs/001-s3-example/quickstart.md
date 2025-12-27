# Quickstart Guide: S3 Filesystem Example with MinIO

This guide will help you set up and run the S3 filesystem example using MinIO as a local S3-compatible backend.

---

## Prerequisites

- **Docker** - Install from [docker.com](https://docker.com)
- **Docker Compose** - Usually included with Docker Desktop
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **npm** - Included with Node.js

---

## Step 1: Start MinIO

Navigate to the example directory and start MinIO using Docker Compose:

```bash
cd examples/s3-minio-example/docker
docker compose up -d
```

**Verify MinIO is running**:

- API: http://localhost:9000
- Console: http://localhost:9001

**Login to Console**:

- Username: `minioadmin`
- Password: `minioadmin`

You should see the `test-bucket` automatically created.

---

## Step 2: Configure Application

The example application can be configured via environment variables or a config file.

### Option A: Environment Variables (Recommended)

```bash
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
export AWS_REGION=us-east-1
```

### Option B: Config File

Copy the example config and customize:

```bash
cp config/s3.json.example config/s3.json
# Edit s3.json if you need to change defaults
```

---

## Step 3: Install Dependencies

```bash
cd examples/s3-minio-example
npm install
```

---

## Step 4: Run the Example

```bash
npm start
```

**Expected Output**:

```
=== S3 Filesystem Example Application ===

[INFO] Configuration loaded: {...}
[INFO] Initializing application...
[INFO] Application initialized successfully
[INFO] Booting application...
[INFO] Application booted successfully
[INFO] Running S3 filesystem operations demo...

[SUCCESS] Wrote file: /test-file.txt
[SUCCESS] Read file: /test-file.txt
[INFO] Content: "Hello from S3 Filesystem!"
[SUCCESS] File exists: /test-file.txt → true
[SUCCESS] File stats: /test-file.txt
[INFO] Size: 28 bytes, Modified: 2025-12-24T...
[SUCCESS] Listed directory: /
[INFO] Files: test-file.txt
[SUCCESS] Deleted file: /test-file.txt

[INFO] Demo complete!
```

---

## Step 5: Verify in MinIO Console

1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Click on **Buckets**
4. Select **test-bucket**
5. You should see the bucket is empty (files were created and deleted during demo)

---

## Stopping MinIO

```bash
cd docker
docker compose down
```

To remove all data (including the bucket):

```bash
docker compose down -v
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:9000 failed: port is already allocated`

**Solution**: Change ports in `docker/docker-compose.yml`:

```yaml
ports:
  - "9001:9000" # Use different host port
  - "9002:9001"
```

Then update endpoint in `config/s3.json`:

```json
{
  "endpoint": "http://localhost:9001"
}
```

### Connection Refused

**Error**: `ECONNREFUSED http://localhost:9000`

**Solution**: Ensure MinIO is running:

```bash
docker compose ps
# Should show minio container as "Up"
```

### Authentication Failed

**Error**: `InvalidAccessKeyId`

**Solution**: Verify environment variables match MinIO credentials:

```bash
echo $AWS_ACCESS_KEY_ID    # Should be: minioadmin
echo $AWS_SECRET_ACCESS_KEY # Should be: minioadmin
```

### Bucket Not Found

**Error**: `NoSuchBucket: test-bucket`

**Solution**: Run the bucket initialization script:

```bash
cd docker
./init-buckets.sh
```

---

## File Structure

```
examples/s3-minio-example/
├── docker/
│   ├── docker-compose.yml    # MinIO container setup
│   └── init-buckets.sh       # Bucket initialization script
├── config/
│   ├── s3.json               # S3 configuration
│   └── .env.example          # Environment variables template
├── src/
│   ├── index.ts              # Application entry point
│   ├── app.ts                # Ignis application setup
│   └── demo.ts               # S3 operations demo
├── package.json
├── README.md                 # This file
└── tsconfig.json
```

---

## Next Steps

- **Modify the demo**: Edit `src/demo.ts` to add custom operations
- **Use with AWS S3**: Change `endpoint` to AWS S3 region URL (and remove `forcePathStyle`)
- **Integration testing**: Use this pattern for E2E tests with S3

---

## Support

- **MinIO Docs**: https://min.io/docs/minio/linux/index.html
- **AWS SDK v3**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
- **Filesystem Package**: See main package README
