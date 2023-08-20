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

use clap::Parser;
use ethers::types::{Block, Trace, H256};
use lightdotso_db::db::create_client;
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_kafka::{get_consumer, namespace::TRANSACTION};
use lightdotso_tracing::tracing::{info, warn};
use rdkafka::{
    consumer::{stream_consumer::StreamConsumer, CommitMode, Consumer as KafkaConsumer},
    Message,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct Consumer {
    consumer: Arc<StreamConsumer>,
    topics: Vec<String>,
}

impl Consumer {
    pub async fn new(args: &ConsumerArgs) -> Self {
        info!("Consumer new, starting");

        // Construct the consumer
        let consumer = Arc::new(get_consumer(&args.group).unwrap());

        // Create the consumer
        Self { consumer, topics: args.topics.clone() }
    }

    pub async fn run(&self) {
        info!("Consumer run, starting");

        // Parse the command line arguments
        let args = IndexerArgs::parse();

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
                    if topics.contains(&TRANSACTION.as_str()) {
                        // Convert the payload to a string
                        let payload_opt = m.payload_view::<str>();

                        // If the payload is valid
                        if let Some(Ok(payload)) = payload_opt {
                            // Deserialize the payload
                            match serde_json::from_slice::<(Block<H256>, Vec<Trace>)>(
                                payload.as_bytes(),
                            ) {
                                Ok((block, traces)) => {
                                    // Log each trace as an example.
                                    info!("key: '{:?}', block: '{:?}', traces: '{:?}', topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                                    m.key(), block, traces, m.topic(), m.partition(), m.offset(), m.timestamp());

                                    // Index the block
                                    let traces_ref: Vec<_> = traces.iter().collect();
                                    let res = args.index(db.clone(), block, traces_ref).await;

                                    // Commit the message
                                    if let Err(e) = res {
                                        warn!("Error while indexing block: {:?}", e);
                                        continue;
                                    }

                                    let _ = self.consumer.commit_message(&m, CommitMode::Async);
                                }
                                Err(e) => {
                                    warn!("Error while deserializing message payload: {:?}", e);
                                }
                            };
                        }
                    }
                }
            };
        }
    }
}
