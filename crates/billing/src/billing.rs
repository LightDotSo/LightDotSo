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

#![allow(clippy::unwrap_used)]

use crate::config::BillingArgs;
use autometrics::autometrics;
use backon::{ExponentialBuilder, Retryable};
use ethers::{
    prelude::Provider,
    providers::{Http, Middleware},
    types::U256,
};
use eyre::Result;
use lightdotso_client::crypto::get_native_token_price;
use lightdotso_contracts::provider::get_provider;
use lightdotso_db::{
    db::create_client,
    models::{activity::CustomParams, billing_operation::create_billing_operation},
};
use lightdotso_kafka::{
    get_producer, rdkafka::producer::FutureProducer, topics::activity::produce_activity_message,
    types::activity::ActivityMessage,
};
use lightdotso_prisma::{billing_operation, ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_redis::{get_redis_client, redis::Client};
use lightdotso_tracing::tracing::info;
use std::sync::Arc;

#[allow(dead_code)]
#[derive(Clone)]
pub struct Billing {
    /// The db client
    db_client: Arc<PrismaClient>,
    /// The redis client
    redis_client: Option<Arc<Client>>,
    /// The kafka client
    kafka_client: Option<Arc<FutureProducer>>,
}

impl Billing {
    pub async fn new(_args: &BillingArgs) -> Result<Self> {
        info!("Billing new, starting");

        // Create the db client
        let db_client = Arc::new(create_client().await?);

        // Create the redis client
        let redis_client: Option<Arc<Client>> =
            get_redis_client().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the kafka client
        let kafka_client: Option<Arc<FutureProducer>> =
            get_producer().map_or_else(|_e| None, |client| Some(Arc::new(client)));

        // Create the billing
        Ok(Self { db_client, redis_client, kafka_client })
    }

    /// Get the provider
    pub async fn get_provider(&self, chain_id: u64) -> Result<Option<Arc<Provider<Http>>>> {
        // Create the provider
        let client: Option<Arc<Provider<Http>>> = get_provider(chain_id).await.ok().map(Arc::new);

        Ok(client)
    }

    /// Creates a new transaction with log receipt in the database
    #[autometrics]
    pub async fn db_create_billing_operation(
        &self,
        wallet_address: ethers::types::H160,
        db_client: Arc<PrismaClient>,
    ) -> Result<()> {
        { || create_billing_operation(db_client.clone(), wallet_address, "0x0".to_string()) }
            .retry(&ExponentialBuilder::default())
            .await
    }

    /// Get the native currency balance for the chain
    #[autometrics]
    pub async fn get_native_currency_balance(&self, chain_id: u64) -> Result<f64> {
        let res =
            { || get_native_token_price(chain_id) }.retry(&ExponentialBuilder::default()).await?;

        Ok(res)
    }

    /// Get the gas price for the chain
    #[autometrics]
    pub async fn get_gas_price(&self, chain_id: u64) -> Result<Option<U256>> {
        let client = self.get_provider(chain_id).await?;

        info!("get_block, chain_id: {}", chain_id);

        if let Some(client) = client {
            // Get the logs
            let res = { || client.get_gas_price() }.retry(&ExponentialBuilder::default()).await?;

            return Ok(Some(res));
        }

        Ok(None)
    }

    /// Add a new activity in the queue
    #[autometrics]
    pub async fn send_activity_queue(&self, op: billing_operation::Data) -> Result<()> {
        let client = self.kafka_client.clone().unwrap();
        let payload = serde_json::to_value(&op).unwrap_or_else(|_| serde_json::Value::Null);
        let billing_operation_id = op.clone().id;

        let msg = &ActivityMessage {
            operation: ActivityOperation::Update,
            log: payload.clone().to_owned(),
            params: CustomParams {
                billing_operation_id: Some(billing_operation_id),
                ..Default::default()
            },
        };

        let _ =
            { || produce_activity_message(client.clone(), ActivityEntity::BillingOperation, msg) }
                .retry(&ExponentialBuilder::default())
                .await;

        Ok(())
    }
}
