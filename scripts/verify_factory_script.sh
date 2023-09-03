#!/bin/bash

FOUNDRY_PROFILE="deploy" forge verify-contract \
    --chain-id $CHAIN_ID \
    --num-of-optimizations 4194304 \
    --watch \
    --constructor-args $(cast abi-encode "constructor(address)" "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789") \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --compiler-version v0.8.18 \
    0x0000000000756D3E6464f5efe7e413a0Af1C7474 \
    contracts/src/LightWalletFactory.sol:LightWalletFactory
