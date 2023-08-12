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

use crate::{
    config::IndexerArgs,
    constants::{FACTORY_ADDRESSES, TESTNET_CHAIN_IDS},
};
use autometrics::autometrics;
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use ethers::{
    prelude::Provider,
    providers::{Http, Middleware, ProviderError, Ws},
    types::{
        Action::{Call, Create, Reward, Suicide},
        BlockNumber, Filter, Trace, Transaction, TransactionReceipt, U256,
    },
    utils::to_checksum,
};
use futures::StreamExt;
use lightdotso_db::{
    db::{create_transaction_with_log_receipt, create_wallet},
    error::DbError,
};
use lightdotso_discord::notify_create_wallet;
use lightdotso_kafka::{
    get_producer,
    rdkafka::producer::{BaseProducer, BaseRecord},
};
use lightdotso_prisma::PrismaClient;
use lightdotso_redis::{add_to_set, get_redis_client, is_all_members_present, redis::Client};
use lightdotso_tracing::tracing::info;
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::time::sleep;
use tracing::{error, trace};

#[derive(Clone)]
pub struct Indexer {
    chain_id: usize,
    redis_client: Option<Arc<Client>>,
    kafka_client: Option<Arc<BaseProducer>>,
    http_client: Arc<Provider<Http>>,
    ws_client: Arc<Provider<Ws>>,
    webhook: String,
}

impl Indexer {
    /// Constructs the new Indexer
    pub async fn new(args: &IndexerArgs) -> Self {
        info!("Indexer new, starting");

        // Create the http client
        let http_client = Arc::new(Provider::<Http>::try_from(args.rpc.to_string()).unwrap());

        // Check if the chain ID matches the arg chain ID
        let chain_id = http_client.get_chainid().await.unwrap();
        if (chain_id.as_u64() as usize) != args.chain_id {
            panic!("Chain ID mismatch: expected {}, got {}", args.chain_id, chain_id.as_u64());
        }

        // Create the websocket client
        let ws_client = Arc::new(
            Provider::<Ws>::connect_with_reconnects(args.ws.to_string(), usize::MAX).await.unwrap(),
        );

        // Create the redis client
        let redis_client: Option<Arc<Client>> =
            get_redis_client().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the kafka client
        let kafka_client: Option<Arc<BaseProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the indexer
        Self {
            chain_id: args.chain_id,
            webhook: args.webhook.clone(),
            http_client,
            ws_client,
            redis_client,
            kafka_client,
        }
    }

    /// Runs the indexer
    pub async fn run(&self, db_client: Arc<PrismaClient>) {
        info!("Indexer run, starting");

        // Initiate stream for new blocks
        let mut stream = self.ws_client.subscribe_blocks().await.unwrap();

        // Loop over the blocks
        while let Some(block) = stream.next().await {
            // Get the block number
            info!("New block: {:?}", block.clone().number.unwrap());

            // Sleep for 3 seconds
            sleep(Duration::from_secs(3)).await;

            // Get the traced block
            let traced_block_result = self.get_traced_block(block.number.unwrap()).await;
            let traced_block = match traced_block_result {
                Ok(value) => value,
                Err(_) => continue,
            };
            trace!(?traced_block);

            // Log the traced block length
            info!("Traced block length: {:?}", traced_block.len());

            // Filter the traces
            let traces: Vec<&Trace> = traced_block
                .iter()
                .filter(|trace| match &trace.action {
                    Call(_) => true,
                    Create(res) => FACTORY_ADDRESSES.contains(&res.from),
                    Reward(_) | Suicide(_) => false,
                })
                .collect();

            // Log the result of filtered traces
            info!("traces: {:?}", traces);

            // Create new vec for addresses
            let mut wallet_address_hashmap: HashMap<ethers::types::H160, ethers::types::H160> =
                HashMap::new();
            let mut tx_address_hashmap: HashMap<ethers::types::H256, Vec<ethers::types::H160>> =
                HashMap::new();

            // Loop over the traces
            for trace in traces {
                // Loop over traces that are create
                if let Create(res) = &trace.action && let Some(ethers::types::Res::Create(result)) = &trace.result {
                    info!("New created trace: {:?}", trace);
                    info!("New create action: {:?}", res);
                    info!("New init trace: {:?}", res.init);

                    // Log the newly created wallet address
                    info!("New wallet address: {:?}", result.address);

                    // Send redis if exists
                    if self.redis_client.is_some() {
                        let _ = self.add_to_wallets(result.address);
                    }

                    // Send webhook if exists
                    if !self.webhook.is_empty(){
                        notify_create_wallet(
                            &self.webhook,
                            &to_checksum(&result.address, None),
                            &self.chain_id.to_string(),
                            &trace.transaction_hash.unwrap().to_string()
                        ).await;
                    }

                    // Push the address to the wallets vec
                    wallet_address_hashmap.insert(result.address, res.from);
                }

                // Loop over the called traces
                if let Call(res) = &trace.action && let Some(ethers::types::Res::Call(_result)) = &trace.result {
                    // Build the tx_address_hashmap
                    let entry = tx_address_hashmap.entry(trace.transaction_hash.unwrap()).or_insert_with(Vec::new);

                    // Push the address to the tx vec
                    entry.push(res.from);
                    entry.push(res.to);
                }
            }

            // Loop over the hashes
            if !wallet_address_hashmap.is_empty() {
                // Get the logs for the newly created wallets
                let logs_result = self
                    .get_hash_logs(
                        block.number.unwrap(),
                        wallet_address_hashmap.keys().cloned().collect(),
                    )
                    .await;
                let logs = match logs_result {
                    Ok(value) => value,
                    Err(_) => continue,
                };
                trace!(?logs);

                for log in logs {
                    info!("log: {:?}", log);

                    // Create the wallet
                    let res = self
                        .db_create_wallet(
                            db_client.clone(),
                            log.clone(),
                            *wallet_address_hashmap.get(&log.address).unwrap(),
                        )
                        .await;

                    // Log if error
                    if res.is_err() {
                        return error!("create_wallet error: {:?}", res);
                    }

                    // Create the transaction
                    let _ = self
                        .db_create_transaction(
                            db_client.clone(),
                            log.transaction_hash.unwrap(),
                            block.timestamp,
                        )
                        .await;
                }
            }

            // Loop over the hashes
            if !tx_address_hashmap.is_empty() && self.redis_client.is_some() {
                // Loop over the tx hashes
                for (transaction_hash, addresses) in tx_address_hashmap {
                    // Check if the addresses exist on redis
                    let res = self.check_if_exists_in_wallets(addresses.clone()).unwrap();
                    trace!(?res);
                    let has_wallets = res.iter().any(|&x| x);

                    // Skip if no wallets
                    if !has_wallets {
                        continue;
                    }

                    // Create the transaction
                    let _ = self
                        .db_create_transaction(db_client.clone(), transaction_hash, block.timestamp)
                        .await;

                    if self.kafka_client.is_some() {
                        let _ = self.send_tx_queue(&transaction_hash);
                    }
                }
            }
        }
    }

    /// Add a new wallet in the cache
    #[autometrics]
    pub fn send_tx_queue(
        &self,
        hash: &ethers::types::H256,
    ) -> Result<(), lightdotso_kafka::rdkafka::error::KafkaError> {
        let client = self.kafka_client.clone().unwrap();
        let chain_id = self.chain_id.to_string();
        let hash = hash.clone().to_string();

        let _ = { || client.send(BaseRecord::to("transaction").key(&chain_id).payload(&hash)) }
            .retry(&ExponentialBuilder::default())
            .call();

        Ok(())
    }

    /// Add a new wallet in the cache
    #[autometrics]
    pub fn add_to_wallets(
        &self,
        address: ethers::types::H160,
    ) -> Result<(), lightdotso_redis::redis::RedisError> {
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            { || add_to_set(&mut con, "wallet", to_checksum(&address, None).as_str()) }
                .retry(&ExponentialBuilder::default())
                .call()
        } else {
            error!("Redis connection error, {:?}", con.err());
            Ok(())
        }
    }

    /// Check if the wallet exists in the cache
    #[autometrics]
    pub fn check_if_exists_in_wallets(
        &self,
        addresses: Vec<ethers::types::H160>,
    ) -> Result<std::vec::Vec<bool>, lightdotso_redis::redis::RedisError> {
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            {
                || {
                    is_all_members_present(
                        &mut con,
                        "wallets",
                        addresses.iter().map(|address| to_checksum(address, None)).collect(),
                    )
                }
            }
            .retry(&ExponentialBuilder::default())
            .call()
        } else {
            error!("Redis connection error, {:?}", con.err());
            Ok(vec![])
        }
    }

    #[autometrics]
    pub async fn db_create_transaction(
        &self,
        db_client: Arc<PrismaClient>,
        hash: ethers::types::H256,
        timestamp: U256,
    ) {
        // Get the tx receipt
        let tx_receipt = self.get_transaction_receipt(hash).await;
        trace!(?tx_receipt);

        // Get the tx
        let tx = self.get_transaction(hash).await;
        trace!(?tx);

        // Create the transaction with log receipt if both are not empty
        if tx_receipt.is_ok() && tx.is_ok() {
            let res = self
                .db_create_transaction_with_log_receipt(
                    db_client.clone(),
                    tx.unwrap(),
                    tx_receipt.unwrap(),
                    timestamp,
                )
                .await;

            // Log if error
            if res.is_err() {
                error!("create_transaction_with_log_receipt error: {:?}", res);
            }
        }
    }

    /// Creates a new wallet in the database
    #[autometrics]
    pub async fn db_create_wallet(
        &self,
        db_client: Arc<PrismaClient>,
        log: ethers::types::Log,
        factory_address: ethers::types::H160,
    ) -> Result<Json<lightdotso_prisma::wallet::Data>, DbError> {
        {
            || {
                create_wallet(
                    db_client.clone(),
                    log.clone(),
                    self.chain_id as i64,
                    factory_address,
                    Some(TESTNET_CHAIN_IDS.contains(&self.chain_id)),
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await
    }

    /// Creates a new transaction with log receipt in the database
    #[autometrics]
    pub async fn db_create_transaction_with_log_receipt(
        &self,
        db_client: Arc<PrismaClient>,
        tx: Option<Transaction>,
        tx_receipt: Option<TransactionReceipt>,
        timestamp: U256,
    ) -> Result<Json<lightdotso_prisma::transaction::Data>, DbError> {
        {
            || {
                create_transaction_with_log_receipt(
                    db_client.clone(),
                    tx.clone().unwrap(),
                    tx_receipt.clone().unwrap().logs,
                    tx_receipt.clone().unwrap(),
                    self.chain_id as i64,
                    timestamp,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await
    }

    /// Get the logs for the given block number and addresses,
    /// filtered by the ImageHashUpdated event
    #[autometrics]
    pub async fn get_hash_logs(
        &self,
        block_number: ethers::types::U64,
        addresses: Vec<ethers::types::H160>,
    ) -> Result<Vec<ethers::types::Log>, ProviderError> {
        // Create the filter for the logs
        let filter = Filter::new()
            .from_block(BlockNumber::Number(block_number))
            .event("ImageHashUpdated(bytes32)")
            .address(addresses);

        // Get the logs
        { || self.http_client.get_logs(&filter) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the transaction for the given hash
    #[autometrics]
    pub async fn get_transaction(
        &self,
        hash: ethers::types::H256,
    ) -> Result<Option<Transaction>, ProviderError> {
        // Get the block number
        { || self.http_client.get_transaction(hash) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the transaction receipt for the given hash
    #[autometrics]
    pub async fn get_transaction_receipt(
        &self,
        hash: ethers::types::H256,
    ) -> Result<Option<TransactionReceipt>, ProviderError> {
        // Get the block number
        { || self.http_client.get_transaction_receipt(hash) }
            .retry(&ExponentialBuilder::default())
            .await
    }

    /// Get the traced block for the given block number
    #[autometrics]
    pub async fn get_traced_block(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Vec<Trace>, ProviderError> {
        // Get the traced block
        { || self.http_client.trace_block(BlockNumber::Number(block_number)) }
            .retry(&ExponentialBuilder::default())
            .await
    }
}
