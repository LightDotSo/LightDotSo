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
    namespace::{ERC1155, ERC20, ERC721, ETH, IMAGE_HASH_UPDATED, LIGHT_WALLET_INITIALIZED},
};
use autometrics::autometrics;
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use ethers::{
    prelude::Provider,
    providers::{Http, Middleware, ProviderError, Ws},
    types::{
        Block, BlockNumber, CallFrame, Filter, GethDebugBuiltInTracerType, GethDebugTracerType,
        GethDebugTracingOptions, GethTrace, GethTraceFrame, Transaction, TransactionReceipt, H256,
        U256,
    },
    utils::to_checksum,
};
use ethers_providers::StreamExt;
use eyre::eyre;
use lightdotso_constants::{
    FACTORY_ADDRESSES, RUNNER_CHAIN_IDS, SLEEP_CHAIN_IDS, TESTNET_CHAIN_IDS,
};
use lightdotso_contracts::provider::get_provider;
use lightdotso_db::{
    db::{create_transaction_category, create_transaction_with_log_receipt, create_wallet},
    error::DbError,
};
use lightdotso_kafka::{
    get_producer, produce_transaction_message, rdkafka::producer::FutureProducer,
};
use lightdotso_prisma::PrismaClient;
use lightdotso_redis::{
    block::set_block_status,
    get_redis_client,
    redis::Client,
    wallet::{add_to_wallets, is_wallet_present},
};
use lightdotso_tracing::tracing::{error, info, trace, warn};
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
    chain_id: u64,
    redis_client: Option<Arc<Client>>,
    kafka_client: Option<Arc<FutureProducer>>,
    http_client: Option<Arc<Provider<Http>>>,
    ws_client: Option<Arc<Provider<Ws>>>,
}

impl Indexer {
    /// Constructs the new Indexer
    pub async fn new(args: &IndexerArgs) -> Self {
        info!("Indexer new, starting");

        // Create the http client
        let http_client = match Provider::<Http>::try_from(args.rpc.to_string()) {
            Ok(client) => Some(Arc::new(client)),
            Err(_) => None,
        };

        // Create the websocket client
        let ws_client =
            match Provider::<Ws>::connect_with_reconnects(args.ws.to_string(), usize::MAX).await {
                Ok(client) => Some(Arc::new(client)),
                Err(_) => {
                    // Only error if env var is not empty
                    if !args.ws.is_empty() {
                        error!("Websocket connection failed.");
                    }
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
        Self { chain_id: args.chain_id, http_client, ws_client, redis_client, kafka_client }
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

            // Send the transaction to the queue for indexing if not runner
            if self.kafka_client.is_some() && !RUNNER_CHAIN_IDS.contains(&self.chain_id) {
                let queue_res = self.send_tx_queue(block.clone()).await;
                if queue_res.is_err() {
                    error!("send_tx_queue error: {:?}", queue_res);
                }
                continue;
            }

            // Run the indexing
            let res = self.index(db_client.clone(), block.clone()).await;

            // Log if error
            if res.is_err() {
                error!("index error: {:?}", res);
                if self.kafka_client.is_some() {
                    let queue_res = self.send_tx_queue(block.clone()).await;
                    if queue_res.is_err() {
                        error!("send_tx_queue error: {:?}", queue_res);
                    }
                    continue;
                }
            }
        }
    }

    /// Index w/ specified chain id
    pub async fn index_with_internal(
        &mut self,
        db_client: Arc<PrismaClient>,
        block: Block<H256>,
        chain_id: u64,
    ) -> eyre::Result<()> {
        // Mutate the chain id
        self.chain_id = chain_id;

        // Get the http_client for the rpc
        let http_client = get_provider(chain_id).await?;
        self.http_client = Some(Arc::new(http_client));

        // Index the block
        self.index(db_client, block).await
    }

    /// The core indexing function.
    pub async fn index(
        &self,
        db_client: Arc<PrismaClient>,
        block: Block<H256>,
    ) -> eyre::Result<()> {
        info!("Indexer index, starting");

        // If the http client is none, return an error
        if self.http_client.is_none() {
            return Err(eyre!("Error: http client is none"));
        }

        // Get block from http client
        let block = self.get_block(block.number.unwrap()).await?.ok_or_else(|| {
            eyre!(
                "Error: Block not found at chain_id: {}, block: {}",
                self.chain_id,
                block.number.unwrap_or_default()
            )
        })?;
        trace!(?block);

        // Create new vec for addresses
        let mut wallet_address_hashmap: HashMap<
            ethers::types::H256,
            HashMap<ethers::types::H160, ethers::types::H160>,
        > = HashMap::new();
        let mut tx_address_hashmap: HashMap<ethers::types::H256, Vec<ethers::types::H160>> =
            HashMap::new();
        let mut tx_address_type_hashmap: HashMap<
            ethers::types::H256,
            HashMap<ethers::types::H160, String>,
        > = HashMap::new();

        // Get the traced block
        let traced_block = self.get_traced_block(block.number.unwrap()).await.map_err(|e| {
            eyre!(
                "Error in get_traced_block: {:?} at chain_id: {}, block: {}",
                e,
                self.chain_id,
                block.number.unwrap_or_default()
            )
        })?;
        trace!(?traced_block);

        // Check if the traced block length and block transactions length are the same
        if traced_block.len() != block.transactions.len() {
            return Err(eyre!(
                "Length mismatch: traced_block and block.transactions do not have the same length"
            ));
        }

        // Convert the traced block to a vec of call frames
        let traces: Vec<&CallFrame> = traced_block
            .iter()
            .filter_map(|trace| match trace {
                GethTrace::Known(frame) => match frame {
                    GethTraceFrame::CallTracer(call_frame) => Some(call_frame),
                    GethTraceFrame::Default(_) => None,
                    GethTraceFrame::NoopTracer(_) => None,
                    GethTraceFrame::FourByteTracer(_) => None,
                    GethTraceFrame::PreStateTracer(_) => None,
                },
                _ => None,
            })
            .collect();

        // Recursively loop over the traces
        for (index, trace) in traces.iter().enumerate() {
            self.iterate_from_addresses(
                index,
                trace,
                &block,
                &mut wallet_address_hashmap,
                &mut tx_address_hashmap,
                &mut tx_address_type_hashmap,
            )
        }

        // Get the block logs
        let block_logs = self
            .get_block_logs(block.number.unwrap() - 1)
            .await
            .map_err(|e| eyre!("Error in get_block_logs: {:?}", e))?;
        trace!(?block_logs);

        // Loop over the block logs
        for log in block_logs.clone() {
            // Build the tx_address_hashmap
            let entry = tx_address_hashmap.entry(log.transaction_hash.unwrap()).or_default();
            // Build the address_type_hashmap
            let address_type_entry =
                tx_address_type_hashmap.entry(log.transaction_hash.unwrap()).or_default();

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
            // Loop over the logs
            for (tx_hash, hashmap) in &wallet_address_hashmap {
                info!("wallet tx_hash: {:?}", tx_hash);

                // Get the address
                let address = hashmap.values().next().unwrap();

                // Get the trace
                let trace = self.get_geth_trace(&block, tx_hash, &traced_block);

                // Create the transaction
                let _ = self
                    .db_create_transaction(db_client.clone(), *tx_hash, block.timestamp, trace)
                    .await;

                // Create the transaction category
                let _ = self
                    .db_create_transaction_category(
                        db_client.clone(),
                        address,
                        &LIGHT_WALLET_INITIALIZED.to_string(),
                        *tx_hash,
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
            if tx_hashes.len() != addresses.len() {
                return Err(eyre!(
                    "Length mismatch: tx_hashes and addresses do not have the same length"
                ));
            }

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
                if wallet_tx_hashes.len() != check_res.iter().filter(|&&x| x).count() ||
                    wallet_addresses.len() != check_res.iter().filter(|&&x| x).count() ||
                    wallet_tx_hashes.len() != wallet_addresses.len()
                {
                    return Err(eyre!(
                        "Length mismatch: hashes and check_res do not have the same length"
                    ));
                }

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

                    if tx_adress_category.is_some() {
                        // Get the trace
                        let trace =
                            self.get_geth_trace(&block, &unique_wallet_tx_hash, &traced_block);

                        // Create the transaction for indexing if category exists
                        let _ = self
                            .db_create_transaction(
                                db_client.clone(),
                                unique_wallet_tx_hash,
                                block.timestamp,
                                trace,
                            )
                            .await;

                        if let Some(hashmap) = tx_adress_category {
                            for (addr, category) in hashmap {
                                // If the category is a wallet initialized
                                if category == &LIGHT_WALLET_INITIALIZED.to_string() {
                                    // Get the wallet entry
                                    let wallet_entry =
                                        wallet_address_hashmap.get(&unique_wallet_tx_hash);

                                    // Get the key for the wallet entry that matches the `from`
                                    // value
                                    let factory_address = wallet_entry
                                        .unwrap()
                                        .iter()
                                        .find(|(_, &v)| v == *addr)
                                        .unwrap()
                                        .0;

                                    // Get the log that matches the tx hash
                                    let initialized_logs = block_logs
                                        .clone()
                                        .into_iter()
                                        .filter(|log| {
                                            log.transaction_hash == Some(unique_wallet_tx_hash)
                                        })
                                        .collect::<Vec<ethers::types::Log>>();

                                    // Filter the logs for the `ImageHashUpdated(bytes32)`
                                    let image_hash_updated_logs = initialized_logs
                                        .clone()
                                        .into_iter()
                                        .filter(|log| {
                                            log.topics[0] ==
                                                // Event signature for `ImageHashUpdated(bytes32)`
                                                H256::from_str(
                                                    "0x307ed6bd941ee9fc80f369c94af5fa11e25bab5102a6140191756c5474a30bfa",
                                                )
                                                .unwrap() &&
                                                log.topics.len() == 2
                                        })
                                        .collect::<Vec<ethers::types::Log>>();

                                    // Get the last image hash updated log
                                    let image_hash_updated_log =
                                        image_hash_updated_logs.last().ok_or_else(|| {
                                            eyre!("Error: image_hash_updated_logs is empty")
                                        })?;

                                    // Create the wallet
                                    let _ = self
                                        .db_create_wallet(
                                            Arc::clone(&db_client),
                                            *addr,
                                            *factory_address,
                                            image_hash_updated_log.data.to_string(),
                                        )
                                        .await;
                                }

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
                            }
                        }
                    }
                }
            }
        }

        // Set the flag for the block
        if self.redis_client.is_some() {
            self.set_block_flag_true(block.number.unwrap().as_u64())
                .map_err(|e| eyre!("set_block_flag_true error: {:?}", e))?;
        }

        // Return the result
        Ok(())
    }

    pub fn iterate_from_addresses(
        &self,
        index: usize,
        frame: &CallFrame,
        block: &Block<H256>,
        wallet_address_hashmap: &mut HashMap<
            ethers::types::H256,
            HashMap<ethers::types::H160, ethers::types::H160>,
        >,
        tx_address_hashmap: &mut HashMap<ethers::types::H256, Vec<ethers::types::H160>>,
        tx_address_type_hashmap: &mut HashMap<
            ethers::types::H256,
            HashMap<ethers::types::H160, String>,
        >,
    ) {
        // Get the tx hash w/ the index
        let tx_hash = block.clone().transactions[index];

        // Build the tx_address_hashmap
        let entry = tx_address_hashmap.entry(tx_hash).or_default();
        // Build the address_type_hashmap
        let address_type_entry = tx_address_type_hashmap.entry(tx_hash).or_default();

        // Convert the to address to a wallet address
        // If the to address is none, use the from address
        // Temporarily use the from address if the to address is not a wallet address
        let to = match frame.to.clone() {
            Some(address) => match address.as_address() {
                Some(addr) => *addr,
                None => {
                    warn!("Conversion warning: to address is not a wallet address: {:?}", address);
                    frame.from
                }
            },
            None => {
                warn!("Conversion warning: to address is none, using from address");
                frame.from
            }
        };

        // Push the from and to address to the tx_address_hashmap
        entry.push(frame.from);
        entry.push(to);

        // If the value is a eth transfer
        if frame.value.is_some() && frame.input.0.is_empty() {
            // Log if the value is not zero
            if frame.value.unwrap() != U256::zero() {
                address_type_entry.entry(frame.from).or_insert(ETH.to_string());
                address_type_entry.entry(to).or_insert(ETH.to_string());
            }
        }

        // Loop over the calls
        if frame.typ == "CREATE2" {
            // If the from address is a factory address
            if FACTORY_ADDRESSES.contains(&frame.from) {
                // Build the wallet_address_hashmap
                let wallet_entry = wallet_address_hashmap.entry(tx_hash).or_default();

                // Send redis if exists
                if self.redis_client.is_some() {
                    let _ = self.add_to_wallets(to);
                }

                // Push the address to the wallets vec
                wallet_entry.insert(frame.from, to);
            }
        }

        if let Some(calls) = &frame.calls {
            for frame in calls {
                self.iterate_from_addresses(
                    index,
                    frame,
                    block,
                    wallet_address_hashmap,
                    tx_address_hashmap,
                    tx_address_type_hashmap,
                );
            }
        }
    }

    /// Get the geth trace from the block w/ hash
    pub fn get_geth_trace(
        &self,
        block: &Block<H256>,
        hash: &ethers::types::H256,
        traced_block: &[GethTrace],
    ) -> Option<GethTrace> {
        // Get the index of the tx in blocks.transactions
        let index = block.transactions.iter().position(|&x| x == *hash).unwrap_or(0);

        // Get the trace
        let trace = traced_block[index].clone();

        Some(trace)
    }

    /// Add a new tx in the queue
    #[autometrics]
    pub async fn send_tx_queue(
        &self,
        block: Block<H256>,
    ) -> Result<(), lightdotso_kafka::rdkafka::error::KafkaError> {
        let client = self.kafka_client.clone().unwrap();
        let chain_id = self.chain_id;
        let payload = serde_json::to_value((&block, &chain_id))
            .unwrap_or_else(|_| serde_json::Value::Null)
            .to_string();

        let _ = { || produce_transaction_message(client.clone(), &payload) }
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
        trace: Option<GethTrace>,
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
        address: ethers::types::H160,
        factory_address: ethers::types::H160,
        hash: String,
    ) -> Result<Json<lightdotso_prisma::wallet::Data>, DbError> {
        {
            || {
                create_wallet(
                    db_client.clone(),
                    address,
                    self.chain_id as i64,
                    factory_address,
                    hash.clone(),
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
        trace: Option<GethTrace>,
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
    pub async fn get_block(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Option<Block<H256>>, ProviderError> {
        let client = self.http_client.clone().unwrap();

        // Get the logs
        { || client.get_block(block_number) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the block logs for the given block number
    #[autometrics]
    pub async fn get_block_logs(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Vec<ethers::types::Log>, ProviderError> {
        let client = self.http_client.clone().unwrap();

        // Create the filter for the logs
        let filter = Filter::new()
            .from_block(BlockNumber::Number(block_number))
            .to_block(BlockNumber::Number(block_number));

        // Get the logs
        { || client.get_logs(&filter) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the transaction for the given hash
    #[autometrics]
    pub async fn get_transaction(
        &self,
        hash: ethers::types::H256,
    ) -> Result<Option<Transaction>, ProviderError> {
        let client = self.http_client.clone().unwrap();

        // Get the block number
        { || client.get_transaction(hash) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the transaction receipt for the given hash
    #[autometrics]
    pub async fn get_transaction_receipt(
        &self,
        hash: ethers::types::H256,
    ) -> Result<Option<TransactionReceipt>, ProviderError> {
        let client = self.http_client.clone().unwrap();

        // Get the block number
        { || client.get_transaction_receipt(hash) }.retry(&ExponentialBuilder::default()).await
    }

    /// Get the traced block for the given block number
    #[autometrics]
    pub async fn get_traced_block(
        &self,
        block_number: ethers::types::U64,
    ) -> Result<Vec<GethTrace>, ProviderError> {
        let client = self.http_client.clone().unwrap();

        let opts = GethDebugTracingOptions {
            disable_storage: None,
            disable_stack: None,
            enable_memory: None,
            enable_return_data: None,
            tracer: Some(GethDebugTracerType::BuiltInTracer(
                GethDebugBuiltInTracerType::CallTracer,
            )),
            tracer_config: None,
            timeout: None,
        };
        let block_num = BlockNumber::Number(block_number);

        // Get the traced block
        { || client.debug_trace_block_by_number(Some(block_num), opts.clone()) }
            .retry(&ExponentialBuilder::default())
            .await
    }
}
