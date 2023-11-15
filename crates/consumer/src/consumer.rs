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

use crate::config::ConsumerArgs;

use backon::{ExponentialBuilder, Retryable};
use clap::Parser;
use ethers::types::{Block, H256};
use lightdotso_db::db::create_client;
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_kafka::{
    get_consumer, get_producer,
    namespace::{
        ERROR_TRANSACTION, NOTIFICATION, RETRY_TRANSACTION, RETRY_TRANSACTION_0,
        RETRY_TRANSACTION_1, RETRY_TRANSACTION_2, TRANSACTION,
    },
    produce_error_transaction_message, produce_retry_transaction_0_message,
    produce_retry_transaction_1_message, produce_retry_transaction_2_message,
};
use lightdotso_notifier::config::NotifierArgs;
use lightdotso_opentelemetry::consumer::ConsumerMetrics;
use lightdotso_tracing::tracing::{error, info, warn};
use rdkafka::{
    consumer::{stream_consumer::StreamConsumer, CommitMode, Consumer as KafkaConsumer},
    producer::FutureProducer,
    Message,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct Consumer {
    consumer: Arc<StreamConsumer>,
    producer: Arc<FutureProducer>,
    topics: Vec<String>,
}

impl Consumer {
    pub async fn new(args: &ConsumerArgs) -> Self {
        info!("Consumer new, starting");

        // If the group is empty, read it from the environment var `FLY_APP_NAME`
        let group = if args.group.is_empty() {
            std::env::var("FLY_APP_NAME").unwrap_or("default".to_string())
        } else {
            args.group.clone()
        };
        info!("Consumer group: {}", group);

        // Panic if the topics are empty
        if args.topics.is_empty() {
            panic!("No topics specified");
        }

        // Construct the consumer
        let consumer = Arc::new(get_consumer(&group).unwrap());

        // Construct the producer
        let producer = Arc::new(get_producer().unwrap());

        // Create the consumer
        Self { consumer, producer, topics: args.topics.clone() }
    }

    pub async fn run(&self) {
        info!("Consumer run, starting");

        // Parse the command line arguments
        let args = IndexerArgs::parse();

        // Parse the notifer command line arguments
        let notifier_args = NotifierArgs::parse();

        // Create the indexer
        let mut indexer = args.create().await;

        // Create the db client
        let db = Arc::new(create_client().await.unwrap());

        // Convert the topics to a vector of strings
        let topics: Vec<&str> = self.topics.iter().map(AsRef::as_ref).collect();

        // Create the subscription
        self.consumer.subscribe(&topics[..]).expect("Can't subscribe to specified topics");

        loop {
            match self.consumer.recv().await {
                Err(e) => warn!("Kafka error: {}", e),
                Ok(m) => {
                    match m.topic() {
                        // If the topic is the transaction topic
                        topic
                            if topic == TRANSACTION.to_string() ||
                                topic == RETRY_TRANSACTION.to_string() ||
                                topic == RETRY_TRANSACTION_0.to_string() ||
                                topic == RETRY_TRANSACTION_1.to_string() ||
                                topic == RETRY_TRANSACTION_2.to_string() =>
                        {
                            // Convert the payload to a string
                            let payload_opt = m.payload_view::<str>();

                            // If the payload is valid
                            if let Some(Ok(payload)) = payload_opt {
                                // Try to deserialize the payload as (u64, u64)
                                let (maybe_block_number, chain_id): (u64, u64) =
                                    match serde_json::from_slice(payload.as_bytes()) {
                                        Ok(payload) => payload,
                                        Err(e) => {
                                            warn!(
                                                "Error while deserializing message payload: {:?}",
                                                e
                                            );
                                            (0, 0)
                                        }
                                    };

                                // Get the block if number is not 0
                                let maybe_block = if maybe_block_number != 0 {
                                    indexer
                                        .get_block_with_internal(maybe_block_number, chain_id)
                                        .await
                                } else {
                                    // Return an error
                                    Err(ethers::providers::ProviderError::CustomError(
                                        "Block number is 0".to_string(),
                                    ))
                                };

                                // If the block is valid, put as payload_block in bytes format w/
                                // (Block<H256>, u64)
                                let payload_block = match maybe_block {
                                    Ok(block) => {
                                        // If block is Some, get the chain id
                                        // Get the chain id
                                        if let Some(block) = block {
                                            // Serialize the block and chain id
                                            serde_json::to_string(&(block, chain_id)).unwrap()
                                        } else {
                                            // Return an error and continue to the next loop
                                            warn!("Block is None");
                                            continue;
                                        }
                                    }
                                    Err(e) => {
                                        warn!("Error while getting block: {:?}", e);
                                        payload.to_string()
                                    }
                                };

                                // Deserialize the payload
                                match serde_json::from_slice::<(Block<H256>, u64)>(
                                    payload_block.as_bytes(),
                                ) {
                                    Ok((block, chain_id)) => {
                                        // Get the block number
                                        let block_number = block.number.unwrap().as_u64();

                                        // Log each message as an example.
                                        info!(
                                            "Indexing block: {:?} at chain_id: {:?}",
                                            block_number, chain_id
                                        );

                                        // Index the block
                                        let res = indexer
                                            .index_with_internal(
                                                db.clone(),
                                                block.clone(),
                                                chain_id,
                                            )
                                            .await;

                                        // Write the metric to prometheus
                                        let value_to_add = if res.is_ok() { 1.0 } else { 0.0 };
                                        ConsumerMetrics::set_index_block(
                                            value_to_add,
                                            chain_id,
                                            block_number,
                                        );

                                        // Commit the message
                                        if let Err(e) = res {
                                            error!("Error while indexing block: {:?}", e);
                                            warn!("Adding block to retry queue");
                                            // Create a new producer
                                            let client = &self.producer.clone();

                                            if topic == TRANSACTION.to_string() ||
                                                topic == RETRY_TRANSACTION.to_string()
                                            {
                                                info!("Block: {:?} at chain_id: {:?} error, adding to retry queue: 0", block.number.unwrap().as_u64(), chain_id);
                                                let _ = {
                                                    || {
                                                        produce_retry_transaction_0_message(
                                                            client.clone(),
                                                            payload,
                                                        )
                                                    }
                                                }
                                                .retry(&ExponentialBuilder::default())
                                                .await;
                                            } else if topic == RETRY_TRANSACTION_0.to_string() {
                                                info!("Block: {:?} at chain_id: {:?} error, adding to retry queue: 1", block.number.unwrap().as_u64(), chain_id);
                                                let _ = {
                                                    || {
                                                        produce_retry_transaction_1_message(
                                                            client.clone(),
                                                            payload,
                                                        )
                                                    }
                                                }
                                                .retry(&ExponentialBuilder::default())
                                                .await;
                                            } else if topic == RETRY_TRANSACTION_1.to_string() {
                                                info!("Block: {:?} at chain_id: {:?} error, adding to retry queue: 2", block.number.unwrap().as_u64(), chain_id);
                                                let _ = {
                                                    || {
                                                        produce_retry_transaction_2_message(
                                                            client.clone(),
                                                            payload,
                                                        )
                                                    }
                                                }
                                                .retry(&ExponentialBuilder::default())
                                                .await;
                                            } else if topic == RETRY_TRANSACTION_2.to_string() {
                                                warn!("Block: {:?} at chain_id: {:?} error, adding to error queue", block.number.unwrap().as_u64(), chain_id);
                                                let _ = {
                                                    || {
                                                        produce_error_transaction_message(
                                                            client.clone(),
                                                            payload,
                                                        )
                                                    }
                                                }
                                                .retry(&ExponentialBuilder::default())
                                                .await;
                                            }

                                            // Continue to the next loop iteration
                                            continue;
                                        }

                                        // Log success
                                        info!(
                                            "Successfully indexed block: {:?} at chain_id: {:?}",
                                            block.number.unwrap().as_u64(),
                                            chain_id
                                        );

                                        // Commit the message
                                        let _ = self.consumer.commit_message(&m, CommitMode::Async);
                                    }
                                    Err(e) => {
                                        warn!("Error while deserializing message payload: {:?}", e);
                                    }
                                };
                            }
                        }
                        topic if topic == NOTIFICATION.to_string() => {
                            // Send webhook if exists
                            info!("key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                            m.key(), m.payload_view::<str>(), m.topic(), m.partition(), m.offset(), m.timestamp());

                            // Convert the payload to a string
                            let payload_opt = m.payload_view::<str>();
                            info!("payload_opt: {:?}", payload_opt);

                            let _ = notifier_args.run().await;
                        }
                        topic if topic == ERROR_TRANSACTION.to_string() => {
                            // Log error messages
                            info!("key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                            m.key(), m.payload_view::<str>(), m.topic(), m.partition(), m.offset(), m.timestamp());

                            // Commit the message
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        _ => {
                            // Log each message as an example.
                            info!("key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                            m.key(), m.payload_view::<str>(), m.topic(), m.partition(), m.offset(), m.timestamp());

                            // Commit the message
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                    }
                }
            };
        }
    }
}
