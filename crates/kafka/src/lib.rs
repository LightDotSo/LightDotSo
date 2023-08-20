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

use lightdotso_tracing::tracing::error;
pub use rdkafka;
use std::sync::Arc;

use namespace::TRANSACTION;
use rdkafka::{
    config::ClientConfig,
    consumer::stream_consumer::StreamConsumer,
    producer::{FutureProducer, FutureRecord},
};

pub mod namespace;

/// Configure a Kafka client with the required settings.
pub fn configure_client(group: &str) -> Result<ClientConfig, Box<dyn std::error::Error>> {
    // Get the environment variables
    let broker = std::env::var("KAFKA_BROKER")?;
    let username = std::env::var("KAFKA_USERNAME").unwrap_or("".to_string());
    let password = std::env::var("KAFKA_PASSWORD").unwrap_or("".to_string());

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
        .set("sasl.username", username)
        .set("sasl.password", password);

    Ok(config.clone())
}

/// Get a Kafka consumer with the required settings.
pub fn get_consumer(group: &str) -> Result<StreamConsumer, rdkafka::error::KafkaError> {
    let client_config = configure_client(group);
    if client_config.is_err() {
        return Err(rdkafka::error::KafkaError::ClientCreation("Failed to create client".into()));
    }
    client_config.unwrap().create()
}

/// Get a Kafka producer with the required settings.
pub fn get_producer() -> Result<FutureProducer, rdkafka::error::KafkaError> {
    // Ignores the group id for producers.
    let client_config = configure_client("");
    if client_config.is_err() {
        error!("Failed to create client");
        return Err(rdkafka::error::KafkaError::ClientCreation("Failed to create client".into()));
    }
    client_config.unwrap().create()
}

// Produce a message with the given topic.
pub async fn produce_message(
    producer: Arc<FutureProducer>,
    topic: &str,
    key: &str,
    message: &str,
) -> Result<(), rdkafka::error::KafkaError> {
    let payload = format!("{}", message);
    let record = FutureRecord::to(topic).payload(&payload).key(key);
    let _ = producer.send(record, None).await;
    Ok(())
}

// Produce a message with Transaction topic.
pub async fn produce_transaction_message(
    producer: Arc<FutureProducer>,
    key: &str,
    message: &str,
) -> Result<(), rdkafka::error::KafkaError> {
    produce_message(producer, TRANSACTION.as_str(), key, message).await
}
