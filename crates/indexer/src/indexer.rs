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
    constants::{FACTORY_ADDRESSES, KAFKA_CHAIN_IDS, SLEEP_CHAIN_IDS, TESTNET_CHAIN_IDS},
    namespace::{ERC1155, ERC20, ERC721, IMAGE_HASH_UPDATED},
};
use autometrics::autometrics;
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use ethers::{
    prelude::Provider,
    providers::{Http, Middleware, ProviderError, Ws},
    types::{
        Action::{Call, Create, Reward, Suicide},
        Block, BlockNumber, Filter, Trace, Transaction, TransactionReceipt, H256, U256,
    },
    utils::to_checksum,
};
use futures::StreamExt;
use lightdotso_db::{
    db::{create_transaction_category, create_transaction_with_log_receipt, create_wallet},
    error::DbError,
};
use lightdotso_discord::notify_create_wallet;
use lightdotso_kafka::{
    get_producer, produce_transaction_message, rdkafka::producer::FutureProducer,
};
use lightdotso_prisma::PrismaClient;
use lightdotso_redis::{
    add_to_wallets, get_redis_client, is_wallet_present, redis::Client, set_block_status,
};
use lightdotso_tracing::tracing::{error, info, trace};
use std::{
    collections::{HashMap, HashSet},
    hash::Hash,
    str::FromStr,
    sync::Arc,
    time::Duration,
};
use tokio::time::sleep;

pub fn make_unique<T: Hash + Eq + Clone>(items: Vec<T>) -> Vec<T> {
    let unique_items: HashSet<_> = items.into_iter().collect();
    unique_items.into_iter().collect()
}

#[derive(Clone)]
pub struct Indexer {
    chain_id: usize,
    redis_client: Option<Arc<Client>>,
    kafka_client: Option<Arc<FutureProducer>>,
    http_client: Arc<Provider<Http>>,
    ws_client: Option<Arc<Provider<Ws>>>,
    webhook: String,
    // start_block: u64,
    // end_block: u64,
    // live: bool,
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
        let ws_client: Option<Arc<Provider<Ws>>> =
            match Provider::<Ws>::connect_with_reconnects(args.ws.to_string(), usize::MAX).await {
                Ok(client) => Some(Arc::new(client)),
                Err(_) => {
                    error!("Websocket connection failed.");
                    None
                }
            };

        // Create the redis client
        let redis_client: Option<Arc<Client>> =
            get_redis_client().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the kafka client
        let kafka_client: Option<Arc<FutureProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the indexer
        Self {
            chain_id: args.chain_id,
            webhook: args.webhook.clone(),
            // start_block: args.start_block,
            // end_block: args.end_block,
            // live: args.live,
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
        let client = self.ws_client.clone().unwrap();
        let mut stream = client.subscribe_blocks().await.unwrap();

        // Loop over the blocks
        while let Some(block) = stream.next().await {
            // Get the block number
            info!("New block: {:?}", block.clone().number.unwrap());

            // Check if the block is in the sleep chain ids
            if SLEEP_CHAIN_IDS.contains_key(&self.chain_id) {
                // Sleep for the duration
                sleep(Duration::from_secs(SLEEP_CHAIN_IDS[&self.chain_id] as u64)).await;
            }

            // Send the transaction to the queue for indexing
            if self.kafka_client.is_some() && KAFKA_CHAIN_IDS.contains(&self.chain_id) {
                let queue_res = self.send_tx_queue(block).await;
                if queue_res.is_err() {
                    error!("send_tx_queue error: {:?}", queue_res);
                }
                continue;
            }

            // Run the indexing
            self.index(db_client.clone(), block).await;
        }
    }

    /// The core indexing function.
    pub async fn index(&self, db_client: Arc<PrismaClient>, block: Block<H256>) {
        // Get the traced block
        let traced_block_result = self.get_traced_block(block.number.unwrap()).await;
        let traced_block = match traced_block_result {
            Ok(value) => value,
            Err(_) => return,
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
        trace!(?traces);

        // Create new vec for addresses
        let mut wallet_address_hashmap: HashMap<ethers::types::H160, ethers::types::H160> =
            HashMap::new();
        let mut tx_address_hashmap: HashMap<ethers::types::H256, Vec<ethers::types::H160>> =
            HashMap::new();
        let mut tx_address_type_hashmap: HashMap<
            ethers::types::H256,
            HashMap<ethers::types::H160, String>,
        > = HashMap::new();

        // Loop over the traces
        for trace in &traces {
            // Loop over traces that are create
            if let Create(res) = &trace.action && let Some(ethers::types::Res::Create(result)) = &trace.result {
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

        // Get the block logs
        let block_logs_result = self.get_block_logs(block.number.unwrap() - 1).await;
        let block_logs = match block_logs_result {
            Ok(value) => value,
            Err(_) => return,
        };
        trace!(?block_logs);

        // Loop over the block logs
        for log in block_logs {
            // Build the tx_address_hashmap
            let entry =
                tx_address_hashmap.entry(log.transaction_hash.unwrap()).or_insert_with(Vec::new);
            // Build the address_type_hashmap
            let address_type_entry = tx_address_type_hashmap
                .entry(log.transaction_hash.unwrap())
                .or_insert_with(HashMap::new);

            // Skip if no topics
            if log.topics.is_empty() {
                continue;
            }

            if log.topics[0] ==
                    // Event signature for `ImageHashUpdated(bytes32)`
                    H256::from_str(
                        "0x307ed6bd941ee9fc80f369c94af5fa11e25bab5102a6140191756c5474a30bfa",
                    )
                    .unwrap() &&
                log.topics.len() == 2
            {
                // Address for from
                entry.push(log.address);

                // Insert entries into the hashmap
                address_type_entry.insert(log.address, IMAGE_HASH_UPDATED.to_string());
            }

            // Filter the logs for transfers
            if log.topics[0] ==
                    // Event signature for `Transfer(address,address,uint256)`
                    H256::from_str(
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    )
                    .unwrap()
            {
                // If the id exists in the log for topic 3,
                // it's a ERC721 transfer
                if !log.topics.len() < 4 && !log.topics[3].is_zero() {
                    // Address for from
                    entry.push(log.topics[1].into());
                    // Address for to
                    entry.push(log.topics[2].into());
                    // Insert entries into the hashmap
                    address_type_entry.insert(log.topics[1].into(), ERC721.to_string());
                    address_type_entry.insert(log.topics[2].into(), ERC721.to_string());
                // It's a ERC20 transfer
                } else if log.topics.len() >= 3 {
                    // Address for from
                    entry.push(log.topics[1].into());
                    // Address for to
                    entry.push(log.topics[2].into());
                    // Insert entries into the hashmap
                    address_type_entry.insert(log.topics[1].into(), ERC20.to_string());
                    address_type_entry.insert(log.topics[2].into(), ERC20.to_string());
                }
            }

            if log.topics[0] ==
                    // Event signature for `TransferSingle(address,address,address,uint256,uint256)`
                    H256::from_str(
                        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
                    )
                    .unwrap() &&
                log.topics.len() == 5
            {
                // Address for from
                entry.push(log.topics[2].into());
                // Address for to
                entry.push(log.topics[3].into());
                // Insert entries into the hashmap
                address_type_entry.insert(log.topics[2].into(), ERC1155.to_string());
                address_type_entry.insert(log.topics[3].into(), ERC1155.to_string());
            }

            if log.topics[0] ==
                    // Event signature for `TransferBatch(address,address,address,uint256[],uint256[])`
                    H256::from_str(
                        "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb",
                    )
                    .unwrap() &&
                log.topics.len() == 5
            {
                // Address for from
                entry.push(log.topics[2].into());
                // Address for to
                entry.push(log.topics[3].into());
                // Insert entries into the hashmap
                address_type_entry.insert(log.topics[2].into(), ERC1155.to_string());
                address_type_entry.insert(log.topics[3].into(), ERC1155.to_string());
            }
        }

        // Loop over the hashes
        if !wallet_address_hashmap.is_empty() {
            // Get the logs for the newly created wallets
            let logs_result = self
                .get_block_image_hash_logs(
                    block.number.unwrap(),
                    wallet_address_hashmap.keys().cloned().collect(),
                )
                .await;
            let logs = match logs_result {
                Ok(value) => value,
                Err(_) => return,
            };
            trace!(?logs);

            // Loop over the logs
            // WARNING: The db_create_wallet function may fail when a factory address is invoked
            // multiple times in the same tx
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

                // Get the traced tx
                let trace_tx =
                    traces.iter().find(|&x| x.transaction_hash == log.transaction_hash).copied();

                // Create the transaction
                let _ = self
                    .db_create_transaction(
                        db_client.clone(),
                        log.transaction_hash.unwrap(),
                        block.timestamp,
                        trace_tx.cloned(),
                    )
                    .await;
            }
        }

        // Loop over the hashes
        if !tx_address_hashmap.is_empty() && self.redis_client.is_some() {
            // Create a vec of hashes and addresses
            // hashmap: {hash1: [address, address, address]}
            // tx_hashes: [hash1, hash1, hash1]
            // addresses: [address, address, address,]
            let (tx_hashes, addresses) = tx_address_hashmap.iter().fold(
                (Vec::new(), Vec::new()),
                |(mut h, mut a), (key, values)| {
                    h.extend(std::iter::repeat(*key).take(values.len()));
                    a.extend(values.iter().cloned());
                    (h, a)
                },
            );
            trace!(?tx_hashes);
            trace!(?addresses);

            // Check if the two vecs are the same length
            assert_eq!(tx_hashes.len(), addresses.len());

            // Check if the addresses exist on redis
            let check_res = self.check_if_exists_in_wallets(addresses.clone()).unwrap();
            trace!(?check_res);

            // Check if any of the addresses exist
            let has_wallets = check_res.iter().any(|&x| x);
            if !has_wallets {
                info!("No wallets found for block");
            } else {
                info!("Wallets found for block");

                // Create the hashes w/ check_res filter
                // wallet_tx_hashes: [hash1, hash3]
                // tx_hashes: [hash1, hash2, hash3]
                // check_res: [true, false, true]
                let wallet_tx_hashes: Vec<ethers::types::H256> = tx_hashes
                    .iter()
                    .zip(check_res.iter())
                    .filter(|(_, &check)| check)
                    .map(|(hsh, _)| *hsh)
                    .collect();
                trace!(?wallet_tx_hashes);

                // Create the wallet addresses w/ check_res filter
                // wallet_addresses: [addr1, addr3]
                // addresses: [addr1, addr2, addr3]
                // check_res: [true, false, true]
                let wallet_addresses: Vec<ethers::types::H160> = addresses
                    .iter()
                    .zip(check_res.iter())
                    .filter(|(_, &check)| check)
                    .map(|(addr, _)| *addr)
                    .collect();
                trace!(?wallet_addresses);

                // Check if the hashes length and check_res true length are the same
                assert_eq!(wallet_tx_hashes.len(), check_res.iter().filter(|&&x| x).count());
                assert_eq!(wallet_addresses.len(), check_res.iter().filter(|&&x| x).count());
                assert_eq!(wallet_tx_hashes.len(), wallet_addresses.len());

                // Get the unique hashes and addresses
                let unique_wallet_tx_hashes: Vec<ethers::types::H256> =
                    make_unique(wallet_tx_hashes);
                let unique_wallet_addreses: Vec<ethers::types::H160> =
                    make_unique(wallet_addresses);
                info!("unique_wallet_tx_hashes: {:?}", unique_wallet_tx_hashes.clone());
                info!("unique_wallet_addreses: {:?}", unique_wallet_addreses.clone());

                // Loop over the tx hashes
                for unique_wallet_tx_hash in unique_wallet_tx_hashes {
                    // Get the optional category
                    let tx_adress_category = tx_address_type_hashmap.get(&unique_wallet_tx_hash);

                    // Get the traced tx
                    let trace_tx = traces
                        .iter()
                        .find(|&x| x.transaction_hash.as_ref() == Some(&unique_wallet_tx_hash))
                        .copied();

                    if tx_adress_category.is_some() {
                        // Create the transaction for indexing if category exists
                        let _ = self
                            .db_create_transaction(
                                db_client.clone(),
                                unique_wallet_tx_hash,
                                block.timestamp,
                                trace_tx.cloned(),
                            )
                            .await;

                        for (addr, category) in tx_adress_category.unwrap() {
                            // Create the transaction category if wallet exists
                            if unique_wallet_addreses.contains(addr) {
                                let _ = self
                                    .db_create_transaction_category(
                                        db_client.clone(),
                                        addr,
                                        category,
                                        unique_wallet_tx_hash,
                                    )
                                    .await;
                            }

                            // Send the transaction to the queue if live indexing
                            // if self.live && self.kafka_client.is_some() {
                            //     let queue_res = self.send_tx_queue(&unique_wallet_tx_hash);
                            //     if queue_res.is_err() {
                            //         error!("send_tx_queue error: {:?}", queue_res);
                            //     }
                            // }
                        }
                    }
                }
            }
        }

        // Set the flag for the block
        if self.redis_client.is_some() {
            let _ = self.set_block_flag_true(block.number.unwrap().as_u64());
        }
    }

    /// Add a new tx in the queue
    #[autometrics]
    pub async fn send_tx_queue(
        &self,
        block: Block<H256>,
    ) -> Result<(), lightdotso_kafka::rdkafka::error::KafkaError> {
        let client = self.kafka_client.clone().unwrap();
        let chain_id = self.chain_id.to_string();
        let payload =
            serde_json::to_value(block).unwrap_or_else(|_| serde_json::Value::Null).to_string();

        let _ = { || produce_transaction_message(client.clone(), &chain_id, &payload) }
            .retry(&ExponentialBuilder::default())
            .await;

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
            { || add_to_wallets(&mut con, to_checksum(&address, None).as_str()) }
                .retry(&ExponentialBuilder::default())
                .call()
        } else {
            error!("Redis connection error, {:?}", con.err());
            Ok(())
        }
    }

    /// Set the block flag to true
    #[autometrics]
    pub fn set_block_flag_true(
        &self,
        block: u64,
    ) -> Result<(), lightdotso_redis::redis::RedisError> {
        let client = self.redis_client.clone().unwrap();
        let con = client.get_connection();
        if let Ok(mut con) = con {
            { || set_block_status(&mut con, self.chain_id, block as i64, true) }
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
                    is_wallet_present(
                        &mut con,
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

    /// Creates a new wallet in the database
    #[autometrics]
    pub async fn db_create_transaction(
        &self,
        db_client: Arc<PrismaClient>,
        hash: ethers::types::H256,
        timestamp: U256,
        trace: Option<Trace>,
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
                    trace,
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

    /// Creates a new transaction category in the database
    #[autometrics]
    pub async fn db_create_transaction_category(
        &self,
        db_client: Arc<PrismaClient>,
        address: &ethers::types::H160,
        category: &str,
        tx_hash: ethers::types::H256,
    ) -> Result<Json<lightdotso_prisma::transaction_category::Data>, DbError> {
        {
            || {
                create_transaction_category(
                    db_client.clone(),
                    *address,
                    category.to_string(),
                    tx_hash,
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
        trace: Option<Trace>,
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
                    trace.clone(),
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await
    }

    /// Get the block logs for the given block number
    #[autometrics]
    pub async fn get_block_logs(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Vec<ethers::types::Log>, ProviderError> {
        // Create the filter for the logs
        let filter = Filter::new()
            .from_block(BlockNumber::Number(block_number))
            .to_block(BlockNumber::Number(block_number));

        // Get the logs
        { || self.http_client.get_logs(&filter) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the logs for the given block number and addresses,
    /// filtered by the ImageHashUpdated event
    #[autometrics]
    pub async fn get_block_image_hash_logs(
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
