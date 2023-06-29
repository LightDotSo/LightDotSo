
#!/usr/bin/env bash

# Code from: nocturne-xyz
# Link: https://socket.dev/npm/package/@nocturne-xyz/contracts/files/1.0.32-alpha/storage_inspect.sh
# License: MIT OR Apache-2.0

# Define the contracts directory
CONTRACTS_DIR=./contracts

# Create a new file to hold all of the storage layouts
OUTPUT_FILE=../.storage-layouts

echo "" > "$OUTPUT_FILE"
echo "============================" > "$OUTPUT_FILE"
echo "👁️ STORAGE LAYOUT SNAPSHOT 👁️ ">> "$OUTPUT_FILE"
echo "============================" >> "$OUTPUT_FILE"

# Loop through each contract in the directory
for CONTRACT in src/**/*.sol; do
    # Get the contract name by removing the directory path and file extension
    CONTRACT_NAME=$(basename "$CONTRACT" .sol)
    echo "Contract name: $CONTRACT_NAME"
    # Add separator line to output file
    echo "=======================" >> "$OUTPUT_FILE"
    # Print the contract name to the output file
    echo " ➡ $CONTRACT_NAME" >> "$OUTPUT_FILE"
    # Run the storage layout inspection on the contract and append output to output file
    FOUNDRY_PROFILE=contracts forge inspect --pretty "$CONTRACT_NAME" storage-layout >> "$OUTPUT_FILE"
done
