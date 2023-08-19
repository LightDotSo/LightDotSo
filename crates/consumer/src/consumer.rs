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

use std::sync::Arc;

use lightdotso_kafka::get_consumer;
use rdkafka::{
    consumer::{stream_consumer::StreamConsumer, CommitMode, Consumer as KafkaConsumer},
    message::Headers,
    Message,
};
use tracing::{info, warn};

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

        // Convert the topics to a vector of strings
        let topics: Vec<&str> = self.topics.iter().map(AsRef::as_ref).collect();

        // Create the subscription
        self.consumer.subscribe(&topics[..]).expect("Can't subscribe to specified topics");

        loop {
            match self.consumer.recv().await {
                Err(e) => warn!("Kafka error: {}", e),
                Ok(m) => {
                    let payload = match m.payload_view::<str>() {
                        None => "",
                        Some(Ok(s)) => s,
                        Some(Err(e)) => {
                            warn!("Error while deserializing message payload: {:?}", e);
                            ""
                        }
                    };

                    // Log the message
                    info!("key: '{:?}', payload: '{}', topic: {}, partition: {}, offset: {}, timestamp: {:?}",
                      m.key(), payload, m.topic(), m.partition(), m.offset(), m.timestamp());

                    if let Some(headers) = m.headers() {
                        for header in headers.iter() {
                            info!("  Header {:#?}: {:?}", header.key, header.value);
                        }
                    }
                    self.consumer.commit_message(&m, CommitMode::Async).unwrap();
                }
            };
        }
    }
}
