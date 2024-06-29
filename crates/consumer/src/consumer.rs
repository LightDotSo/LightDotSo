// Copyright 2023-2024 Light
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

#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use crate::{
    config::ConsumerArgs,
    topics::{
        activity::activity_consumer, billing_operation::billing_operation_consumer,
        covalent::covalent_consumer, error_transaction::error_transaction_consumer,
        interpretation::interpretation_consumer, notification::notification_consumer,
        portfolio::portfolio_consumer, routescan::routescan_consumer,
        transaction::transaction_consumer, unknown::unknown_consumer,
        user_operation::user_operation_consumer,
    },
};
use clap::Parser;
use eyre::Result;
use lightdotso_db::db::create_client;
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_kafka::{
    get_consumer, get_producer,
    namespace::{
        ACTIVITY, BILLING_OPERATION, COVALENT, ERROR_TRANSACTION, INTERPRETATION, NOTIFICATION,
        PORTFOLIO, RETRY_TRANSACTION, RETRY_TRANSACTION_0, RETRY_TRANSACTION_1,
        RETRY_TRANSACTION_2, ROUTESCAN, TRANSACTION, USER_OPERATION,
    },
};
use lightdotso_notifier::config::NotifierArgs;
use lightdotso_polling::config::PollingArgs;
use lightdotso_tracing::tracing::{info, warn};
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

    pub async fn run(&self) -> Result<()> {
        info!("Consumer run, starting");

        // Parse the command line arguments
        let args = IndexerArgs::parse();

        // Parse the polling command line arguments
        let polling_args = PollingArgs::parse();

        // Parse the notifer command line arguments
        let notifier_args = NotifierArgs::parse();

        // Create the poller
        let poller = polling_args.create().await?;

        // Create the indexer
        let indexer = args.create().await;

        // Create the notifier
        let notifier = notifier_args.create().await?;

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
                            let _ = transaction_consumer(
                                self.producer.clone(),
                                topic,
                                &m,
                                db.clone(),
                                indexer.clone(),
                            )
                            .await;
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == ACTIVITY.to_string() => {
                            let res =
                                activity_consumer(self.producer.clone(), &m, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Activity consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == BILLING_OPERATION.to_string() => {
                            let res = billing_operation_consumer(&m).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Billing operation consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == COVALENT.to_string() => {
                            let res =
                                covalent_consumer(self.producer.clone(), &m, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Covalent consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == INTERPRETATION.to_string() => {
                            let res = interpretation_consumer(&m, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Interpretation consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == PORTFOLIO.to_string() => {
                            let res = portfolio_consumer(&m, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Portfolio consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == ROUTESCAN.to_string() => {
                            let res = routescan_consumer(&m, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Routescan consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == NOTIFICATION.to_string() => {
                            let res = notification_consumer(&m, &notifier, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("Notification consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == ERROR_TRANSACTION.to_string() => {
                            let _ = error_transaction_consumer(&m);
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == USER_OPERATION.to_string() => {
                            let res = user_operation_consumer(&m, &poller, db.clone()).await;
                            // If the consumer failed
                            if let Err(e) = res {
                                // Log the error
                                warn!("User operation consumer failed with error: {:?}", e);
                            }
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        _ => {
                            let _ = unknown_consumer(&m);
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                    }
                }
            };
        }
    }
}
