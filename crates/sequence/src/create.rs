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

use crate::{config::WalletConfig, types::SignerNode};
use eyre::Result;

pub fn create_initial_wallet_config(signer: SignerNode, threshold: u16) -> Result<WalletConfig> {
    // Iterate over the signers and create a SignerNode for each one
    let wc = WalletConfig {
        signature_type: 0,
        checkpoint: 1,
        threshold,
        weight: 1,
        image_hash: [0; 32].into(),
        tree: signer,
        internal_root: None,
        internal_recovered_configs: None,
    };

    Ok(wc)
}
