#!/usr/bin/env bash

# Specify the path to the "out" directory
SOURCE_DIR="out"

# Specify the path to the "out-wagmi" directory
DESTINATION_DIR="out-wagmi"

# Specify the directories to copy (separated by spaces)
DIRECTORIES="LightWallet.sol LightWalletFactory.sol"

# Iterate over the specified directories and copy them
for DIR in $DIRECTORIES; do
    cp -r "$SOURCE_DIR/$DIR" "$DESTINATION_DIR"
done
