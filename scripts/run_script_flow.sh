#!/bin/bash

echo "Running script flow..."

FOUNDRY_PROFILE="script" forge script contracts/script/flow/ERC20TransferFlow.s.sol \
    --rpc-url $NETWORK_NAME \
    --sender 0x81a2500fa1ae8eB96a63D7E8b6b26e6cabD2C9c0 \
    --broadcast
