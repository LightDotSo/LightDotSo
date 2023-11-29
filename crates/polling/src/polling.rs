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
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use chrono::Timelike;
use ethers::{
    prelude::{Http, Provider, ProviderError},
    providers::Middleware,
    types::{Block, H256},
    utils::to_checksum,
};
use eyre::Result;
use lightdotso_contracts::{
    provider::get_provider, types::UserOperationWithTransactionAndReceiptLogs,
};
use lightdotso_db::{
    db::{
        create_client, upsert_transaction_with_log_receipt, upsert_user_operation,
        upsert_user_operation_logs, upsert_wallet_with_configuration,
    },
    error::DbError,
};
use lightdotso_graphql::{
    polling::{
        min_block::run_min_block_query,
        user_operations::{
            run_user_operations_query, BigInt, GetUserOperationsQueryVariables, UserOperation,
        },
    },
    traits::UserOperationConstruct,
};
use lightdotso_kafka::{
    get_producer, produce_transaction_message, rdkafka::producer::FutureProducer,
};
use lightdotso_opentelemetry::polling::PollingMetrics;
use lightdotso_prisma::PrismaClient;
use lightdotso_redis::{get_redis_client, redis::Client, wallet::add_to_wallets};
use lightdotso_solutions::init::get_image_hash_salt_from_init_code;
use lightdotso_tracing::tracing::{error, info, trace, warn};
use std::{sync::Arc, time::Duration};

#[allow(dead_code)]
#[derive(Clone)]
pub struct Polling {
    chain_id: u64,
    url: String,
    live: bool,
    db_client: Arc<PrismaClient>,
    redis_client: Option<Arc<Client>>,
    kafka_client: Option<Arc<FutureProducer>>,
    provider: Option<Arc<Provider<Http>>>,
}

impl Polling {
    pub async fn new(_args: &PollingArgs, chain_id: u64, url: String, live: bool) -> Self {
        info!("Polling new, starting");

        // Create the url
        let url = url.clone();

        // Create the db client
        let db_client = Arc::new(create_client().await.unwrap());

        // Create the redis client
        let redis_client: Option<Arc<Client>> =
            get_redis_client().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the kafka client
        let kafka_client: Option<Arc<FutureProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the provider
        let provider: Option<Arc<Provider<Http>>> = get_provider(chain_id).await.ok().map(Arc::new);

        // Create the polling
        Self { chain_id, url, live, db_client, redis_client, kafka_client, provider }
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
                    // trace!("Polling run, chain_id: {} timestamp: {}", self.chain_id, now);

                    // Info if the second is divisible by 30 or 30 + 1.
                    if now.second() % 30 == 0 || now.second() % 30 == 1 {
                        info!(
                            "Polling run, chain_id: {} timestamp: {} url: {}",
                            self.chain_id, now, self.url
                        );
                    }

                    // On success, set the min block to the returned block.
                    min_block = block;

                    // If not live, check if the min block is greater to or equal to than the
                    // initial min block.
                    if !self.live && min_block >= initial_min_block {
                        warn!(
                            "Polling exiting, chain_id: {} min_block: {} initial_min_block: {} at url: {}",
                            self.chain_id, min_block, initial_min_block, self.url
                        );
                        break;
                    }

                    // Sleep for 1 second.
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
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
        let url = self.url.clone();

        // Get the min_block query from the graphql api.
        let min_block_res = tokio::task::spawn_blocking(move || {
            { || run_min_block_query(url.clone()) }.retry(&ExponentialBuilder::default()).call()
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
        let url = self.url.clone();
        let index = 0;

        // Get the light operation data, spawn a blocking task to not block the tokio runtime thread
        // used by the underlying reqwest client. (blocking)
        let user_operation = tokio::task::spawn_blocking(move || {
            {
                || {
                    run_user_operations_query(
                        url.clone(),
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

        // If can parse the data, loop through the operations.
        if let Some(d) = data {
            // Get the operations.
            let user_operations = d.user_operations;
            trace!(
                "Polling run, chain_id: {} min_block: {} index: {} user_operations: {:?}",
                self.chain_id,
                min_block,
                index,
                user_operations
            );

            // If the operations is not empty, loop through the operations.
            if !user_operations.is_empty() {
                for (index, op) in user_operations.iter().enumerate() {
                    // Create to db if the operation has a successful event.
                    if let Some(user_operation_event) = &op.user_operation_event {
                        // Log the operation along with the chain id.
                        info!(
                            "User Operation found, chain_id: {} index: {} user_operation_event: {:?} ",
                            self.chain_id, op.index.0, user_operation_event,
                        );

                        // Add the wallet to the cache.
                        if self.redis_client.is_some() {
                            let _ = self.add_to_wallets(op);
                        }

                        // Attempt to create the wallet in the db.
                        // (Fail if the wallet already exists)
                        info!("db_try_create_wallet");
                        let res = self.db_try_create_wallet(op).await;
                        if res.is_err() {
                            error!("db_try_create_wallet error: {:?}", res);
                        }

                        // Attempt to create the user operation in the db.
                        info!("db_upsert_transaction_with_log_receipt");
                        let res = self.db_upsert_transaction_with_log_receipt(op.clone()).await;
                        if res.is_err() {
                            error!("db_upsert_transaction_with_log_receipt error: {:?}", res);
                        }

                        // Create the user operation in the db.
                        info!("db_upsert_user_operation");
                        let res = self.db_upsert_user_operation(op.clone()).await;
                        if res.is_err() {
                            error!("db_upsert_user_operation error: {:?}", res);
                        }

                        // Upsert the user operation logs in the db.
                        info!("db_upsert_user_operation_logs");
                        let res = self.db_upsert_user_operation_logs(op.clone()).await;
                        if res.is_err() {
                            error!("db_upsert_user_operation_logs error: {:?}", res);
                        }

                        // Send the tx queue on all modes.
                        if self.kafka_client.is_some() && self.provider.is_some() {
                            let _ = self.send_tx_queue(op.block_number.0.parse().unwrap()).await;
                        }
                    }

                    // Return the minimum block number for the last operation.
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

    /// Create a new operation in the db
    #[autometrics]
    pub async fn db_upsert_user_operation(
        &self,
        op: UserOperation,
    ) -> Result<Json<lightdotso_prisma::user_operation::Data>, DbError> {
        let db_client = self.db_client.clone();
        let chain_id = self.chain_id;
        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        { || upsert_user_operation(db_client.clone(), uow.clone(), chain_id as i64) }
            .retry(&ExponentialBuilder::default())
            .await
    }

    /// Upserts user operation logs in db
    #[autometrics]
    pub async fn db_upsert_user_operation_logs(
        &self,
        op: UserOperation,
    ) -> Result<Json<()>, DbError> {
        let db_client = self.db_client.clone();
        let chain_id = self.chain_id;
        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        { || upsert_user_operation_logs(db_client.clone(), uow.clone()) }
            .retry(&ExponentialBuilder::default())
            .await
    }

    /// Create a new transaction w/ the
    #[autometrics]
    pub async fn db_upsert_transaction_with_log_receipt(
        &self,
        op: UserOperation,
    ) -> Result<Json<lightdotso_prisma::transaction::Data>, DbError> {
        let db_client = self.db_client.clone();
        let chain_id = self.chain_id;

        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        let block = self.get_block(uow.transaction.block_number.unwrap()).await.unwrap().unwrap();

        {
            || {
                upsert_transaction_with_log_receipt(
                    db_client.clone(),
                    uow.clone().light_wallet,
                    uow.clone().transaction,
                    uow.clone().transaction_logs,
                    uow.clone().receipt,
                    chain_id as i64,
                    block.timestamp,
                    None,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await
    }

    /// Attempt to create a new operation in the db
    #[autometrics]
    pub async fn db_try_create_wallet(
        &self,
        user_operation: &UserOperation,
    ) -> Result<Json<lightdotso_prisma::wallet::Data>, DbError> {
        let db_client = self.db_client.clone();
        let chain_id = self.chain_id;

        if let Some(init_code) = &user_operation.init_code {
            let (_, salt) =
                get_image_hash_salt_from_init_code(init_code.clone().0.into_bytes()).unwrap();

            return {
                || {
                    upsert_wallet_with_configuration(
                        db_client.clone(),
                        user_operation.light_wallet.address.0.parse().unwrap(),
                        chain_id as i64,
                        salt.into(),
                        user_operation.light_wallet.factory.0.parse().unwrap(),
                    )
                }
            }
            .retry(&ExponentialBuilder::default())
            .await;
        }

        // Return not found if the init code is not found.
        Err(DbError::NotFound)
    }

    /// Add a new wallet in the cache
    #[autometrics]
    pub fn add_to_wallets(
        &self,
        user_operation: &UserOperation,
    ) -> Result<(), lightdotso_redis::redis::RedisError> {
        let address = user_operation.light_wallet.address.0.parse().unwrap();
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            { || add_to_wallets(&mut con, to_checksum(&address, None).as_str()) }
                .retry(&ExponentialBuilder::default())
                .call()
        } else {
            error!("Redis connection error, {:?}", con.err());
            Ok(())
        }
    }

    /// Get the block logs for the given block number
    #[autometrics]
    pub async fn get_block(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Option<Block<H256>>, ProviderError> {
        let client = self.provider.clone().unwrap();
        info!("get_block, chain_id: {} block_number: {}", self.chain_id, block_number);

        // Get the logs
        { || client.get_block(block_number) }.retry(&ExponentialBuilder::default()).await
    }

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
