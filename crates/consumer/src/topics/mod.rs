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
        activity::ActivityConsumer, billing_operation::BillingOperationConsumer,
        error_transaction::ErrorTransactionConsumer, interpretation::InterpretationConsumer,
        node::NodeConsumer, notification::NotificationConsumer,
        paymaster_operation::PaymasterOperationConsumer, portfolio::PortfolioConsumer,
        routescan::RoutescanConsumer, transaction::TransactionConsumer,
        user_operation::UserOperationConsumer,
    },
};
use async_trait::async_trait;
use covalent::CovalentConsumer;
use eyre::Result;
use lazy_static::lazy_static;
use lightdotso_kafka::namespace::{
    ACTIVITY, BILLING_OPERATION, COVALENT, ERROR_TRANSACTION, INTERPRETATION, NODE, NOTIFICATION,
    PAYMASTER_OPERATION, PORTFOLIO, ROUTESCAN, TRANSACTION, USER_OPERATION,
};
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
            ACTIVITY.to_string(),
            Arc::new(ActivityConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            BILLING_OPERATION.to_string(),
            Arc::new(BillingOperationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            COVALENT.to_string(),
            Arc::new(CovalentConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            ERROR_TRANSACTION.to_string(),
            Arc::new(ErrorTransactionConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            INTERPRETATION.to_string(),
            Arc::new(InterpretationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            PAYMASTER_OPERATION.to_string(),
            Arc::new(PaymasterOperationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(NODE.to_string(), Arc::new(NodeConsumer) as Arc<dyn TopicConsumer + Send + Sync>);
        m.insert(
            NOTIFICATION.to_string(),
            Arc::new(NotificationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            PORTFOLIO.to_string(),
            Arc::new(PortfolioConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            ROUTESCAN.to_string(),
            Arc::new(RoutescanConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            TRANSACTION.to_string(),
            Arc::new(TransactionConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
        );
        m.insert(
            USER_OPERATION.to_string(),
            Arc::new(UserOperationConsumer) as Arc<dyn TopicConsumer + Send + Sync>,
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
