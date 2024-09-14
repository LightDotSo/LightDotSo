#!/bin/bash

sudo apt install build-essential -y;
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y;
source "$HOME/.cargo/env";
git clone -b optfix2 https://github.com/Vectorized/create2crunch.git && cd create2crunch;
sed -i 's/0x4/0x40/g' src/lib.rs

export FACTORY="0x4e59b44847b379578588920ca78fbf26c0b4956c";
export CALLER="0x0000000000000000000000000000000000000000";
export INIT_CODE_HASH="0x13b60b3864ada1bdb7577bf996e2b351e54dfd010e0c44343c8cda0201b6b0d6";
export LEADING=5; export TOTAL=7;
cargo run --release $FACTORY $CALLER $INIT_CODE_HASH 0 $LEADING $TOTAL;
