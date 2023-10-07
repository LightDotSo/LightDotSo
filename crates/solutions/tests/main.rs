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

use lightdotso_solutions::io::read_wallet_config;

#[test]
fn test_wallet_config_from_json() {
    // Load JSON from file
    let wallet_config = read_wallet_config("tests/samples/sample1_out.json").unwrap();

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json).unwrap();

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...
}
