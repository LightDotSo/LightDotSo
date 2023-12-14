// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

#![allow(clippy::unwrap_used)]

use super::types::Token;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use eyre::Result;
use lightdotso_prisma::{wallet_balance, wallet_balance::WhereParam};
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
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
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of tokens.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct TokenListCount {
    /// The count of the list of tokens.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of tokens.
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
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Token>> {
    // Get the list_query query.
    let Query(list_query) = query;

    // Construct the query.
    let query = construct_token_list_query(&list_query)?;

    // Get the tokens from the database.
    let balances = client
        .client
        .wallet_balance()
        .find_many(query)
        .order_by(wallet_balance::balance_usd::order(Direction::Desc))
        .with(wallet_balance::token::fetch())
        .skip(list_query.offset.unwrap_or(0))
        .take(list_query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Get all of the tokens in the balances array.
    let tokens: Vec<Token> = balances.into_iter().map(|balance| balance.into()).collect();

    Ok(Json::from(tokens))
}

/// Returns a count of list of tokens.
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
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<TokenListCount> {
    // Get the list_query query.
    let Query(list_query) = query;

    // Construct the query.
    let query = construct_token_list_query(&list_query)?;

    // Get the tokens from the database.
    let count = client.client.wallet_balance().count(query).exec().await?;

    Ok(Json::from(TokenListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a params list for tokens.
fn construct_token_list_query(query: &ListQuery) -> Result<Vec<WhereParam>> {
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    let mut query_params = vec![
        wallet_balance::wallet_address::equals(checksum_address),
        wallet_balance::is_latest::equals(true),
        wallet_balance::chain_id::not(0),
        wallet_balance::is_spam::equals(query.is_spam.unwrap_or(false)),
        wallet_balance::amount::not(Some(0)),
    ];

    // If is_testnet is not set or true, only return the tokens that are not testnet tokens.
    if query.is_testnet != Some(true) {
        query_params.push(wallet_balance::is_testnet::equals(false));
    }

    Ok(query_params)
}
