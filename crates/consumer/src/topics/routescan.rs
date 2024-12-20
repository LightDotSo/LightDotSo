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
use lightdotso_kafka::types::routescan::RoutescanMessage;
use lightdotso_prisma::token;
use lightdotso_prisma_postgres::wallet_balance;
use lightdotso_routescan::{get_native_balance, get_token_balances, types::WalletBalanceItem};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use lightdotso_utils::is_testnet;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct RoutescanConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for RoutescanConsumer {
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
            // Parse the payload into a JSON object, `RoutescanMessage`
            let payload: RoutescanMessage = serde_json::from_slice(payload.as_bytes())?;

            // Consume the payload
            self.consume_with_message(state, payload).await?;
        }

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl RoutescanConsumer {
    pub async fn consume_with_message(
        &self,
        state: &ClientState,
        payload: RoutescanMessage,
    ) -> Result<()> {
        // Log the payload
        let balances =
            get_token_balances(&payload.chain_id, &payload.address.to_checksum(None), None, None)
                .await?;
        info!(?balances);

        // Get the native balance
        let native_balance =
            get_native_balance(&payload.chain_id, &payload.address.to_checksum(None)).await?;
        info!(?native_balance);

        // Get the items from the token balances
        let mut items = balances.items.clone();

        // If the native balance is not zero, add it to the items
        if !native_balance.result != 0 {
            items.push(WalletBalanceItem {
                chain_id: Some(payload.chain_id.to_string()),
                token_address: Some("0x0000000000000000000000000000000000000000".to_string()),
                token_name: None,
                token_symbol: None,
                // Hardcoded to 18 decimals for native balance
                token_decimals: Some(18),
                token_quantity: Some(native_balance.result.to_string()),
                token_price: None,
                token_value_in_usd: None,
                updated_at_block: None,
            });
        }

        // Filter the balances to only include tokens with non-none contract addresses and
        // non-zero decimals
        let new_items = items
            .into_iter()
            .filter(|item| {
                item.token_quantity.is_some() &&
                    item.token_decimals.is_some() &&
                    item.token_address.is_some()
            })
            .collect::<Vec<_>>();
        info!(?new_items);

        // Create the tokens
        let res = state
            .client
            .token()
            .create_many(
                new_items
                    .iter()
                    .map(|item| {
                        (
                            (item.token_address.clone().unwrap().parse::<Address>().unwrap())
                                .to_checksum(None),
                            payload.chain_id as i64,
                            vec![
                                token::symbol::set(Some(
                                    item.token_symbol.clone().unwrap_or("".to_string()),
                                )),
                                token::decimals::set(Some(item.token_decimals.unwrap())),
                                token::name::set(item.token_name.clone()),
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

        // Check that all `tokens` are in `new_items`
        for token in tokens.clone() {
            // Find the item
            let item = new_items
                .iter()
                .find(|item| item.token_address.as_ref().unwrap() == &token.address);
            // If the item is not found, return an error
            if item.is_none() {
                return Err(eyre!("Item not found for token: {:?}", token));
            }
        }

        // Create token data for each token
        let token_data_results = new_items
            .iter()
            .map(|ite| {
                // Find the item
                let token = tokens.iter().find(|token| {
                    token.address.clone().to_lowercase() ==
                        ite.token_address.clone().unwrap().to_lowercase()
                });

                // Convert the Option to a Result
                let token_result = token.ok_or(eyre!("Item not found for token: {:?}", ite));

                // If valid item found, build data, else propagate error
                // Temporary fix for quote rate
                token_result.map(|token| (0.0, token.clone().id, vec![]))
                // token_result.map(|token| (ite.quote_rate.unwrap_or(0.0), token.clone().id,
                // vec![]))
            })
            .collect::<Vec<_>>();

        // Flatten results and return early if there were any errors
        let token_data: Result<Vec<_>, _> = token_data_results.into_iter().collect();

        // If there was any error during creating token data, return early
        let token_data = token_data?;

        // Create a token price for each token
        state.postgres_client.token_price().create_many(token_data).exec().await?;

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
                            wallet_balance::chain_id::equals(payload.chain_id as f64),
                        ],
                        vec![wallet_balance::is_latest::set(false)],
                    )
                    .exec()
                    .await?;

                client
                    .wallet_balance()
                    .create_many(
                        new_items
                            .iter()
                            .map(|item| {
                                // Find the token
                                let token = tokens
                                    .iter()
                                    .find(|token| {
                                        token.address.clone() == item.token_address.clone().unwrap()
                                    })
                                    .unwrap();

                                (
                                    // Temporary fix for quote rate
                                    // item.quote.unwrap_or(0.0),
                                    0.0_f64,
                                    payload.chain_id as f64,
                                    payload.address.to_checksum(None),
                                    vec![
                                        wallet_balance::amount::set(Some(
                                            item.token_quantity
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
                                        // wallet_balance::is_spam::set(item.is_spam),
                                        wallet_balance::is_latest::set(true),
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

                Ok(())
            })
            .await;

        Ok(())
    }
}
