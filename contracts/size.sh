#!/usr/bin/env bash

# Create a new file to hold all of the storage layouts
OUTPUT_FILE=.contracts-size

forge build --sizes > "$OUTPUT_FILE"

# Remove the "No files changed, compilation skipped" line
sed -i -e '/No files changed, compilation skipped/d' "$OUTPUT_FILE"
