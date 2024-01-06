// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
