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

use dotenvy::dotenv;
use eyre::Result;
use lightdotso_kafka::{get_consumer, get_producer};
use rdkafka::{consumer::Consumer, producer::FutureRecord};
use std::time::Duration;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_consumer() -> Result<()> {
    // Load dotenv
    let _ = dotenv();

    // Create a new test client
    let consumer = get_consumer("test").unwrap();

    // Subscribe to the topic
    consumer.subscribe(&["test"]).unwrap();

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_producer() -> Result<()> {
    // Load dotenv
    let _ = dotenv();

    // Create a new producer
    let producer = get_producer().unwrap();

    // Produce a message
    let res = producer
        .send(
            FutureRecord::to("test").payload("test").key("some-key"),
            Duration::from_millis(10000),
        )
        .await;

    println!("{:?}", res);

    Ok(())
}
