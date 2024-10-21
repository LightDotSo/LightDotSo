#!/bin/bash

# Function to add allow attributes to a file
add_allow_attributes() {
    local file_path=$1
    local temp_file="temp.rs"

    # Create a temporary file with the desired lines at the top
    echo "#![allow(clippy::unwrap_used)]" > "$temp_file"
    echo "#![allow(clippy::all)]" >> "$temp_file"
    cat "$file_path" >> "$temp_file"

    # Overwrite the original file with the temporary file
    mv "$temp_file" "$file_path"
    
    echo "Added allow attributes to $file_path"
}

# Add allow attributes to mysql.rs
add_allow_attributes "crates/prisma-mysql/src/mysql.rs"

# Add allow attributes to postgres.rs
add_allow_attributes "crates/prisma-postgres/src/postgres.rs"
