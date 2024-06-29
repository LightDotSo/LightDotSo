// Copyright 2023-2024 Light
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

use lazy_static::lazy_static;

// The WalletUpdated namesapce
lazy_static! {
    pub static ref LIGHT_WALLET_INITIALIZED: String = "LightalletInitialized".to_string();
}

// The ImageHashUpdated namesapce
lazy_static! {
    pub static ref IMAGE_HASH_UPDATED: String = "ImageHashUpdated".to_string();
}

// The ETH namesapce
lazy_static! {
    pub static ref ETH: String = "ETH".to_string();
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
