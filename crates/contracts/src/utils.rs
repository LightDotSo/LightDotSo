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

use lightdotso_constants::chains::{MAINNET_CHAIN_IDS, TESTNET_CHAIN_IDS};

/// Returns `true` if the chain ID is a testnet chain ID.
/// Falls back to `true` if the chain ID is not a mainnet chain ID.
pub fn is_testnet(chain_id: u64) -> bool {
    TESTNET_CHAIN_IDS.contains_key(&chain_id) || !MAINNET_CHAIN_IDS.contains_key(&chain_id)
}
