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

use super::TopicConsumer;
use crate::state::ConsumerState;
use async_trait::async_trait;
use eyre::Result;
use lightdotso_db::models::portfolio::get_portfolio;
use lightdotso_kafka::types::portfolio::PortfolioMessage;
use lightdotso_prisma_postgres::wallet_balance;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::bigdecimal::{BigDecimal, ToPrimitive};
use rdkafka::{message::BorrowedMessage, Message};
use serde::Deserialize;

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct PortfolioConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for PortfolioConsumer {
    async fn consume(
        &self,
        state: &ClientState,
        _consumer_state: Option<&ConsumerState>,
        msg: &BorrowedMessage<'_>,
    ) -> Result<()> {
        // Convert the payload to a string
        let payload_opt = msg.payload_view::<str>();
        info!("payload_opt: {:?}", payload_opt);

        // If the payload is valid
        if let Some(Ok(payload)) = payload_opt {
            // Parse the payload into a JSON object, `PortfolioMessage`
            let payload: PortfolioMessage = serde_json::from_slice(payload.as_bytes())?;

            // Log the payload
            info!("payload: {:?}", payload);

            // Consume the message
            self.consume_with_message(state, payload).await?;
        }
        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl PortfolioConsumer {
    pub async fn consume_with_message(
        &self,
        state: &ClientState,
        payload: PortfolioMessage,
    ) -> Result<()> {
        let latest_portfolio = get_portfolio(&state.pool, payload.address).await?;
        info!("latest_portfolio: {:?}", latest_portfolio);

        // If the length is more than 0, parse the balance.
        if let Some(portfolio) = latest_portfolio {
            let latest_portfolio_balance = portfolio.balance_usd.to_f64().unwrap_or(0.0);
            info!("latest_portfolio: {:?}", latest_portfolio_balance);

            let _: Result<()> = state
                .postgres_client
                ._transaction()
                .run(|client| async move {
                    client
                        .wallet_balance()
                        .update_many(
                            vec![
                                wallet_balance::wallet_address::equals(
                                    payload.address.to_checksum(None),
                                ),
                                wallet_balance::chain_id::equals(0.0),
                            ],
                            vec![wallet_balance::is_latest::set(false)],
                        )
                        .exec()
                        .await?;

                    client
                        .wallet_balance()
                        .create(
                            latest_portfolio_balance,
                            0.0,
                            payload.address.to_checksum(None),
                            vec![wallet_balance::is_latest::set(true)],
                        )
                        .exec()
                        .await?;

                    Ok(())
                })
                .await;
        }

        Ok(())
    }
}
