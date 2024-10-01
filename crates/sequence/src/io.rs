// Copyright 2023-2024 LightDotSo.
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

use crate::config::WalletConfig;
use eyre::Result;
use std::{fs, path::Path};

pub fn read_wallet_config<P: AsRef<Path>>(path: P) -> Result<WalletConfig> {
    // Load JSON from file
    let wallet_config_json = fs::read_to_string(path)?;

    // Parse JSON to WalletConfig and return
    let wallet_config = serde_json::from_str(&wallet_config_json)?;

    Ok(wallet_config)
}

pub fn config_to_json(wallet_config: &WalletConfig) -> Result<String> {
    // Convert struct into a JSON string
    let wallet_config_json = serde_json::to_string_pretty(wallet_config)?;

    Ok(wallet_config_json)
}

pub fn write_wallet_config<P: AsRef<Path>>(wallet_config: &WalletConfig, path: P) -> Result<()> {
    // Convert struct into a JSON string
    let wallet_config_json = config_to_json(wallet_config)?;

    // Write the JSON string to a file
    fs::write(path, wallet_config_json)?;

    Ok(())
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use crate::types::SignerNode;

    use super::*;

    #[test]
    fn test_write_config_to_json() -> Result<()> {
        let config = WalletConfig {
            signature_type: 0,
            checkpoint: 0,
            threshold: 0,
            weight: 0,
            internal_root: Some([0; 32].into()),
            image_hash: [0; 32].into(),
            tree: SignerNode { signer: None, left: None, right: None },
            internal_recovered_configs: None,
        };

        // Now you can use your WalletConfig struct
        println!("Checkpoint: {}", config.checkpoint);

        // Write WalletConfig back to a different JSON file
        write_wallet_config(&config, "tests/samples/sample1_out.json")?;
        read_wallet_config("tests/samples/sample1_out.json")?;

        Ok(())
    }
}
