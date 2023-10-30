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

use clap::Parser;
use ethers::types::Address;
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::info;
use lightdotso_utils::parse_address;
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

use crate::{paymaster::PaymasterApi, paymaster_api::PaymasterApiServer};

#[derive(Debug, Clone, Parser)]
pub struct PaymasterArgs {
    #[clap(long, env = "PAYMASTER_ADDRESS", hide = true,default_value = "", value_parser=parse_address)]
    pub paymaster: Address,
    /// The private key of the paymaster
    #[clap(long, env = "PAYMASTER_PRIVATE_KEY", hide = true)]
    pub paymaster_private_key: String,
    /// The AWS access key id
    #[clap(long, env = "AWS_ACCESS_KEY_ID", hide = true)]
    pub aws_access_key_id: String,
    /// The AWS secret access key
    #[clap(long, env = "AWS_SECRET_ACCESS_KEY", hide = true)]
    pub aws_secret_key_id: String,
    /// The AWS KMS key ids
    #[arg(long, short, num_args = 1.., value_delimiter = ',')]
    #[clap(long, env = "AWS_KMS_KEY_IDS", hide = true)]
    pub aws_kms_key_ids: Vec<String>,
}

impl PaymasterArgs {
    pub async fn run(self) -> Result<()> {
        // Add info
        info!("PaymasterArgs run, starting...");

        // Print the config
        // info!("Config: {:?}", self);

        tokio::spawn({
            async move {
                // Create the server
                let mut server = JsonRpcServer::new(
                    true,
                    IpAddr::V6(Ipv6Addr::UNSPECIFIED),
                    3000,
                    true,
                    IpAddr::V6(Ipv6Addr::UNSPECIFIED),
                    3001,
                );

                // Add the paymaster server
                server.add_methods(PaymasterApi {}.into_rpc(), JsonRpcServerType::Http).unwrap();

                // Start the server
                let _handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));
                info!("Started paymaster JSON-RPC server at [::]:3000");

                pending::<Result<()>>().await
            }
        });
        info!("PaymasterArgs run, finished");

        Ok(())
    }
}
