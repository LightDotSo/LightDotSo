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

use clap::Parser;
use ethers::types::Address;
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::{error, info};
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
                server.add_methods(PaymasterApi {}.into_rpc(), JsonRpcServerType::Http)?;

                // Start the server
                let handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));

                if handle.is_err() {
                    error!("Error in handle: {:?}", handle);
                } else {
                    info!("Started paymaster JSON-RPC server at [::]:3000");
                }

                pending::<Result<()>>().await
            }
        });
        info!("PaymasterArgs run, finished");

        Ok(())
    }
}
