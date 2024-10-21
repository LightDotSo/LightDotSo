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

use super::{error::TokenError, types::Token};
use crate::{result::AppJsonResult, tags::TOKEN_TAG};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use itertools::Itertools;
use lightdotso_db::models::wallet_balance::{
    get_latest_wallet_balances_for_token_groups, get_wallet_balances, get_wallet_balances_count,
    WalletBalance,
};
use lightdotso_prisma::{token, token_group};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
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
    /// The flag to indicate to retrieve those by the token group.
    pub is_group_only: Option<bool>,
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
///
/// Returns a list of tokens with optional filtering.
#[utoipa::path(
        get,
        path = "/token/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Tokens returned successfully", body = [Token]),
            (status = 500, description = "Token bad request", body = TokenError),
        ),
        tag = TOKEN_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_token_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<Token>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list_query query.
    let Query(query) = list_query;

    let parsed_query_address: Address = query.address.parse()?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallet balances from the database.
    let wallet_balances = get_wallet_balances(
        &state.pool,
        &query.address,
        query.chain_ids.as_deref(),
        query.is_spam,
        query.is_testnet,
        query.is_group_only,
        "day",
        query.limit.unwrap_or(10) as i32,
        query.offset.unwrap_or(0) as i32,
    )
    .await?;
    info!("wallet_balances: {:?}", wallet_balances);

    // Convert the wallet balances to tokens.
    let wallet_balance_tokens =
        wallet_balances.clone().into_iter().map(|balance| balance.into()).collect::<Vec<Token>>();

    // If the group is only, then we need to get the tokens from the database that match the wallet
    // balances.
    let tokens_data = if query.group == Some(true) || query.group.is_none() {
        // Get the tokens from the database that match w/ token ids.
        state
            .client
            .token()
            .find_many(vec![token::id::in_vec(
                wallet_balances
                    .clone()
                    .iter()
                    .map(|balance| balance.token_id.clone())
                    .collect::<Vec<String>>(),
            )])
            .with(token::group::fetch().with(token_group::tokens::fetch(vec![])))
            .exec()
            .await?
    } else {
        // Get the tokens from the database that match w/ token ids.
        state
            .client
            .token()
            .find_many(vec![token::id::in_vec(
                wallet_balances
                    .clone()
                    .iter()
                    .map(|balance| balance.token_id.clone())
                    .collect::<Vec<String>>(),
            )])
            .exec()
            .await?
    };
    let tokens = tokens_data.into_iter().map(|token| token.into()).collect::<Vec<Token>>();
    info!("tokens: {:?}", tokens);

    // Get all the token group ids.
    let token_group_ids: Vec<String> = tokens
        .iter()
        .filter_map(|token| token.group.as_ref().map(|group| group.id.clone()))
        .collect::<HashSet<String>>()
        .into_iter()
        .collect();
    info!("token_group_ids: {:?}", token_group_ids);

    // Get all the latest wallet balances for the token groups.
    let token_group_wallet_balances: Vec<WalletBalance> =
        get_latest_wallet_balances_for_token_groups(
            &state.pool,
            token_group_ids,
            parsed_query_address,
        )
        .await?;

    // Convert the token group wallet balances to tokens.
    let token_group_wallet_balance_tokens = token_group_wallet_balances
        .clone()
        .into_iter()
        .map(|balance| balance.into())
        .collect::<Vec<Token>>();
    info!("token_group_wallet_balance_tokens: {:?}", token_group_wallet_balance_tokens);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Merge the tokens and the wallet balance tokens.
    let final_tokens = tokens
        .into_iter()
        .map(|mut token| {
            let wallet_balance_token = wallet_balance_tokens.iter().find(|t| t.id == token.id);
            if let Some(wallet_balance_token) = wallet_balance_token {
                token.amount = wallet_balance_token.clone().amount;
                token.balance_usd = wallet_balance_token.clone().balance_usd;
            }
            token
        })
        .collect::<Vec<Token>>();
    info!("final_tokens: {:?}", final_tokens);

    // Merge the tokens inside nested token groups.
    let final_group_nested_tokens = final_tokens
        .into_iter()
        .filter(|token| match query.group {
            Some(true) => token.group.is_some(),
            _ => true,
        })
        .map(|mut token| {
            if let Some(group) = token.group.as_mut() {
                // Reset the amount and balance_usd of the token.
                token.chain_id = 0;
                token.amount = 0_u128;
                token.balance_usd = 0.0;

                // Merge the nested tokens with the existing token_group_wallet_balance_tokens
                group.tokens = group
                    .clone()
                    .tokens
                    .into_iter()
                    .map(|mut nested_token| {
                        if let Some(wallet_balance_token) = token_group_wallet_balance_tokens
                            .iter()
                            .find(|t| t.id == nested_token.id)
                        {
                            // Update the nested token with wallet balance information
                            nested_token.amount = wallet_balance_token.amount;
                            nested_token.balance_usd = wallet_balance_token.balance_usd;
                            nested_token.is_spam = wallet_balance_token.is_spam;
                            nested_token.is_testnet = wallet_balance_token.is_testnet;

                            // Update the token with wallet balance information
                            token.amount += wallet_balance_token.amount;
                            token.balance_usd += wallet_balance_token.balance_usd;
                        }
                        nested_token
                    })
                    .collect();
            }
            token
        })
        .collect::<Vec<Token>>();
    info!("final_group_nested_tokens: {:?}", final_group_nested_tokens);

    // Deduplicate the tokens that have the same group id.
    let final_grouped_tokens = final_group_nested_tokens
        .into_iter()
        .chunk_by(|token| {
            token.group.as_ref().map(|group| group.id.clone()).unwrap_or_else(|| token.id.clone())
        })
        .into_iter()
        .flat_map(|(_, group)| group)
        .collect::<Vec<Token>>();
    info!("final_grouped_tokens: {:?}", final_grouped_tokens);

    Ok(Json(final_grouped_tokens))
}

/// Returns a count of list of tokens
///
/// Returns a count of list of tokens with optional filtering.
#[utoipa::path(
        get,
        path = "/token/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Tokens returned successfully", body = TokenListCount),
            (status = 500, description = "Token bad request", body = TokenError),
        ),
        tag = TOKEN_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_token_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<TokenListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the tokens from the database.
    let count = get_wallet_balances_count(
        &state.pool,
        &query.address,
        query.chain_ids.as_deref(),
        query.is_spam,
        query.is_testnet,
        query.is_group_only,
        "day",
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(TokenListCount { count }))
}
