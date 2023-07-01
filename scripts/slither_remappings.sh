#!/bin/bash

# Read the contents of remappings.txt
remappings=$(cat remappings.txt | tr '\n' ' ')

# Update the value of solc_remaps in slither.config.json
jq --arg remappings "$remappings" '.solc_remaps = $remappings' slither.config.json > tmp.json && mv tmp.json slither.config.json
