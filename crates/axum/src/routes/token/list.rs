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

use super::types::Token;
use crate::{result::AppJsonResult, routes::token::types::TokenGroup, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use eyre::Result;
use lightdotso_prisma::{
    token, token_group,
    wallet_balance::{self, Data, WhereParam},
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first token to return.
    pub offset: Option<i64>,
    /// The maximum number of tokens to return.
    pub limit: Option<i64>,
    /// The address of the wallet.
    pub address: String,
    /// The flag to indicate if the token is a spam.
    pub is_spam: Option<bool>,
    /// The flag to indicate if the token is a testnet token.
    pub is_testnet: Option<bool>,
    /// The flag to group the tokens by the token group.
    pub group: Option<bool>,
    /// The optional chain ids of the tokens to query for.
    pub chain_ids: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of tokens.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenListCount {
    /// The count of the list of tokens.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of tokens
#[utoipa::path(
        get,
        path = "/token/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Tokens returned successfully", body = [Token]),
            (status = 500, description = "Token bad request", body = TokenError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Token>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list_query query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_token_list_query_params(&query)?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the tokens from the database.
    let balances = state
        .client
        .wallet_balance()
        .find_many(query_params)
        .order_by(wallet_balance::balance_usd::order(Direction::Desc))
        .with(wallet_balance::token::fetch().with(token::group::fetch()))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;
    info!(?balances);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If group or chain_id is set, return all of the tokens flat.
    if !query.group.unwrap_or(false) || query.chain_ids.is_some() {
        // Get all of the tokens in the balances array.
        let tokens: Vec<Token> =
            balances.clone().into_iter().map(|balance| balance.into()).collect();

        return Ok(Json::from(tokens));
    }

    // Deduplicate the balances that have the same token group id.
    let balances = balances
        .into_iter()
        .fold(vec![], |mut acc: Vec<Data>, balance: Data| {
            // If the balance has a token group, check if the group id is already in the
            // accumulator.
            if let Some(Some(token)) = &balance.token {
                if let Some(Some(group)) = &token.group {
                    // If the group id is not in the accumulator, push the balance into the
                    // accumulator.
                    if !acc.iter().any(|bal| {
                        if let Some(Some(tk)) = &bal.token {
                            if let Some(Some(tk_group)) = &tk.group {
                                tk_group.id == group.id
                            } else {
                                false
                            }
                        } else {
                            false
                        }
                    }) {
                        acc.push(balance);
                    }
                } else {
                    acc.push(balance);
                }
            } else {
                acc.push(balance);
            }

            acc
        })
        .into_iter()
        .collect::<Vec<_>>();

    // Convert all of the tokens in the balances array.
    let mut tokens: Vec<Token> =
        balances.clone().into_iter().map(|balance| balance.into()).collect();

    // If token group is in the balances, fetch the token group.
    // Thank you to @sudolabel for the help!
    let token_groups = balances
        .into_iter()
        .filter_map(|balance| balance.token.and_then(|token| token.and_then(|token| token.group)))
        .collect::<Vec<_>>();

    // For each token group, fetch the associated token and balances from the database.
    for group in token_groups.into_iter().flatten() {
        let token_group = state
            .client
            .token_group()
            .find_unique(token_group::id::equals(group.id))
            .with(
                token_group::tokens::fetch(vec![]).with(
                    token::balances::fetch(vec![wallet_balance::wallet_address::equals(
                        query.address.clone(),
                    )])
                    .with(wallet_balance::token::fetch())
                    .order_by(wallet_balance::timestamp::order(Direction::Desc))
                    .take(1),
                ),
            )
            .exec()
            .await?;
        info!(?token_group);

        // If the token group is found, assign the tokens in the token group to the pre-converted
        // token.
        if let Some(token_group) = token_group {
            // If the token group has tokens, assign the tokens to the pre-converted token.
            if let Some(token_group_tokens) = token_group.clone().tokens {
                // For each token in the token group, get the latest balance.
                for token in token_group_tokens {
                    // Get the wallet balance of the token in the token group
                    if let Some(wallet_balance) = token.balances {
                        // Get the latest balance.
                        if let Some(latest_balance) = wallet_balance.first() {
                            // Get the matched token w/ the same token group.
                            if let Some(matched_token) = tokens.iter_mut().find(|tk| {
                                if let Some(group) = &tk.group {
                                    group.id == token_group.id
                                } else {
                                    false
                                }
                            }) {
                                // Convert the latest balance into a token.
                                let covert_token: Token = latest_balance.clone().into();

                                // If the token has a group, push the token into the group.
                                if let Some(group) = &mut matched_token.group {
                                    group.tokens.push(covert_token);
                                } else {
                                    matched_token.group = Some(TokenGroup {
                                        id: token_group.clone().id,
                                        tokens: vec![covert_token],
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Deduplicate the tokens that have the same group id.
    tokens = tokens
        .into_iter()
        .fold(vec![], |mut acc: Vec<Token>, token: Token| {
            // If the token has a group, check if the group id is already in the accumulator.
            if let Some(token_group) = &token.group {
                // If the group id is not in the accumulator, push the token into the accumulator.
                if !acc.iter().any(|tk| {
                    if let Some(tk_group) = &tk.group {
                        tk_group.id == token_group.id
                    } else {
                        false
                    }
                }) {
                    acc.push(token);
                }
            } else {
                acc.push(token);
            }

            acc
        })
        .into_iter()
        .collect();
    info!(?tokens);

    // Filter out the tokens that has a amount of 0 in the token group.
    for token in &mut tokens {
        if let Some(group) = &mut token.group {
            group.tokens.retain(|tk| tk.amount > 0);
        }
    }

    // If there is a token group but only one token in the group, remove the token group.
    for token in &mut tokens {
        if let Some(group) = &token.group {
            if group.tokens.len() <= 1 {
                token.group = None;
            }
        }
    }

    // If a token group is found, modify the root token to be the culmative sum of the token group.
    for token in tokens.iter_mut() {
        if let Some(group) = &token.group {
            // Get the total balance of the token group.
            let total_balance = group.tokens.iter().fold(0.0, |acc, token| acc + token.balance_usd);
            // Get the total amount of the token group.
            let total_amount = group.tokens.iter().fold(0, |acc, token| acc + token.amount);

            // Modify the root token to be the culmative sum of the token group.
            token.balance_usd = total_balance;
            token.amount = total_amount;
        }
    }

    Ok(Json::from(tokens))
}

/// Returns a count of list of tokens
#[utoipa::path(
        get,
        path = "/token/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Tokens returned successfully", body = TokenListCount),
            (status = 500, description = "Token bad request", body = TokenError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<TokenListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_token_list_query_params(&query)?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the tokens from the database.
    let count = state.client.wallet_balance().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(TokenListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a params list for tokens.
fn construct_token_list_query_params(query: &ListQuery) -> Result<Vec<WhereParam>> {
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    let mut query_params = vec![
        wallet_balance::wallet_address::equals(checksum_address),
        wallet_balance::is_latest::equals(true),
        wallet_balance::is_spam::equals(query.is_spam.unwrap_or(false)),
        wallet_balance::amount::not(Some(0.to_string())),
    ];

    // If is_testnet is not set or true, only return the tokens that are not testnet tokens.
    match query.is_testnet {
        Some(false) | None => query_params.push(wallet_balance::is_testnet::equals(false)),
        _ => (),
    }

    // If chain_id is set, only return the tokens that have the same chain id.
    if let Some(chain_id) = &query.chain_ids {
        // Try to deseaialize the chain id (String to Vec<i64> separated by comma).
        let chain_ids: Vec<i64> = chain_id
            .split(',')
            .map(|chain_id| chain_id.parse::<i64>())
            .collect::<Result<Vec<_>, _>>()?;

        // Construct the chain id query params.
        let chain_query_params =
            chain_ids.into_iter().map(wallet_balance::chain_id::equals).collect::<Vec<_>>();

        // Push the constructed chain id query params into the query params.
        query_params.push(wallet_balance::WhereParam::Or(chain_query_params));
    } else {
        // If chain_id is not set, only return the tokens that are not portfoloio tokens.
        query_params.push(wallet_balance::chain_id::not(0));
    }

    Ok(query_params)
}
