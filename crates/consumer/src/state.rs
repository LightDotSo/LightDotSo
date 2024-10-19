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

use clap::Parser;
use eyre::Result;
use lightdotso_billing::{billing::Billing, config::BillingArgs};
use lightdotso_indexer::{config::IndexerArgs, indexer::Indexer};
use lightdotso_node::{config::NodeArgs, node::Node};
use lightdotso_notifier::{config::NotifierArgs, notifier::Notifier};
use lightdotso_polling::{config::PollingArgs, polling::Polling};
use std::sync::Arc;

/// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

#[derive(Clone)]
pub struct ConsumerState {
    // Internal services
    pub billing: Arc<Billing>,
    pub indexer: Arc<Indexer>,
    pub notifier: Arc<Notifier>,
    pub polling: Arc<Polling>,
    pub node: Arc<Node>,
}

/// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

pub async fn create_consumer_state() -> Result<ConsumerState> {
    // Parse the billing command line arguments
    let billing_args =
        BillingArgs::try_parse().unwrap_or_else(|_| BillingArgs::parse_from(["".to_string()]));
    let billing = Arc::new(billing_args.create().await?);

    // Parse the indexer command line arguments
    let indexer_args =
        IndexerArgs::try_parse().unwrap_or_else(|_| IndexerArgs::parse_from(["".to_string()]));
    let indexer = Arc::new(indexer_args.create().await);

    // Parse the polling command line arguments
    let polling_args =
        PollingArgs::try_parse().unwrap_or_else(|_| PollingArgs::parse_from(["".to_string()]));
    let polling = Arc::new(polling_args.create().await?);

    // Parse the node command line arguments
    let node_args =
        NodeArgs::try_parse().unwrap_or_else(|_| NodeArgs::parse_from(["".to_string()]));
    let node = Arc::new(node_args.create().await?);

    // Parse the notifer command line arguments
    let notifier_args =
        NotifierArgs::try_parse().unwrap_or_else(|_| NotifierArgs::parse_from(["".to_string()]));
    let notifier = Arc::new(notifier_args.create().await?);

    Ok(ConsumerState { billing, indexer, notifier, polling, node })
}
