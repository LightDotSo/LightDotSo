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

use rdkafka::{config::ClientConfig, consumer::stream_consumer::StreamConsumer};

/// Get a producer with the given broker and settings.
pub fn get_consumer(group: &str) -> StreamConsumer {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", group)
        .set("bootstrap.servers", std::env::var("KAFKA_BROKER").unwrap())
        .set("sasl.mechanism", "SCRAM-SHA-256")
        .set("security.protocol", "SASL_SSL")
        .set("sasl.username", std::env::var("KAFKA_USERNAME").unwrap())
        .set("sasl.password", std::env::var("KAFKA_PASSWORD").unwrap())
        .create()
        .expect("Consumer creation failed");

    consumer
}
