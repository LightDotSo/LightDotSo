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

pub(crate) mod transfer;

use crate::{
    adapter::Adapter,
    adapters::transfer::{
        erc1155::ERC1155Adapter, erc20::ERC20Adapter, erc721::ERC721Adapter, eth::EthAdapter,
    },
};
use lazy_static::lazy_static;

lazy_static! {
    #[derive(Clone)]
    pub static ref ADAPTERS: Vec<Box<dyn Adapter + Sync + Send>> =
        vec![Box::new(EthAdapter::new()), Box::new(ERC20Adapter::new()), Box::new(ERC721Adapter::new()), Box::new(ERC1155Adapter::new())];
}
