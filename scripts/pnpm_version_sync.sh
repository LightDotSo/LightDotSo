#!/bin/bash

# Get the installed version of pnpm
installed_version=$(pnpm --version)

# Update the package.json file in the current directory
jq ".packageManager = \"pnpm@$installed_version\"" package.json > tmp.json && mv tmp.json package.json

# Optional: Print the updated package.json
cat package.json
