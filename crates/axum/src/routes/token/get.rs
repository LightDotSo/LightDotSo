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
use crate::{
    error::RouteError, result::AppJsonResult, routes::token::error::TokenError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::token;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the token.
    pub address: String,
    /// The chain id of the token.
    pub chain_id: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_token_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Token> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the tokens from the database.
    let token = state
        .client
        .token()
        .find_unique(token::address_chain_id(checksum_address, query.chain_id))
        .with(token::group::fetch())
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token =
        token.ok_or(RouteError::TokenError(TokenError::NotFound("Token not found".to_string())))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token to the format that the API expects.
    let token: Token = token.into();

    Ok(Json::from(token))
}
