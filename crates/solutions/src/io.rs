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

use crate::types::WalletConfig;
use eyre::Result;
use std::{fs, path::Path};

pub fn read_wallet_config<P: AsRef<Path>>(path: P) -> Result<WalletConfig> {
    // Load JSON from file
    let wallet_config_json = fs::read_to_string(path)?;

    // Parse JSON to WalletConfig and return
    let wallet_config = serde_json::from_str(&wallet_config_json)?;

    Ok(wallet_config)
}

pub fn write_wallet_config<P: AsRef<Path>>(wallet_config: &WalletConfig, path: P) -> Result<()> {
    // Convert struct into a JSON string
    let wallet_config_json = serde_json::to_string_pretty(wallet_config)?;

    // Write the JSON string to a file
    fs::write(path, wallet_config_json)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::types::SignerNode;

    use super::*;

    #[test]
    fn test_write_config_to_json() {
        let config = WalletConfig {
            checkpoint: 0,
            threshold: 0,
            weight: 0,
            internal_root: Some([0; 32].into()),
            image_hash: [0; 32].into(),
            tree: SignerNode { signer: None, left: None, right: None },
        };

        // Now you can use your WalletConfig struct
        println!("Checkpoint: {}", config.checkpoint);

        // Write WalletConfig back to a different JSON file
        write_wallet_config(&config, "tests/samples/sample1_out.json").unwrap();
        read_wallet_config("tests/samples/sample1_out.json").unwrap();
    }
}
