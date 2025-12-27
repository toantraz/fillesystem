#!/bin/bash
#
# MinIO Docker Entrypoint Wrapper
#
# This script wraps the default MinIO entrypoint to:
# 1. Start the init-buckets.sh script in the background
# 2. Execute the default MinIO server command
#
# The init script will:
# - Wait for MinIO to be ready
# - Create the configured bucket
# - Set bucket policy
#

set -e

# Start the bucket initialization script in the background
# It will wait for MinIO to be ready before creating the bucket
/init-buckets.sh &

# Execute the default MinIO entrypoint with all passed arguments
# This replaces the current process with MinIO server
exec /usr/bin/docker-entrypoint.sh "$@"
