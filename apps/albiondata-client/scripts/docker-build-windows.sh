#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="albiondata-client-builder"
OUTPUT_DIR="$PROJECT_DIR/build"

echo "==> Building albiondata-client.exe via Docker..."

mkdir -p "$OUTPUT_DIR"

docker build \
  -f "$PROJECT_DIR/Dockerfile.build.windows" \
  --output "type=local,dest=$OUTPUT_DIR" \
  "$PROJECT_DIR"

echo "==> Build complete: $OUTPUT_DIR/albiondata-client.exe"
