# Copyright 2023-2024 Light.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/usr/bin/env bash

# Code from: nocturne-xyz
# Link: https://socket.dev/npm/package/@nocturne-xyz/contracts/files/1.0.32-alpha/storage_inspect.sh
# License: MIT OR Apache-2.0

# Create a new file to hold all of the storage layouts
OUTPUT_FILE=.storage-layouts

echo "" > "$OUTPUT_FILE"
echo "============================" > "$OUTPUT_FILE"
echo "👁️ STORAGE LAYOUT SNAPSHOT 👁️">> "$OUTPUT_FILE"
echo "============================" >> "$OUTPUT_FILE"

# Loop through each contract in the directory
for CONTRACT in $(find contracts/src -name "*.sol" | sort); do
    # Get the contract name by removing the directory path and file extension
    CONTRACT_NAME=$(basename "$CONTRACT" .sol)
    echo "Contract name: $CONTRACT_NAME"
    # Add separator line to output file
    echo "=======================" >> "$OUTPUT_FILE"
    # Print the contract name to the output file
    echo " ➡ $CONTRACT_NAME" >> "$OUTPUT_FILE"
    # Run the storage layout inspection on the contract and append output to output file
    forge inspect --pretty "$CONTRACT_NAME" storage-layout >> "$OUTPUT_FILE"
done
