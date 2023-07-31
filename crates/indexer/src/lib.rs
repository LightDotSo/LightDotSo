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

pub mod config;
pub mod db;
pub mod error;

#[cfg(test)]
mod tests {
    use super::*;
    use anvil::NodeConfig;
    use ethers::{prelude::Middleware, types::U256};

    #[tokio::test(flavor = "multi_thread")]
    async fn test_config_run() {
        let config = NodeConfig::default();
        let (api, handle) = anvil::spawn(config).await;
        let block_num = api.block_number().unwrap();
        assert_eq!(block_num, U256::zero());

        let provider = handle.ws_provider().await;

        let num = provider.get_block_number().await.unwrap();
        assert_eq!(num, block_num.as_u64().into());

        // let config = config::Config::default();
    }
}
