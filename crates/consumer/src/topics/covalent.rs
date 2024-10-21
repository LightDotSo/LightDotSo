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

use super::TopicConsumer;
use crate::state::ConsumerState;
use alloy::primitives::Address;
use async_trait::async_trait;
use eyre::{eyre, Result};
use lightdotso_covalent::get_token_balances;
use lightdotso_kafka::{
    topics::portfolio::produce_portfolio_message,
    types::{covalent::CovalentMessage, portfolio::PortfolioMessage},
};
use lightdotso_prisma::token;
use lightdotso_prisma_postgres::wallet_balance;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use lightdotso_utils::is_testnet;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct CovalentConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for CovalentConsumer {
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
            // Parse the payload into a JSON object, `CovalentMessage`
            let payload: CovalentMessage = serde_json::from_slice(payload.as_bytes())?;

            // Log the payload
            info!("payload: {:?}", payload);

            // Consume the payload
            self.consume_with_message(state, payload).await?;
        }

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl CovalentConsumer {
    pub async fn consume_with_message(
        &self,
        state: &ClientState,
        payload: CovalentMessage,
    ) -> Result<()> {
        // If the chain is 0, produce a portfolio message
        if payload.chain_id == 0 {
            produce_portfolio_message(
                state.producer.clone(),
                &PortfolioMessage { address: payload.address },
            )
            .await?;

            // Return early
            return Ok(());
        }

        // Log the payload
        let mut balances = get_token_balances(
            &payload.chain_id.to_string(),
            &payload.address.to_checksum(None),
            None,
            None,
        )
        .await?;

        // Replace the addresses of `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` with
        // `0x0000000000000000000000000000000000000000` This is because Covalent uses the
        // former for ETH, but we use the latter.
        for item in &mut balances.data.items {
            if item.contract_address ==
                Some("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee".to_string()) ||
                // Polygon uses `0x0000000000000000000000000000000000001010` for MATIC
                item.contract_address ==
                    Some("0x0000000000000000000000000000000000001010".to_string())
            {
                item.contract_address =
                    Some("0x0000000000000000000000000000000000000000".to_string());
            }
        }

        // Filter the balances to only include tokens with non-none contract addresses and
        // non-zero decimals
        balances.data.items = balances
            .data
            .items
            .into_iter()
            .filter(|item| item.contract_address.is_some() && item.contract_decimals.is_some())
            .collect::<Vec<_>>();
        info!("balances: {:?}", balances);

        // Create the tokens
        let res = state
            .client
            .token()
            .create_many(
                balances
                    .data
                    .items
                    .iter()
                    .map(|item| {
                        (
                            item.contract_address
                                .clone()
                                .unwrap()
                                .parse::<Address>()
                                .unwrap()
                                .to_checksum(None),
                            payload.chain_id as i64,
                            vec![
                                token::symbol::set(Some(
                                    item.contract_ticker_symbol.clone().unwrap_or("".to_string()),
                                )),
                                token::decimals::set(Some(item.contract_decimals.unwrap())),
                                token::name::set(item.contract_name.clone()),
                            ],
                        )
                    })
                    .collect::<Vec<_>>(),
            )
            .skip_duplicates()
            .exec()
            .await;
        info!("res: {:?}", res);

        // Find the tokens
        let tokens = state
            .client
            .token()
            .find_many(vec![token::chain_id::equals(payload.chain_id as i64)])
            .with(token::group::fetch())
            .exec()
            .await?;
        info!("tokens: {:?}", tokens);

        // Create token data for each token
        let token_data_results = balances
            .data
            .items
            .iter()
            .map(|ite| {
                // Find the item
                let token = tokens.iter().find(|token| {
                    token.address.clone().to_lowercase() ==
                        ite.contract_address.clone().unwrap().to_lowercase()
                });

                // Convert the Option to a Result
                let token_result = token.ok_or(eyre!("Item not found for token: {:?}", ite));

                // If valid item found, build data, else propagate error
                token_result.map(|token| {
                    (
                        ite.quote_rate.unwrap_or(ite.quote_rate_24h.unwrap_or(0.0)),
                        token.clone().id,
                        vec![],
                    )
                })
            })
            .collect::<Vec<_>>();

        // Flatten results and return early if there were any errors
        let token_data: Result<Vec<_>, _> = token_data_results.into_iter().collect();
        // If there was any error during creating token data, return early
        let token_data = token_data?;

        // Create a token price for each token
        state.postgres_client.token_price().create_many(token_data).exec().await?;

        let res: Result<i64> = state
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
                            wallet_balance::chain_id::equals(payload.chain_id as f64),
                        ],
                        vec![wallet_balance::is_latest::set(false)],
                    )
                    .exec()
                    .await?;

                let latest_balances = client
                    .wallet_balance()
                    .create_many(
                        balances
                            .data
                            .items
                            .iter()
                            .map(|item| {
                                // Find the token
                                let token = tokens
                                    .iter()
                                    .find(|token| {
                                        token.address.clone().to_lowercase() ==
                                            item.contract_address.clone().unwrap()
                                    })
                                    .unwrap();
                                info!("token: {:?}", token);

                                (
                                    item.quote.unwrap_or(0.0),
                                    payload.chain_id as f64,
                                    payload.address.to_checksum(None),
                                    vec![
                                        wallet_balance::amount::set(Some(
                                            item.balance
                                                .as_ref()
                                                .map(|balance| {
                                                    balance.parse::<f64>().unwrap_or(0.0)
                                                })
                                                .unwrap_or(0.0),
                                        )),
                                        wallet_balance::token_id::set(Some(token.id.to_string())),
                                        wallet_balance::token_group_id::set(
                                            token.group.as_ref().and_then(|optional_group| {
                                                optional_group
                                                    .as_ref()
                                                    .map(|group| group.id.to_string())
                                            }),
                                        ),
                                        wallet_balance::is_latest::set(true),
                                        wallet_balance::is_spam::set(item.is_spam),
                                        wallet_balance::is_testnet::set(is_testnet(
                                            payload.chain_id,
                                        )),
                                    ],
                                )
                            })
                            .collect::<Vec<_>>(),
                    )
                    .exec()
                    .await?;

                Ok(latest_balances)
            })
            .await;
        info!("res: {:?}", res?);

        Ok(())
    }
}
