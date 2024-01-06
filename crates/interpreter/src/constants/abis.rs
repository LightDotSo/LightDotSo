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

use ethers_main::{abi::parse_abi, contract::BaseContract};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref ERC20_ABI: BaseContract = BaseContract::from(
        parse_abi(&[
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "function balanceOf(address) external view returns (uint256)",
        ])
        .expect("Failed to parse ABI"),
    );
}

lazy_static! {
    pub static ref ERC721_ABI: BaseContract = BaseContract::from(
        parse_abi(&[
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            "function balanceOf(address) external view returns (uint256)",
            "function ownerOf(uint256) external view returns (address)",
        ])
        .expect("Failed to parse ABI"),
    );
}

lazy_static! {
    pub static ref ERC1155_ABI: BaseContract = BaseContract::from(
        parse_abi(&[
            "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
            "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
            "function balanceOf(address, uint256) external view returns (uint256)",
            "function balanceOfBatch(address[] calldata, uint256[] calldata) external view returns (uint256[] memory)",
        ])
        .expect("Failed to parse ABI"),
    );
}
