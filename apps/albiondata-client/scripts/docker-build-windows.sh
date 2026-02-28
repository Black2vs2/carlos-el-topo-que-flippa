#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="albiondata-client-builder"
OUTPUT_DIR="$PROJECT_DIR/build"

echo "==> Building albiondata-client.exe via Docker..."

mkdir -p "$OUTPUT_DIR"

docker build -t "$IMAGE_NAME" -f "$PROJECT_DIR/Dockerfile.build.windows" "$PROJECT_DIR"

CONTAINER_ID=$(docker create "$IMAGE_NAME")
docker cp "$CONTAINER_ID:/out/albiondata-client.exe" "$OUTPUT_DIR/albiondata-client.exe"
docker rm "$CONTAINER_ID" > /dev/null

echo "==> Build complete: $OUTPUT_DIR/albiondata-client.exe"
