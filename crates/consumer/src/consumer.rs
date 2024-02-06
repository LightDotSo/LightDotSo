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

#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use crate::{
    config::ConsumerArgs,
    topics::{
        activity::activity_consumer, covalent::covalent_consumer,
        error_transaction::error_transaction_consumer, interpretation::interpretation_consumer,
        notification::notification_consumer, portfolio::portfolio_consumer,
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
        ACTIVITY, COVALENT, ERROR_TRANSACTION, INTERPRETATION, NOTIFICATION, PORTFOLIO,
        RETRY_TRANSACTION, RETRY_TRANSACTION_0, RETRY_TRANSACTION_1, RETRY_TRANSACTION_2,
        TRANSACTION, USER_OPERATION,
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
        let poller = polling_args.create(0).await?;

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
                            let _ = activity_consumer(&m, db.clone()).await;
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
                        topic if topic == NOTIFICATION.to_string() => {
                            let _ = notification_consumer(&m, &notifier).await;
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == ERROR_TRANSACTION.to_string() => {
                            let _ = error_transaction_consumer(&m);
                            let _ = self.consumer.commit_message(&m, CommitMode::Async);
                        }
                        topic if topic == USER_OPERATION.to_string() => {
                            let _ = user_operation_consumer(&m, &poller).await;
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
