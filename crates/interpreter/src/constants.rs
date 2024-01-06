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

use crate::{
    adapter::Adapter,
    adapters::transfer::{
        erc1155::ERC1155Adapter, erc20::ERC20Adapter, erc721::ERC721Adapter, eth::EthAdapter,
    },
};
use ethers_main::{abi::parse_abi, contract::BaseContract, types::H256};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use strum_macros::EnumVariantNames;

lazy_static! {
    #[derive(Clone)]
    pub static ref ADAPTERS: Vec<Box<dyn Adapter + Sync + Send>> =
        vec![Box::new(EthAdapter::new()), Box::new(ERC20Adapter::new()), Box::new(ERC721Adapter::new()), Box::new(ERC1155Adapter::new())];
}

lazy_static! {
    pub static ref TRANSFER_EVENT_TOPIC: H256 =
        // https://www.4byte.directory/event-signatures/?bytes_signature=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        // Transfer(address,address,uint256)
        H256::from_str("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")
            .expect("Failed to parse address");
}

lazy_static! {
    pub static ref ERC20_ABI: BaseContract = BaseContract::from(
        parse_abi(&[
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "function balanceOf(address) external view returns (uint256)",
        ])
        .expect("Failed to parse ABI"),
    );
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, EnumVariantNames)]
pub enum InterpretationActionType {
    #[strum(serialize = "NATIVE_RECEIVE")]
    NativeReceive,
    #[strum(serialize = "NATIVE_SEND")]
    NativeSend,
    #[strum(serialize = "ERC20_RECEIVE")]
    ERC20Receive,
    #[strum(serialize = "ERC20_SEND")]
    ERC20Send,
}
