#!/bin/bash

# Function to escape special characters for JSON
escape_json() {
    echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# Read remappings from remappings.txt
remappings=$(jq -R -s -c 'split("\n") | map(select(length > 0))' remappings.txt)

# Create a temporary file
temp_file=$(mktemp)

# Use sed with a heredoc to replace the existing solidity.remappings array
awk -v remappings="$remappings" '
  BEGIN { in_remappings = 0; }
  /^[[:space:]]*"solidity\.remappings":/ { 
    print "  \"solidity.remappings\": " remappings;
    in_remappings = 1;
    next;
  }
  in_remappings && /^[[:space:]]*\]/ { 
    in_remappings = 0;
    next;
  }
  !in_remappings { print }
' .vscode/settings.json > "$temp_file"

# Move the temporary file to replace the original
mv "$temp_file" .vscode/settings.json
