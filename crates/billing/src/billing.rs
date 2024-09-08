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
use eyre::{eyre, Result};
use lightdotso_client::crypto::get_native_token_price;
use lightdotso_contracts::provider::get_provider;
use lightdotso_db::{
    db::create_client,
    models::{activity::CustomParams, billing_operation::create_billing_operation},
};
use lightdotso_kafka::{
    get_producer,
    rdkafka::producer::FutureProducer,
    topics::activity::produce_activity_message,
    types::{activity::ActivityMessage, billing_operation::BillingOperationMessage},
};
use lightdotso_prisma::{billing_operation, ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_redis::{get_redis_client, redis::Client};
use lightdotso_tracing::tracing::info;
use lightdotso_utils::{get_native_token_symbol, is_testnet};
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

    /// Run the pending billing operation
    pub async fn run_pending(&self, msg: &BillingOperationMessage) -> Result<()> {
        info!("Run pending billing operation");

        // If chain is testnet, create a new billing operation w/ 0 USD
        if is_testnet(msg.chain_id) {
            self.db_create_billing_operation(
                self.db_client.clone(),
                msg.sender,
                msg.paymaster_operation_id.clone(),
                0.0,
            )
            .await?;

            return Ok(());
        }

        let currency_price_usd = self.get_native_currency_price(msg.chain_id).await?;

        // Log the currency
        info!("currency_price_usd: {}", currency_price_usd);

        // Get the gas price
        let gas_price =
            self.get_gas_price(msg.chain_id).await?.ok_or(eyre!("Gas price not found"))?;

        // Log the gas price
        info!("gas_price: {}", gas_price);

        // Calculate the gas limit
        let max_gas_limit =
            msg.pre_verification_gas + msg.verification_gas_limit + msg.call_gas_limit;

        // Log the gas limit
        info!("max_gas_limit: {}", max_gas_limit);

        // Multiply the gas price by the gas limit, denominated in ether 1e-18
        let max_gas_consumed = gas_price * U256::from(max_gas_limit);

        // Log the gas consumed
        info!("max_gas_consumed: {}", max_gas_consumed);

        // Calculate the total cost
        let total_cost_usd =
            (max_gas_consumed.as_u64() as f64) / 10_u64.pow(18) as f64 * currency_price_usd;

        // Log the total cost
        info!("total_cost_usd: {}", total_cost_usd);

        // Create the billing operation
        self.db_create_billing_operation(
            self.db_client.clone(),
            msg.sender,
            msg.paymaster_operation_id.clone(),
            total_cost_usd,
        )
        .await?;

        Ok(())
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
        db_client: Arc<PrismaClient>,
        wallet_address: ethers::types::H160,
        paymaster_operation_id: String,
        pending_usd: f64,
    ) -> Result<()> {
        {
            || {
                create_billing_operation(
                    db_client.clone(),
                    wallet_address,
                    paymaster_operation_id.clone(),
                    pending_usd,
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .await
    }

    /// Get the native currency balance for the chain
    #[autometrics]
    pub async fn get_native_currency_price(&self, chain_id: u64) -> Result<f64> {
        // Get the native token symbol
        let symbol = get_native_token_symbol(chain_id);

        let res = { || get_native_token_price(symbol.to_string()) }
            .retry(&ExponentialBuilder::default())
            .await?;

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

#[cfg(test)]
mod tests {
    use super::*;

    // Calculate the total cost
    #[tokio::test]
    async fn test_calculate_total_cost() {
        let currency_price_usd = 3000_f64;
        let gas_price = U256::from(1361699);
        let max_gas_limit = 306824_u64;
        let max_gas_consumed = gas_price * U256::from(max_gas_limit);

        println!("max_gas_consumed: {}", max_gas_consumed);

        let total_cost_usd =
            (max_gas_consumed.as_u64() as f64) / 10_u64.pow(18) as f64 * currency_price_usd;

        println!("total_cost_usd: {}", total_cost_usd);
    }
}
