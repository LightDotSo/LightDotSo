#!/bin/bash

# Read the turbo version from the root package.json
turbo_version=$(jq -r '.devDependencies.turbo' package.json | tr -d '^')

# Read the pnpm version from the root package.json
pnpm_version=$(jq -r '.packageManager' package.json | cut -d"@" -f2)

# Read the turbo version from the root package.json
solc_version=$(jq -r '.dependencies.solc' package.json | tr -d '^')

# Print the versions
echo turbo_version=$turbo_version
echo pnpm_version=$pnpm_version
echo solc_version=$solc_version

# Create a temporary file to store the updated Dockerfile
temp_file=$(mktemp)

# Update the versions in the Dockerfile using awk and save the result to the temporary file
awk -v turbo_version="$turbo_version" -v pnpm_version="$pnpm_version" -v solc_version="$solc_version" '
  { gsub(/turbo@[0-9]+\.[0-9]+\.[0-9]+/, "turbo@" turbo_version) }
  { gsub(/pnpm@[0-9]+\.[0-9]+\.[0-9]+/, "pnpm@" pnpm_version) }
  { gsub(/solc@[0-9]+\.[0-9]+\.[0-9]+/, "solc@" solc_version) }
  { print }
' Dockerfile > "$temp_file"

# Replace the original Dockerfile with the updated file
mv "$temp_file" Dockerfile
