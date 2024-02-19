## Mint USDC on Sepolia

# cast send --rpc-url=https://rpc.sepolia.org \
#   0x7f11f79DEA8CE904ed0249a23930f2e59b43a385 \
#   "mint(address,uint256)" 0x35da762a35fcb3160738eecd60fa18438c273d5e 1000000000000000000000 \
#   -t

## Check balance of USDC on Sepolia

# cast call --rpc-url=https://rpc.sepolia.org \
#   0x7f11f79DEA8CE904ed0249a23930f2e59b43a385 \
#   "balanceOf(address) returns (uint256)" 0x35da762a35fcb3160738eecd60fa18438c273d5e \
#   -t

## Approve USDC

# cast send --rpc-url=https://rpc.sepolia.org \
#   0x7f11f79DEA8CE904ed0249a23930f2e59b43a385 \
#   "approve(address,uint256)" "0xc644cc19d2A9388b71dd1dEde07cFFC73237Dca8" 1000000000000000000000 \
#   -t 

## Bridge USDB to Blast

# cast send --rpc-url=https://rpc.sepolia.org \
#    --gas-limit 500000 \
#   0xc644cc19d2A9388b71dd1dEde07cFFC73237Dca8 \
#   "bridgeERC20(address localToken,address remoteToken,uint256 amount,uint32,bytes)" \
#   "0x7f11f79DEA8CE904ed0249a23930f2e59b43a385" \
#   "0x4200000000000000000000000000000000000022" \
#   1000000000000000000000 500000 0x \
#   -t 

## Check balance of USDB on Blast

# cast call --rpc-url=https://sepolia.blast.io/ \
#   0x4200000000000000000000000000000000000022 \
#   "balanceOf(address) returns (uint256)" 0x35da762a35fcb3160738eecd60fa18438c273d5e

## Send USDB on Blast

# cast send --rpc-url=https://sepolia.blast.io/ \
#   0x4200000000000000000000000000000000000022 \
#   "transfer(address,uint256)" 0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F 1000000000000 \
#   -t

## Bridge to Blast
cast send -i 0xc644cc19d2A9388b71dd1dEde07cFFC73237Dca8 --value 0.5ether --rpc-url https://rpc.sepolia.org \
  -t

## Check balance

# cast balance 0x35da762a35fcb3160738eecd60fa18438c273d5e --rpc-url https://sepolia.blast.io

## Send ETH on Blast

# cast send -i 0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F --value 0.03ether --rpc-url https://sepolia.blast.io \
#   -t