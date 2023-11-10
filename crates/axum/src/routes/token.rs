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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{token, wallet_balance};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the token.
    pub address: String,
    /// The chain id of the token.
    pub chain_id: i64,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first token to return.
    pub offset: Option<i64>,
    // The maximum number of tokens to return.
    pub limit: Option<i64>,
    // The address of the wallet.
    pub address: String,
}

/// Token operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum TokenError {
    // Token query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Token not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Token {
    address: String,
    name: Option<String>,
    symbol: String,
    decimals: i32,
}

// Implement From<token::Data> for Token.
impl From<token::Data> for Token {
    fn from(token: token::Data) -> Self {
        Self {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/token/get", get(v1_token_get_handler))
        .route("/token/list", get(v1_token_list_handler))
}

/// Get a token
#[utoipa::path(
        get,
        path = "/token/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Token returned successfully", body = Token),
            (status = 404, description = "Token not found", body = TokenError),
        )
    )]
#[autometrics]
async fn v1_token_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Token> {
    // Get the get query.
    let Query(query) = get;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the tokens from the database.
    let token = client
        .client
        .unwrap()
        .token()
        .find_unique(token::address_chain_id(checksum_address, query.chain_id))
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token = token.ok_or(AppError::NotFound)?;

    // Change the token to the format that the API expects.
    let token: Token = token.into();

    Ok(Json::from(token))
}

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
async fn v1_token_list_handler(
    list: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Token>> {
    let parsed_query_address: H160 = list.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the tokens from the database.
    let balances = client
        .client
        .unwrap()
        .wallet_balance()
        .find_many(vec![
            wallet_balance::wallet_address::equals(checksum_address),
            wallet_balance::is_latest::equals(true),
            wallet_balance::chain_id::not(0),
        ])
        .with(wallet_balance::token::fetch())
        .exec()
        .await?;

    // Get all of the tokens in the balances array.
    let tokens: Vec<Token> = balances
        .into_iter()
        .map(|balance| {
            let token = *balance.token.unwrap().unwrap();
            token.into()
        })
        .collect();

    Ok(Json::from(tokens))
}
