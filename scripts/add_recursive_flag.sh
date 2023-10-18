#!/bin/bash

file_path="crates/prisma/src/lib.rs"
temp_file="temp.rs"

# Create a temporary file with the desired line at the top
echo '#![recursion_limit = "256"]' > "$temp_file"
cat "$file_path" >> "$temp_file"

# Overwrite the original file with the temporary file
mv "$temp_file" "$file_path"
