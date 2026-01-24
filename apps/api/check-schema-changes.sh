#!/bin/bash

# Schema change detection script
# Compares migration file checksums to detect if database reset is needed

CHECKSUM_FILE=".migration-checksum"
MIGRATIONS_DIR="migrations"

# Generate current checksum of all migration files
# Using md5 on macOS (use md5sum on Linux)
if command -v md5 &> /dev/null; then
  current_checksum=$(find $MIGRATIONS_DIR -name "*.ts" -exec md5 -q {} \; 2>/dev/null | sort | md5 -q)
else
  current_checksum=$(find $MIGRATIONS_DIR -name "*.ts" -exec md5sum {} \; 2>/dev/null | sort | md5sum | awk '{print $1}')
fi

# Check if checksum file exists and compare
if [ -f "$CHECKSUM_FILE" ]; then
  stored_checksum=$(cat "$CHECKSUM_FILE")
  if [ "$current_checksum" == "$stored_checksum" ]; then
    echo "unchanged"
    exit 0
  fi
fi

# Schema changed or first run - update checksum file
echo "changed"
echo "$current_checksum" > "$CHECKSUM_FILE"
exit 0
