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

use eyre::{eyre, Result};
use lightdotso_tracing::tracing::error;
use rdkafka::{
    config::ClientConfig,
    consumer::stream_consumer::StreamConsumer,
    producer::{FutureProducer, FutureRecord},
};
use std::sync::Arc;

pub use rdkafka;

pub mod namespace;
pub mod topics;
pub mod traits;
pub mod types;

/// Configure a Kafka client with the required settings.
pub fn configure_client(group: &str) -> Result<ClientConfig, Box<dyn std::error::Error>> {
    // Get the environment variables
    let broker = std::env::var("KAFKA_BROKER")?;
    let username = std::env::var("KAFKA_USERNAME")?;
    let password = std::env::var("KAFKA_PASSWORD")?;

    let mut binding = ClientConfig::new();

    // If host is localhost, connect to kafka without security settings.
    if broker.starts_with("localhost") {
        let config = binding
            .set("group.id", group)
            .set("bootstrap.servers", broker)
            .set("key.serializer", "org.apache.kafka.common.serialization.StringSerializer")
            .set("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        return Ok(config.clone());
    }

    let config = binding
        .set("group.id", group)
        .set("bootstrap.servers", broker)
        .set("sasl.mechanism", "SCRAM-SHA-256")
        .set("security.protocol", "SASL_SSL")
        .set("auto.offset.reset", "latest")
        .set("enable.auto.commit", "false")
        .set("sasl.username", username)
        .set("sasl.password", password);

    Ok(config.clone())
}

/// Get a Kafka consumer with the required settings.
pub fn get_consumer(group: &str) -> Result<StreamConsumer> {
    // Set the group to the specified group.
    let client_config = configure_client(group);

    match client_config {
        Ok(config) => Ok(config.create()?),
        Err(e) => {
            error!("Failed to create client: {}", e);
            Err(eyre!("Failed to create client"))
        }
    }
}

/// Get a Kafka producer with the required settings.
pub fn get_producer() -> Result<FutureProducer> {
    // Set the group to "" since it's not needed for a producer.
    let client_config = configure_client("");

    match client_config {
        Ok(config) => Ok(config.create()?),
        Err(e) => {
            error!("Failed to create client: {}", e);
            Err(eyre!("Failed to create client"))
        }
    }
}

// Produce a message with the given topic.
pub async fn produce_message(
    producer: Arc<FutureProducer>,
    topic: &str,
    message: &str,
    key: Option<&str>,
) -> Result<()> {
    let payload = message.as_bytes();
    let topic = topic.to_string();

    let record = match key {
        Some(k) => FutureRecord::to(&topic).payload(payload).key(k.as_bytes()),
        None => FutureRecord::to(&topic).payload(payload),
    };

    producer.send::<_, _, _>(record, None).await.map_err(|(e, _)| e)?;

    Ok(())
}
