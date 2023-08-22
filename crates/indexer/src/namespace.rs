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

use lazy_static::lazy_static;

// The WalletUpdated namesapce
lazy_static! {
    pub static ref LIGHT_WALLET_INITIALIZED: String = "LightWalletInitialized".to_string();
}

// The ImageHashUpdated namesapce
lazy_static! {
    pub static ref IMAGE_HASH_UPDATED: String = "ImageHashUpdated".to_string();
}

// The ERC721 namesapce
lazy_static! {
    pub static ref ERC721: String = "ERC721".to_string();
}

// The ERC20 namesapce
lazy_static! {
    pub static ref ERC20: String = "ERC20".to_string();
}

// The ERC1155 namesapce
lazy_static! {
    pub static ref ERC1155: String = "ERC1155".to_string();
}
