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

use crate::config::PollingArgs;
use autometrics::autometrics;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use chrono::Timelike;
use ethers::{
    prelude::{Http, Provider},
    providers::Middleware,
};
use eyre::Result;
use lightdotso_contracts::provider::get_provider;
use lightdotso_db::db::create_client;
use lightdotso_graphql::polling::{
    min_block::run_min_block_query,
    user_operations::{run_user_operations_query, BigInt, GetUserOperationsQueryVariables},
};
use lightdotso_kafka::{
    get_producer, produce_transaction_message, rdkafka::producer::FutureProducer,
};
use lightdotso_opentelemetry::polling::PollingMetrics;
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::{error, info, trace, warn};
use std::{sync::Arc, time::Duration};

#[allow(dead_code)]
#[derive(Clone)]
pub struct Polling {
    chain_id: u64,
    live: bool,
    db_client: Arc<PrismaClient>,
    kafka_client: Option<Arc<FutureProducer>>,
    provider: Option<Arc<Provider<Http>>>,
}

impl Polling {
    pub async fn new(_args: &PollingArgs, chain_id: u64, live: bool) -> Self {
        info!("Polling new, starting");

        // Create the db client
        let db_client = Arc::new(create_client().await.unwrap());

        // Create the kafka client
        let kafka_client: Option<Arc<FutureProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the provider
        let provider: Option<Arc<Provider<Http>>> = get_provider(chain_id).await.ok().map(Arc::new);

        // Create the polling
        Self { chain_id, live, db_client, kafka_client, provider }
    }

    pub async fn run(&self) {
        info!("Polling run, starting");

        // Get the initial min block.
        let initial_min_block = self.get_min_block().await.unwrap_or_default();

        let mut min_block = if self.live { initial_min_block } else { 0 };

        loop {
            // Wrap the task in a catch_unwind block to not crash the task if the task panics.
            let result = self.poll_task(min_block).await;

            match result {
                Ok(block) => {
                    let now = chrono::Utc::now();
                    trace!("Polling run, chain_id: {} timestamp: {}", self.chain_id, now);

                    // Info if the second is 0.
                    if now.second() == 0 {
                        info!("Polling run, chain_id: {} timestamp: {}", self.chain_id, now);
                    }

                    // On success, set the min block to the returned block.
                    min_block = block;

                    // If not live, check if the min block is greater to or equal to than the
                    // initial min block.
                    if !self.live && min_block >= initial_min_block {
                        warn!(
                            "Polling exiting, chain_id: {} min_block: {} initial_min_block: {}",
                            self.chain_id, min_block, initial_min_block
                        );
                        break;
                    }

                    // Sleep for 1 second.
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                }
                Err(e) => {
                    error!("run_task {} panicked: {:?}", self.chain_id, e);

                    // Retry the task after 1 second.
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            }
        }
    }

    /// Get the min block
    #[autometrics]
    async fn get_min_block(&self) -> Result<i32> {
        // Escape the static lifetime.
        let chain_id = self.chain_id;

        // Get the min_block query from the graphql api.
        let min_block_res = tokio::task::spawn_blocking(move || {
            { || run_min_block_query(chain_id) }.retry(&ExponentialBuilder::default()).call()
        })
        .await?;

        // Get the data from the response.
        let data = min_block_res?.data;

        if let Some(d) = data {
            // Set the min block to the returned block.
            let meta = d._meta;
            if let Some(m) = meta {
                let min_block = m.block.number;
                return Ok(min_block);
            }
        }

        Ok(0)
    }

    /// Poll the task
    #[autometrics]
    async fn poll_task(&self, mut min_block: i32) -> Result<i32> {
        // Get the polling metrics, set the attempt.
        PollingMetrics::set_attempt(self.chain_id);

        // Escape the static lifetime.
        let chain_id = self.chain_id;
        let index = 0;

        // Get the light wallet data, spawn a blocking task to not block the tokio runtime thread
        // used by the underlying reqwest client. (blocking)
        let user_operation = tokio::task::spawn_blocking(move || {
            {
                || {
                    run_user_operations_query(
                        chain_id,
                        GetUserOperationsQueryVariables {
                            min_block: BigInt(min_block.to_string()),
                            min_index: BigInt(index.to_string()),
                        },
                    )
                }
            }
            .retry(&ExponentialBuilder::default())
            .call()
        })
        .await?;

        // Get the data from the response.
        let data = user_operation?.data;

        // If can parse the data, loop through the wallets.
        if let Some(d) = data {
            // Get the wallets.
            let user_operations = d.user_operations;
            trace!(
                "Polling run, chain_id: {} min_block: {} index: {} user_operations: {:?}",
                self.chain_id,
                min_block,
                index,
                user_operations
            );

            // If the wallets is not empty, loop through the wallets.
            if !user_operations.is_empty() {
                for (index, op) in user_operations.iter().enumerate() {
                    // Create to db if the wallet has a successful event.
                    if let Some(user_operation_event) = &op.user_operation_event {
                        // Log the wallet along with the chain id.
                        info!(
                            "Wallet found, chain_id: {} user_operation_event: {:?}",
                            self.chain_id, user_operation_event
                        );

                        // Create the user operation in the db.
                        // let res = self.db_create_wallet(wallet).await;
                        // if res.is_err() {
                        //     error!("db_create_wallet error: {:?}", res);
                        // }

                        // Send the tx queue on all modes.
                        if self.kafka_client.is_some() && self.provider.is_some() {
                            let _ = self.send_tx_queue(op.block_number.0.parse().unwrap()).await;
                        }
                    }

                    // Return the minimum block number for the last wallet.
                    if index == user_operations.len() - 1 {
                        return Ok(op.block_number.0.parse().unwrap_or(min_block));
                    }
                }
            }

            // Set the min block to the returned block if the result is empty.
            let meta = d._meta;
            if let Some(m) = meta {
                min_block = m.block.number;
            }
        }

        Ok(min_block)
    }

    /// Create a new wallet in the db
    // TODO Blocked by `solutions` api to generate the Configuration
    // #[autometrics]
    // pub async fn db_create_wallet(
    //     &self,
    //     wallet: &LightWallet,
    // ) -> Result<Json<lightdotso_prisma::wallet::Data>, DbError> { { || { create_wallet(
    //   self.db_client.clone(), wallet.address.0.parse().unwrap(), self.chain_id as i64,
    //   wallet.factory.0.parse().unwrap(), Some(TESTNET_CHAIN_IDS.contains(&self.chain_id)), ) } }
    //   .retry(&ExponentialBuilder::default()) .await
    // }

    /// Add a new tx in the queue
    #[autometrics]
    pub async fn send_tx_queue(
        &self,
        block_number: i32,
    ) -> Result<(), lightdotso_kafka::rdkafka::error::KafkaError> {
        let client = self.kafka_client.clone().unwrap();
        let provider = self.provider.clone().unwrap();
        let chain_id = self.chain_id;

        let block = provider.get_block(block_number as u64).await.unwrap();

        let payload = serde_json::to_value((&block, &chain_id))
            .unwrap_or_else(|_| serde_json::Value::Null)
            .to_string();

        let _ = { || produce_transaction_message(client.clone(), &payload) }
            .retry(&ExponentialBuilder::default())
            .await;

        Ok(())
    }
}
