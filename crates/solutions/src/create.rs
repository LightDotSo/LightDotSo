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

use crate::{config::WalletConfig, types::SignerNode};
use eyre::Result;

pub fn create_initial_wallet_config(signer: SignerNode, threshold: u16) -> Result<WalletConfig> {
    // Iterate over the signers and create a SignerNode for each one
    let wc = WalletConfig {
        checkpoint: 1,
        threshold,
        weight: 1,
        image_hash: [0; 32].into(),
        tree: signer,
        internal_root: None,
    };

    Ok(wc)
}
