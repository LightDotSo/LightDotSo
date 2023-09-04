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
    namespace::{RETRY_TRANSACTION, TRANSACTION},
    produce_error_transaction_message, produce_retry_transaction_message,
};
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
                                topic == RETRY_TRANSACTION.to_string() =>
                        {
                            // Convert the payload to a string
                            let payload_opt = m.payload_view::<str>();

                            // If the payload is valid
                            if let Some(Ok(payload)) = payload_opt {
                                // Deserialize the payload
                                match serde_json::from_slice::<(Block<H256>, u64)>(
                                    payload.as_bytes(),
                                ) {
                                    Ok((block, chain_id)) => {
                                        // Log each message as an example.
                                        info!(
                                            "Indexing block: {:?} at chain_id: {:?}",
                                            block.number.unwrap().as_u64(),
                                            chain_id
                                        );

                                        // Index the block
                                        let res = indexer
                                            .index_with_internal(
                                                db.clone(),
                                                block.clone(),
                                                chain_id,
                                            )
                                            .await;

                                        // Commit the message
                                        if let Err(e) = res {
                                            error!("Error while indexing block: {:?}", e);
                                            warn!("Adding block to retry queue");
                                            // Create a new producer
                                            let client = &self.producer.clone();

                                            // Get the block timestamp
                                            if let Ok(timestamp) = block.time() {
                                                // Produce the message w/ exponential backoff if
                                                // block timestamp to present is less than 1 hour
                                                // ago
                                                if timestamp >
                                                    chrono::Utc::now()
                                                        .checked_sub_signed(
                                                            chrono::Duration::hours(1),
                                                        )
                                                        .unwrap()
                                                {
                                                    info!("Block is less than 1 hour old, adding to retry queue");
                                                    let _ = {
                                                        || {
                                                            produce_retry_transaction_message(
                                                                client.clone(),
                                                                payload,
                                                            )
                                                        }
                                                    }
                                                    .retry(&ExponentialBuilder::default())
                                                    .await;
                                                } else {
                                                    warn!("Block is more than 1 hour old, adding to error queue");
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
                                            }
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
                        _ => {
                            // Log each message as an example.
                            info!("key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                            m.key(), m.payload_view::<str>(), m.topic(), m.partition(), m.offset(), m.timestamp());
                        }
                    }
                }
            };
        }
    }
}
