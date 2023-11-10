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
use lightdotso_prisma::{token, token_price};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the token_price.
    pub address: String,
    /// The chain id of the token_price.
    pub chain_id: i64,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first token_price to return.
    pub offset: Option<i64>,
    // The maximum number of tokens to return.
    pub limit: Option<i64>,
    // The address of the wallet.
    pub address: String,
    /// The chain id of the token_price.
    pub chain_id: i64,
}

/// TokenPrice operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum TokenPriceError {
    // TokenPrice query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// TokenPrice not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct TokenPrice {
    price: f64,
}

// Implement From<token_price::Data> for Token.
impl From<token_price::Data> for TokenPrice {
    fn from(token_price: token_price::Data) -> Self {
        Self { price: token_price.price }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/token_price/get", get(v1_token_price_get_handler))
        .route("/token_price/list", get(v1_token_price_list_handler))
}

/// Get a token_price
#[utoipa::path(
        get,
        path = "/token_price/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Token returned successfully", body = Vec<TokenPrice>),
            (status = 404, description = "Token not found", body = TokenError),
        )
    )]
#[autometrics]
async fn v1_token_price_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<TokenPrice>> {
    // Get the get query.
    let Query(query) = get;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the tokens from the database.
    let token = client
        .clone()
        .client
        .unwrap()
        .token()
        .find_unique(token::address_chain_id(checksum_address, query.chain_id))
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token = token.ok_or(AppError::NotFound)?;

    // Get the token_price from the database.
    let token_price = client
        .client
        .unwrap()
        .token_price()
        .find_many(vec![token_price::token_id::equals(token.id)])
        .exec()
        .await?;

    // Map the token_price to a TokenPrice.
    let token_price: Vec<TokenPrice> = token_price.into_iter().map(TokenPrice::from).collect();

    Ok(Json::from(token_price))
}

/// Returns a list of tokens.
#[utoipa::path(
        get,
        path = "/token_price/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Tokens returned successfully", body = [Token]),
            (status = 500, description = "Token bad request", body = TokenError),
        )
    )]
#[autometrics]
async fn v1_token_price_list_handler(
    list: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<TokenPrice>> {
    // Get the pagination query.
    let Query(pagination) = list;

    let parsed_query_address: H160 = pagination.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the tokens from the database.
    let token = client
        .clone()
        .client
        .unwrap()
        .token()
        .find_unique(token::address_chain_id(checksum_address, pagination.chain_id))
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token = token.ok_or(AppError::NotFound)?;

    // Get the token_price from the database.
    let token_price = client
        .client
        .unwrap()
        .token_price()
        .find_many(vec![token_price::token_id::equals(token.id)])
        .exec()
        .await?;

    // Map the token_price to a TokenPrice.
    let token_price: Vec<TokenPrice> = token_price.into_iter().map(TokenPrice::from).collect();

    Ok(Json::from(token_price))
}
