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

use crate::{
    state::ConsumerState,
    topics::{
        billing_operation::BillingOperationConsumer, error_transaction::ErrorTransactionConsumer,
    },
};
use async_trait::async_trait;
use eyre::Result;
use lazy_static::lazy_static;
use lightdotso_kafka::namespace::{BILLING_OPERATION, ERROR_TRANSACTION};
use lightdotso_state::ClientState;
use rdkafka::message::BorrowedMessage;
use std::{collections::HashMap, sync::Arc};

pub mod activity;
pub mod billing_operation;
pub mod covalent;
pub mod error_transaction;
pub mod interpretation;
pub mod node;
pub mod notification;
pub mod paymaster_operation;
pub mod portfolio;
pub mod routescan;
pub mod transaction;
pub mod unknown;
pub mod user_operation;

lazy_static! {
    pub static ref TOPIC_CONSUMERS: HashMap<String, Arc<dyn TopicConsumer + Send + Sync>> = {
        let mut m = HashMap::new();

        m.insert(
            BILLING_OPERATION.to_string(),
            Arc::new(BillingOperationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            ERROR_TRANSACTION.to_string(),
            Arc::new(ErrorTransactionConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );

        m
    };
}

#[async_trait]
pub trait TopicConsumer: Send + Sync {
    async fn consume(
        &self,
        state: &ClientState,
        consumer_state: Option<&ConsumerState>,
        msg: &BorrowedMessage<'_>,
    ) -> Result<()>;
}
