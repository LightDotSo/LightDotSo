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
    // Get the get query.
    let Query(query) = get_query;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the tokens from the database.
    let token = state
        .client
        .token()
        .find_unique(token::address_chain_id(checksum_address, query.chain_id))
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token =
        token.ok_or(RouteError::TokenError(TokenError::NotFound("Token not found".to_string())))?;

    // Change the token to the format that the API expects.
    let token: Token = token.into();

    Ok(Json::from(token))
}
