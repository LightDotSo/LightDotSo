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
use crate::{error::RouteError, result::AppJsonResult, tags::TOKEN_TAG};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::wallet_balance::get_latest_wallet_balance_for_token;
use lightdotso_prisma::token;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::bigdecimal::{num_bigint::ToBigInt, ToPrimitive};
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
    /// The wallet that the token holds.
    pub wallet: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a token
///
/// Gets a token by address and chain id.
#[utoipa::path(
        get,
        path = "/token/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Token returned successfully", body = Token),
            (status = 404, description = "Token not found", body = TokenError),
        ),
        tag = TOKEN_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_token_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Token> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

    let parsed_wallet_address: Option<String> = match query.wallet {
        Some(wallet) => Some(wallet.parse::<Address>()?.to_checksum(None)),
        None => None,
    };

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

    // If the wallet is provided, get the balance of the token.
    if let Some(wallet_address) = parsed_wallet_address {
        let balance = get_latest_wallet_balance_for_token(
            &state.pool,
            token.id.clone(),
            wallet_address.parse()?,
        )
        .await?;
        info!("Balance: {:?}", balance);

        // If the balance is found, update the token with the balance.
        if let Some(balance) = balance {
            // First, convert the token to a WalletBalance.
            let mut token: Token = token.into();

            // Then, fill in the missing fields.
            token.amount =
                balance.amount.to_bigint().unwrap_or_default().to_u128().unwrap_or_default();
            token.balance_usd = balance.balance_usd.to_f64().unwrap_or(0.0);
            token.is_spam = balance.is_spam;
            token.is_testnet = balance.is_testnet;

            // Return the token.
            return Ok(Json::from(token));
        }
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token to the format that the API expects.
    let token: Token = token.into();

    Ok(Json::from(token))
}
