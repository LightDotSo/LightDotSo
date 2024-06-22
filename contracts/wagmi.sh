#!/usr/bin/env bash
# Copyright 2023-2024 Light, Inc.
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


# Specify the path to the "out" directory
SOURCE_DIR="out"

# Specify the path to the "out-wagmi" directory
DESTINATION_DIR="out-wagmi"

# Specify the directories to copy (separated by spaces)
DIRECTORIES="LightWallet.sol LightWalletFactory.sol LightPaymaster.sol"

# Iterate over the specified directories and copy them
for DIR in $DIRECTORIES; do
    cp -r "$SOURCE_DIR/$DIR" "$DESTINATION_DIR"
done
