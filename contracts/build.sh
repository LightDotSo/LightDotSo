#!/usr/bin/env bash
# Copyright 2023-2024 LightDotSo.
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


# Array of Solidity files to keep
core_solidity_files=(
    "LightDAG.sol"
    "LightPaymaster.sol"
    "LightTimelockController.sol"
    "LightWallet.sol"
    "LightWalletFactory.sol"
)
# Array of dependency Solidity files to keep
dep_solidity_files=(
    "interfaces/IConditionChecker.sol"
    "interfaces/IERC1271.sol"
    "interfaces/ILightWallet.sol"
    "interfaces/ILightWalletFactory.sol"
    "core/EntryPoint.sol"
    "core/VerifyingPaymaster.sol"
)

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "Please provide a core Solidity file to compile."
    exit 1
fi

# The first argument is the core file to compile
core_file_to_compile="$1"

# Process only the specified Solidity file
filename=$(basename "$core_file_to_compile" .sol)

# Check if the provided file is in the core_solidity_files list
if [[ ! " ${core_solidity_files[*]} " =~ " ${core_file_to_compile} " ]]; then
    echo "Error: $core_file_to_compile is not in the list of core Solidity files."
    exit 1
fi

# Dependencies for each core file
declare -A dependencies
dependencies["LightDAG.sol"]="interfaces/IConditionChecker.sol"
dependencies["LightPaymaster.sol"]="core/VerifyingPaymaster.sol"
dependencies["LightTimelockController.sol"]="interfaces/ILightWallet.sol interfaces/IERC1271.sol"
dependencies["LightWallet.sol"]="interfaces/IERC1271.sol interfaces/ILightWallet.sol core/EntryPoint.sol"
dependencies["LightWalletFactory.sol"]="LightWallet.sol interfaces/IERC1271.sol interfaces/ILightWallet.sol interfaces/ILightWalletFactory.sol"

find contracts -name "*.sol" | while read -r file; do
    rel_path=${file#contracts/src/}
    filename=$(basename "$file")
    
    if [[ "$filename" == "$core_file_to_compile" ]] || [[ " ${dependencies[$core_file_to_compile]} " =~ " ${rel_path} " ]]; then
        :
    else
        mv "$file" "${file}.bak" || echo "Failed to move $file"
    fi
done

# Run forge build with FOUNDRY_PROFILE=deploy
FOUNDRY_PROFILE=deploy forge build

# Process each Solidity file
if [ -f "optimized-out/$core_file_to_compile/$filename.json" ]; then
    cp -fp "optimized-out/$core_file_to_compile/$filename.json" "opt/$core_file_to_compile/$filename.json"
else
    echo "Warning: Optimized output not found for $core_file_to_compile"
fi

echo "Restoring files..."
find contracts -name "*.sol.bak" | while read -r file; do
    mv "$file" "${file%.bak}" || echo "Failed to restore $file"
done

echo "Script completed. Optimized files are in the 'opt' directory."
