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

#![allow(clippy::unwrap_used)]

use crate::{
    config::PollingArgs,
    constants::{SATSUMA, STUDIO},
};
use autometrics::autometrics;
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use chrono::Timelike;
use ethers::{
    prelude::Provider,
    providers::{Http, Middleware},
    types::{Address, Block, Log, Transaction, TransactionReceipt, H256},
    utils::to_checksum,
};
use eyre::{eyre, Result};
use lightdotso_contracts::{
    provider::get_provider,
    types::{UserOperationReceipt, UserOperationWithTransactionAndReceiptLogs},
};
use lightdotso_db::{
    db::create_client,
    models::{
        activity::CustomParams,
        transaction::upsert_transaction_with_log_receipt,
        user_operation::{
            get_user_operation_with_logs, update_user_operation_with_receipt,
            upsert_user_operation, upsert_user_operation_logs, DbUserOperationLogs,
        },
        wallet::upsert_wallet_with_configuration,
    },
};
use lightdotso_graphql::{
    constants::DEFAULT_CHAIN_SLEEP_SECONDS,
    polling::{
        min_block::run_min_block_query,
        user_operations::{
            run_user_operation_query, run_user_operations_query, BigInt,
            GetUserOperationQueryVariables, GetUserOperationsQueryVariables, UserOperation,
        },
    },
    traits::UserOperationConstruct,
};
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_kafka::{
    get_producer,
    rdkafka::producer::FutureProducer,
    topics::{
        activity::produce_activity_message, interpretation::produce_interpretation_message,
        transaction::produce_transaction_message,
    },
    types::{activity::ActivityMessage, interpretation::InterpretationMessage},
};
use lightdotso_opentelemetry::polling::PollingMetrics;
use lightdotso_prisma::{user_operation, ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_redis::{get_redis_client, query::wallet::add_to_wallets, redis::Client};
use lightdotso_sequence::init::get_image_hash_salt_from_init_code;
use lightdotso_tracing::tracing::{error, info, trace, warn};
use serde_json::json;
use std::{collections::HashMap, sync::Arc, time::Duration};

#[allow(dead_code)]
#[derive(Clone)]
pub struct Polling {
    /// The mode to poll in
    live: bool,
    // Create a mapping of chain_id to type to url
    chain_mapping: HashMap<u64, HashMap<String, String>>,
    /// Create a mapping of chain_id to sleep_seconds
    sleep_seconds_mapping: HashMap<u64, u64>,
    /// The db client
    db_client: Arc<PrismaClient>,
    /// The redis client
    redis_client: Option<Arc<Client>>,
    /// The kafka client
    kafka_client: Option<Arc<FutureProducer>>,
}

impl Polling {
    pub async fn new(
        _args: &PollingArgs,
        sleep_seconds_mapping: HashMap<u64, u64>,
        chain_mapping: HashMap<u64, HashMap<String, String>>,
        live: bool,
    ) -> Result<Self> {
        info!("Polling new, starting");

        // Create the db client
        let db_client = Arc::new(create_client().await?);

        // Create the redis client
        let redis_client: Option<Arc<Client>> =
            get_redis_client().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the kafka client
        let kafka_client: Option<Arc<FutureProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the polling
        Ok(Self {
            sleep_seconds_mapping,
            chain_mapping,
            live,
            db_client,
            redis_client,
            kafka_client,
        })
    }

    pub async fn run(&self, chain_id: u64, service_provider: String) {
        info!("Polling run, starting");

        // Get the url from the chain mapping.
        let url = self.chain_mapping.get(&chain_id).unwrap().get(&service_provider).unwrap();

        // Get the sleep seconds from the sleep seconds mapping.
        let sleep_seconds =
            *self.sleep_seconds_mapping.get(&chain_id).unwrap_or(&*DEFAULT_CHAIN_SLEEP_SECONDS);

        // Get the initial min block.
        let initial_min_block = self.get_min_block(url.to_string()).await.unwrap_or_default();

        let mut min_block = if self.live { initial_min_block } else { 0 };

        loop {
            // Wrap the task in a catch_unwind block to not crash the task if the task panics.
            let result = self.poll_task(chain_id, url.to_string(), min_block).await;

            match result {
                Ok(block) => {
                    let now = chrono::Utc::now();
                    // trace!("Polling run, chain_id: {} timestamp: {}", chain_id, now);

                    // Info if the second is divisible by 30 or 30 + 1.
                    if now.second() % 30 == 0 || now.second() % 30 == 1 {
                        info!(
                            "Polling run, chain_id: {} timestamp: {} url: {}",
                            chain_id, now, url
                        );
                    }

                    // On success, set the min block to the returned block.
                    min_block = block;

                    // If not live, check if the min block is greater to or equal to than the
                    // initial min block.
                    if !self.live && min_block >= initial_min_block {
                        warn!(
                            "Polling exiting, chain_id: {} min_block: {} initial_min_block: {} at url: {}",
                            chain_id, min_block, initial_min_block, url
                        );
                        break;
                    }

                    // Sleep for 1 second.
                    tokio::time::sleep(std::time::Duration::from_secs(sleep_seconds)).await;
                }
                Err(e) => {
                    error!("run_task {} panicked: {:?}", chain_id, e);

                    // Retry the task after 1 second.
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            }
        }
    }

    /// Run a single user operation query
    /// Get the user operation by the given index
    #[autometrics]
    pub async fn run_uop(&self, chain_id: u64, hash: H256) -> Result<()> {
        let chain = self.chain_mapping.get(&chain_id);

        // Get the url from the chain mapping.
        let maybe_url = match chain {
            Some(urls) => urls.get(&*SATSUMA.to_string()).or(urls.get(&*STUDIO.to_string())),
            None => None,
        };

        if let Some(url) = maybe_url {
            // Log the operation along with the chain id.
            info!("run_uop, chain_id: {}", chain_id);

            // Get the user operation by the given hash.
            let user_operation = self.poll_uop(url.to_string(), hash).await;

            // If the user operation is found, index the event.
            if let Ok(Some(op)) = user_operation {
                info!(
                    "User Operation found, chain_id: {} index: {} user_operation_event: {:?} ",
                    chain_id, op.index.0, op.user_operation_event
                );

                let _ = self.index_uop(chain_id, &op).await;

                // Return early if the user operation is found.
                return Ok(());
            }
        } else {
            // Warn if the url is not found.
            warn!("No url found for chain_id: {}", chain_id);
        }

        // Get the user operation by the given hash.
        let user_operation = self.get_user_operation_with_backon(chain_id, hash).await?;

        // Lot the user operation.
        info!("User Operation found, chain_id: {} user_operation: {:?}", chain_id, user_operation);

        // If the user operation is found, index the event.
        let _ = self.index_uop_with_receipt(chain_id, user_operation.result).await;

        Ok(())
    }

    /// Get a user operation
    /// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L128
    /// License: MIT
    pub async fn get_user_operation(
        &self,
        chain_id: u64,
        hash: H256,
    ) -> Result<Response<UserOperationReceipt>> {
        let params = vec![json!(format!("{:?}", hash))];
        println!("params: {:?}", params);

        let req_body = Request {
            jsonrpc: "2.0".to_string(),
            method: "eth_getUserOperationReceipt".to_string(),
            params: params.clone(),
            id: 1,
        };

        // Log the time before sending the user operation to the node
        info!("Getting user operation hash {:?} to the node at {}", hash, chrono::Utc::now());

        // Send the user operation to the node
        let client = reqwest::Client::new();

        let response = client
            .post(format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id))
            .json(&req_body)
            .send()
            .await?;

        // Handle the response for the JSON-RPC API.
        let res = handle_response(response).await?;

        Ok(res)
    }

    /// Get the min block
    #[autometrics]
    async fn get_min_block(&self, url: String) -> Result<i32> {
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

    pub async fn get_user_operation_with_backon(
        &self,
        chain_id: u64,
        hash: H256,
    ) -> Result<Response<UserOperationReceipt>> {
        let get_user_operation = || async { self.get_user_operation(chain_id, hash).await };

        let res = get_user_operation.retry(&ExponentialBuilder::default().with_max_times(10)).await;
        info!("res: {:?}", res);

        res
    }

    /// Index the event
    #[autometrics]
    async fn index_uop(&self, chain_id: u64, op: &UserOperation) -> Result<()> {
        // Create to db if the operation has a successful event.
        if let Some(user_operation_event) = &op.user_operation_event {
            // Log the operation along with the chain id.
            info!(
                "User Operation found, chain_id: {} index: {} user_operation_event: {:?} ",
                chain_id, op.index.0, user_operation_event,
            );

            // Add the wallet to the cache.
            if self.redis_client.is_some() {
                let _ = self.add_to_wallets(op);
            }

            // Attempt to create the wallet in the db.
            // (Fail if the wallet already exists)
            info!("db_try_create_wallet");
            let res = self.db_try_create_wallet(chain_id, op).await;
            if res.is_err() {
                error!("db_try_create_wallet error: {:?}", res);
            }

            // Attempt to create the user operation in the db.
            info!("db_upsert_transaction_with_log_receipt");
            let res = self.db_upsert_transaction_with_log_receipt(chain_id, op.clone()).await;
            if res.is_err() {
                error!(
                    "db_upsert_transaction_with_log_receipt error: {:?} at chain_id: {}",
                    res, chain_id
                );
            }

            // Create the user operation in the db.
            info!("db_upsert_user_operation");
            let res = self.db_upsert_user_operation(chain_id, op.clone()).await;
            if res.is_err() {
                error!("db_upsert_user_operation error: {:?} at chain_id: {}", res, chain_id);
            }

            // Upsert the user operation logs in the db.
            info!("db_upsert_user_operation_logs");
            let log_res = self.db_upsert_user_operation_logs(chain_id, op.clone()).await;
            if log_res.is_err() {
                error!("db_upsert_user_operation_logs error: {:?} at chain_id: {}", res, chain_id);
            }

            // Send the activity queue & interpretation ququjej on all modes.
            info!("send_activity_queue & send_interpretation_queue");
            if self.live && self.kafka_client.is_some() {
                if let Ok(res) = res {
                    let _ = self
                        .send_activity_queue(
                            res.0.clone().hash.parse()?,
                            res.0.clone().sender.parse()?,
                            res.0.clone(),
                        )
                        .await;
                    let _ = self
                        .send_interpretation_queue(
                            res.0.clone().hash.parse()?,
                            res.0.clone().transaction_hash.map(|h| h.parse().unwrap()),
                        )
                        .await;
                }
            }

            // Send the tx queue on all modes.
            info!("send_tx_queue");
            if self.kafka_client.is_some() {
                let _ = self.send_tx_queue(chain_id, op.block_number.0.parse().unwrap()).await;
            }
        }

        Ok(())
    }

    /// Index the uop with receipt
    async fn index_uop_with_receipt(
        &self,
        chain_id: u64,
        receipt: UserOperationReceipt,
    ) -> Result<()> {
        // Log the operation along with the chain id.
        info!("User Operation found, chain_id: {} receipt: {:?}", chain_id, receipt);

        // Upsert the transaction with the log receipt in the db.
        info!("db_upsert_transaction_with_transaction_receipt");
        let res = self
            .db_upsert_transaction_with_transaction_receipt(
                chain_id,
                receipt.sender,
                receipt.logs.clone(),
                receipt.tx_receipt.clone(),
            )
            .await;
        if res.is_err() {
            error!(
                "db_upsert_transaction_with_transaction_receipt error: {:?} at chain_id: {}",
                res, chain_id
            );
        }

        // Update the user operation in the db.
        info!("db_update_user_operation_with_receipt");
        let res = self.db_update_user_operation_with_receipt(receipt.clone()).await;
        if res.is_err() {
            error!(
                "db_update_user_operation_with_receipt error: {:?} at chain_id: {}",
                res, chain_id
            );
        }

        // Upsert the user operation logs in the db.
        info!("db_upsert_user_operation_with_receipt");
        let log_res = self.db_upsert_user_operation_with_receipt(chain_id, receipt.clone()).await;
        if log_res.is_err() {
            error!(
                "db_upsert_user_operation_with_receipt error: {:?} at chain_id: {}",
                res, chain_id
            );
        }

        // Send the activity queue & interpretation ququjej on all modes.
        info!("send_activity_queue & send_interpretation_queue");
        if self.live && self.kafka_client.is_some() {
            let db_user_operation =
                self.db_get_user_operation(receipt.clone().user_operation_hash).await?;

            let _ = self
                .send_activity_queue(
                    receipt.clone().user_operation_hash,
                    receipt.clone().sender,
                    db_user_operation.user_operation,
                )
                .await;
            let _ = self
                .send_interpretation_queue(
                    receipt.clone().user_operation_hash,
                    Some(receipt.clone().tx_receipt.transaction_hash),
                )
                .await;
        }

        // Send the tx queue on all modes.
        info!("send_tx_queue");
        if self.kafka_client.is_some() {
            let _ = self
                .send_tx_queue(
                    chain_id,
                    receipt.clone().tx_receipt.block_number.unwrap().as_u32() as i32,
                )
                .await;
        }

        Ok(())
    }

    /// Poll the task
    #[autometrics]
    async fn poll_task(&self, chain_id: u64, url: String, mut min_block: i32) -> Result<i32> {
        // Get the polling metrics, set the attempt.
        PollingMetrics::set_attempt(chain_id);

        // Set the index to 0.
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
                chain_id,
                min_block,
                index,
                user_operations
            );

            // If the operations is not empty, loop through the operations.
            if !user_operations.is_empty() {
                for (index, op) in user_operations.iter().enumerate() {
                    // Index the event.
                    self.index_uop(chain_id, op).await?;

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

    /// Poll a single user operation
    // #[autometrics]
    async fn poll_uop(&self, url: String, hash: H256) -> Result<Option<UserOperation>> {
        // Get the user operation query from the graphql api.
        let user_operation_res = tokio::task::spawn_blocking(move || {
            {
                || {
                    run_user_operation_query(
                        url.clone(),
                        GetUserOperationQueryVariables { id: &format!("{:?}", hash) },
                    )
                }
            }
            .retry(&ExponentialBuilder::default())
            .call()
        })
        .await?;

        // Get the data from the response.
        let data = user_operation_res?.data;

        // If can parse the data, return the user operation.
        if let Some(d) = data {
            return Ok(d.user_operation);
        }

        Ok(None)
    }

    /// Create a new operation in the db
    #[autometrics]
    pub async fn db_upsert_user_operation(
        &self,
        chain_id: u64,
        op: UserOperation,
    ) -> Result<Json<lightdotso_prisma::user_operation::Data>> {
        let db_client = self.db_client.clone();
        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        Ok({ || upsert_user_operation(db_client.clone(), uow.clone(), chain_id as i64) }
            .retry(&ExponentialBuilder::default())
            .await?)
    }

    /// Upserts user operation logs in db
    #[autometrics]
    pub async fn db_upsert_user_operation_logs(
        &self,
        chain_id: u64,
        op: UserOperation,
    ) -> Result<Json<()>> {
        let db_client = self.db_client.clone();
        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        Ok({
            || {
                upsert_user_operation_logs(
                    db_client.clone(),
                    uow.clone().chain_id,
                    uow.clone().transaction.hash,
                    uow.clone().hash,
                    uow.clone().logs,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await?)
    }

    /// Upserts user operation in the db from the receipt
    pub async fn db_upsert_user_operation_with_receipt(
        &self,
        chain_id: u64,
        receipt: UserOperationReceipt,
    ) -> Result<Json<()>> {
        let db_client = self.db_client.clone();

        Ok({
            || {
                upsert_user_operation_logs(
                    db_client.clone(),
                    chain_id as i64,
                    receipt.clone().tx_receipt.transaction_hash,
                    receipt.clone().user_operation_hash,
                    receipt.clone().logs,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await?)
    }

    /// Update the user operation in the db
    pub async fn db_update_user_operation_with_receipt(
        &self,
        op: UserOperationReceipt,
    ) -> Result<()> {
        let db_client = self.db_client.clone();

        let _ = {
            || {
                update_user_operation_with_receipt(
                    db_client.clone(),
                    op.clone().user_operation_hash,
                    op.clone(),
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await?;

        Ok(())
    }

    /// Get the user operation by the given hash
    #[autometrics]
    pub async fn db_get_user_operation(&self, hash: H256) -> Result<DbUserOperationLogs> {
        let db_client = self.db_client.clone();

        { || get_user_operation_with_logs(db_client.clone(), hash) }
            .retry(&ExponentialBuilder::default())
            .await
    }

    /// Create a new transaction w/ the log receipt
    #[autometrics]
    pub async fn db_upsert_transaction_with_log_receipt(
        &self,
        chain_id: u64,
        op: UserOperation,
    ) -> Result<Json<lightdotso_prisma::transaction::Data>> {
        let db_client = self.db_client.clone();

        let uoc = UserOperationConstruct { chain_id: chain_id as i64, user_operation: op.clone() };
        let uow: UserOperationWithTransactionAndReceiptLogs = uoc.into();

        let block = self.get_block(chain_id, uow.transaction.block_number.unwrap()).await?;

        if block.is_none() {
            return Err(eyre!("block not found"));
        }

        Ok({
            || {
                upsert_transaction_with_log_receipt(
                    db_client.clone(),
                    uow.clone().light_wallet,
                    uow.clone().transaction,
                    uow.clone().transaction_logs,
                    uow.clone().receipt,
                    chain_id as i64,
                    block.clone().unwrap().timestamp,
                    None,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await?)
    }

    /// Create a new transaction w/ the transaction receipt
    #[autometrics]
    pub async fn db_upsert_transaction_with_transaction_receipt(
        &self,
        chain_id: u64,
        wallet: Address,
        logs: Vec<Log>,
        receipt: TransactionReceipt,
    ) -> Result<Json<lightdotso_prisma::transaction::Data>> {
        let db_client = self.db_client.clone();

        let block = self.get_block(chain_id, receipt.block_number.unwrap()).await?;
        let transaction = self.get_transaction(chain_id, receipt.transaction_hash).await?;

        if block.is_none() {
            return Err(eyre!("block not found"));
        }

        Ok({
            || {
                upsert_transaction_with_log_receipt(
                    db_client.clone(),
                    wallet,
                    transaction.clone(),
                    logs.clone(),
                    receipt.clone(),
                    chain_id as i64,
                    block.clone().unwrap().timestamp,
                    None,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await?)
    }

    /// Attempt to create a new operation in the db
    #[autometrics]
    pub async fn db_try_create_wallet(
        &self,
        chain_id: u64,
        user_operation: &UserOperation,
    ) -> Result<Json<lightdotso_prisma::wallet::Data>> {
        let db_client = self.db_client.clone();

        if let Some(init_code) = &user_operation.init_code {
            if init_code.0.len() > 2 {
                let (_, salt) =
                    get_image_hash_salt_from_init_code(init_code.clone().0.into_bytes()).unwrap();

                return Ok({
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
                .await?);
            }
        }

        // Return not found if the init code is not found.
        Err(eyre!("init_code not found"))
    }

    /// Add a new wallet in the cache
    #[autometrics]
    pub fn add_to_wallets(&self, user_operation: &UserOperation) -> Result<()> {
        let address = user_operation.light_wallet.address.0.parse().unwrap();
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            let _ = { || add_to_wallets(&mut con, to_checksum(&address, None).as_str()) }
                .retry(&ExponentialBuilder::default())
                .call();
        } else {
            error!("Redis connection error, {:?}", con.err());
        }
        Ok(())
    }

    /// Add a new wallet in the cache w/ address
    #[autometrics]
    pub fn add_to_wallets_with_address(&self, address: &Address) -> Result<()> {
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            let _ = { || add_to_wallets(&mut con, to_checksum(address, None).as_str()) }
                .retry(&ExponentialBuilder::default())
                .call();
        } else {
            error!("Redis connection error, {:?}", con.err());
        }
        Ok(())
    }

    /// Get the provider
    pub async fn get_provider(&self, chain_id: u64) -> Result<Option<Arc<Provider<Http>>>> {
        // Create the provider
        let client: Option<Arc<Provider<Http>>> = get_provider(chain_id).await.ok().map(Arc::new);

        Ok(client)
    }

    /// Get the block logs for the given block number
    #[autometrics]
    pub async fn get_block(
        &self,
        chain_id: u64,
        block_number: ethers::types::U64,
    ) -> Result<Option<Block<H256>>> {
        let client = self.get_provider(chain_id).await?;

        info!("get_block, chain_id: {} block_number: {}", chain_id, block_number);

        if let Some(client) = client {
            // Get the logs
            let res =
                { || client.get_block(block_number) }.retry(&ExponentialBuilder::default()).await?;

            return Ok(res);
        }

        Ok(None)
    }

    /// Get the transaction for the given transaction hash
    #[autometrics]
    pub async fn get_transaction(
        &self,
        chain_id: u64,
        transaction_hash: H256,
    ) -> Result<Transaction> {
        let client = self.get_provider(chain_id).await?;

        info!("get_transaction, chain_id: {} transaction_hash: {}", chain_id, transaction_hash);

        if let Some(client) = client {
            // Get the transaction
            let res = { || client.get_transaction(transaction_hash) }
                .retry(&ExponentialBuilder::default())
                .await?;

            // Ensure the transaction is found
            if let Some(res) = res {
                return Ok(res);
            }
        }

        Err(eyre!("client not found"))
    }

    /// Add a new activity in the queue
    #[autometrics]
    pub async fn send_activity_queue(
        &self,
        user_operation_hash: H256,
        sender: Address,
        op: user_operation::Data,
    ) -> Result<()> {
        let client = self.kafka_client.clone().unwrap();
        let payload = serde_json::to_value(&op).unwrap_or_else(|_| serde_json::Value::Null);
        let msg = &ActivityMessage {
            operation: ActivityOperation::Update,
            log: payload.clone().to_owned(),
            params: CustomParams {
                user_operation_hash: Some(format!("{:?}", user_operation_hash.clone())),
                wallet_address: Some(to_checksum(&sender.clone(), None)),
                ..Default::default()
            },
        };

        let _ = { || produce_activity_message(client.clone(), ActivityEntity::UserOperation, msg) }
            .retry(&ExponentialBuilder::default())
            .await;

        Ok(())
    }

    /// Add a new interpretion in the queue
    #[autometrics]
    pub async fn send_interpretation_queue(
        &self,
        uop_hash: H256,
        transaction_hash: Option<H256>,
    ) -> Result<()> {
        let client = self.kafka_client.clone().unwrap();

        let uop_msg =
            &InterpretationMessage { user_operation_hash: Some(uop_hash), transaction_hash: None };

        let _ = { || produce_interpretation_message(client.clone(), uop_msg) }
            .retry(&ExponentialBuilder::default())
            .await;

        if let Some(tx_hash) = transaction_hash {
            let tx_msg = &InterpretationMessage {
                user_operation_hash: None,
                transaction_hash: Some(tx_hash),
            };

            let _ = { || produce_interpretation_message(client.clone(), tx_msg) }
                .retry(&ExponentialBuilder::default())
                .await;
        }

        Ok(())
    }

    /// Add a new tx in the queue
    #[autometrics]
    pub async fn send_tx_queue(&self, chain_id: u64, block_number: i32) -> Result<()> {
        let client = self.kafka_client.clone().unwrap();

        let provider = self.get_provider(chain_id).await?;

        if let Some(provider) = provider {
            let block = provider.get_block(block_number as u64).await.unwrap();

            let payload = serde_json::to_value((&block, &chain_id))
                .unwrap_or_else(|_| serde_json::Value::Null)
                .to_string();

            let _ = { || produce_transaction_message(client.clone(), &payload) }
                .retry(&ExponentialBuilder::default())
                .await;
        }

        Ok(())
    }
}

// Test the polling (just the get_user_operation part)
#[cfg(test)]
mod tests {
    use super::*;
    use lightdotso_tracing::init_test_tracing;
    use std::collections::HashMap;

    #[ignore]
    #[tokio::test]
    async fn test_polling() {
        init_test_tracing();

        let args = PollingArgs::default();
        let chain_mapping = HashMap::new();

        let polling = Polling::new(&args, HashMap::new(), chain_mapping, false).await.unwrap();

        let hash: H256 =
            "0x5c9ac218426e13b18f7260d73ce0ea2d86dd44e88886ef0265803829874ff140".parse().unwrap();
        let res = polling.get_user_operation(10, hash).await;

        println!("{:?}", res);

        assert!(res.is_ok());
    }
}
