#!/bin/bash
#
# MinIO Bucket Initialization Script
#
# This script is designed to run INSIDE the MinIO Docker container.
# It waits for MinIO to be ready and then creates the test bucket.
#
# This script is executed automatically when the MinIO container starts.
#
# To run manually from host:
#   docker exec -it venizia-minio /bin/bash /init-buckets.sh
#

set -e

# Configuration (using environment variables from docker-compose.yml)
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
BUCKET_NAME="${MINIO_BUCKET_NAME:-test-bucket}"
ALIAS_NAME="minio-local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== MinIO Bucket Initialization ==="
echo ""

# Function to print colored output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for MinIO to be ready (this script runs inside the container, so localhost works)
log_info "Waiting for MinIO to be ready at ${MINIO_ENDPOINT}..."

MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -sf "${MINIO_ENDPOINT}/minio/health/live" > /dev/null 2>&1; then
        log_info "MinIO is ready!"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 1
done

echo ""

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log_error "MinIO did not become ready after ${MAX_ATTEMPTS} seconds"
    exit 1
fi

# Check if mc (MinIO Client) is available (it's included in the MinIO image)
if ! command -v mc &> /dev/null; then
    log_error "mc (MinIO Client) not found in container"
    log_error "This script must run inside the MinIO Docker container"
    exit 1
fi

MC_CMD="mc"

# Configure MinIO alias
log_info "Configuring MinIO alias '${ALIAS_NAME}'..."

if $MC_CMD alias set "${ALIAS_NAME}" "${MINIO_ENDPOINT}" "${MINIO_USER}" "${MINIO_PASSWORD}" --api S3v4 2>/dev/null; then
    log_info "Alias configured successfully"
else
    # Alias might already exist, try to update it
    if $MC_CMD alias remove "${ALIAS_NAME}" 2>/dev/null; then
        $MC_CMD alias set "${ALIAS_NAME}" "${MINIO_ENDPOINT}" "${MINIO_USER}" "${MINIO_PASSWORD}" --api S3v4
        log_info "Alias updated successfully"
    else
        log_error "Failed to configure MinIO alias"
        exit 1
    fi
fi

# Check if bucket already exists
log_info "Checking if bucket '${BUCKET_NAME}' exists..."

if $MC_CMD ls "${ALIAS_NAME}/${BUCKET_NAME}" &> /dev/null; then
    log_warn "Bucket '${BUCKET_NAME}' already exists. Skipping creation."
    echo ""
    log_info "Bucket '${BUCKET_NAME}' is ready for use!"
    exit 0
fi

# Create the bucket
log_info "Creating bucket '${BUCKET_NAME}'..."

if $MC_CMD mb "${ALIAS_NAME}/${BUCKET_NAME}" --ignore-existing; then
    log_info "Bucket '${BUCKET_NAME}' created successfully"
else
    log_error "Failed to create bucket '${BUCKET_NAME}'"
    exit 1
fi

# Set bucket policy to public read (optional, for development)
log_info "Setting bucket policy to public read..."

if $MC_CMD anonymous set download "${ALIAS_NAME}/${BUCKET_NAME}" 2>/dev/null; then
    log_info "Bucket policy set to public read"
else
    log_warn "Could not set bucket policy. This is optional for testing."
fi

# Verify bucket creation
log_info "Verifying bucket creation..."

if $MC_CMD ls "${ALIAS_NAME}/${BUCKET_NAME}" &> /dev/null; then
    echo ""
    log_info "✓ Bucket '${BUCKET_NAME}' is ready for use!"
    echo ""
    log_info "S3 API Endpoint: ${MINIO_ENDPOINT}"
    log_info "Bucket Name: ${BUCKET_NAME}"
    echo ""
    log_info "Credentials:"
    log_info "  Access Key: ${MINIO_USER}"
    log_info "  Secret Key: ${MINIO_PASSWORD}"
else
    log_error "Bucket verification failed"
    exit 1
fi

