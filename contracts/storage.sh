#!/usr/bin/env bash
# Copyright (C) 2023 Light, Inc.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


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
