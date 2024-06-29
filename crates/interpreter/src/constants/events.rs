// Copyright 2023-2024 Light.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::expect_used)]

use ethers_main::types::H256;
use lazy_static::lazy_static;
use std::str::FromStr;

lazy_static! {
    pub static ref TRANSFER_EVENT_TOPIC: H256 =
        // https://www.4byte.directory/event-signatures/?bytes_signature=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        // Transfer(address,address,uint256)
        H256::from_str("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")
            .expect("Failed to parse address");
}

lazy_static! {
    pub static ref TRANSFER_SINGLE_EVENT_TOPIC: H256 =
        // https://www.4byte.directory/event-signatures/?bytes_signature=0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62
        // TransferSingle(address,address,address,uint256,uint256)
        H256::from_str("0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62")
            .expect("Failed to parse address");
}

lazy_static! {
    pub static ref TRANSFER_BATCH_EVENT_TOPIC: H256 =
        // https://www.4byte.directory/event-signatures/?bytes_signature=0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb
        // TransferBatch(address,address,address,uint256[],uint256[])
        H256::from_str("0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb")
            .expect("Failed to parse address");
}
