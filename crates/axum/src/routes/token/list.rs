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

use super::{
    error::TokenError,
    types::{Token, TokenGroup},
};
use crate::{result::AppJsonResult, tags::TOKEN_TAG};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::Result;
use lightdotso_db::models::wallet_balance::{get_wallet_balances, get_wallet_balances_count};
use lightdotso_prisma::{
    token, token_group,
    wallet_balance::{self, Data, WhereParam},
};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
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

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    let wallet_balances = get_wallet_balances(
        &state.pool,
        &query.address,
        query.chain_ids.as_deref(),
        query.is_spam,
        query.is_testnet,
        "day",
        query.limit.unwrap_or(10) as i32,
        query.offset.unwrap_or(0) as i32,
    )
    .await?;
    info!("wallet_balances: {:?}", wallet_balances);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json(wallet_balances.into_iter().map(|balance| balance.into()).collect::<Vec<Token>>()))
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
        "day",
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(TokenListCount { count }))
}
