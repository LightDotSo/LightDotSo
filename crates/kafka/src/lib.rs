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

use rdkafka::{
    config::ClientConfig, consumer::stream_consumer::StreamConsumer, producer::BaseProducer,
};

/// Configure a Kafka client with the required settings.
pub fn configure_client(group: &str) -> ClientConfig {
    let mut binding = ClientConfig::new();
    let config = binding
        .set("group.id", group)
        .set("bootstrap.servers", std::env::var("KAFKA_BROKER").unwrap())
        .set("sasl.mechanism", "SCRAM-SHA-256")
        .set("security.protocol", "SASL_SSL")
        .set("sasl.username", std::env::var("KAFKA_USERNAME").unwrap())
        .set("sasl.password", std::env::var("KAFKA_PASSWORD").unwrap());

    config.clone()
}

/// Get a Kafka consumer with the required settings.
pub fn get_consumer(group: &str) -> Result<StreamConsumer, rdkafka::error::KafkaError> {
    let client_config = configure_client(group);
    client_config.create()
}

/// Get a Kafka producer with the required settings.
pub fn get_producer(group: &str) -> Result<BaseProducer, rdkafka::error::KafkaError> {
    let client_config = configure_client(group);
    client_config.create()
}
