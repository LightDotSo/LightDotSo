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
