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

use super::types::Wallet;
use crate::{
    constants::USER_ID_KEY, error::RouteError, result::AppJsonResult,
    routes::wallet::error::WalletError, sessions::verify_session, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{configuration, wallet};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The address of the wallet.
    pub address: String,
    /// The chain id of the wallet.
    pub chain_id: Option<i64>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletPutRequestParams {
    /// The name of the wallet.
    #[schema(example = "My Wallet", default = "My Wallet")]
    pub name: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a wallet
#[utoipa::path(
        put,
        path = "/wallet/update",
        params(
            PutQuery
        ),
        request_body = WalletPutRequestParams,
        responses(
            (status = 200, description = "Wallet returned successfully", body = Wallet),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_update_handler(
    State(client): State<AppState>,
    session: Session,
    put_query: Query<PutQuery>,
    Json(params): Json<WalletPutRequestParams>,
) -> AppJsonResult<Wallet> {
    // Verify the session
    verify_session(&session)?;

    // Get the get query.
    let Query(query) = put_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallets from the database.
    let wallet = client
        .client
        .wallet()
        .find_unique(wallet::address::equals(checksum_address.clone()))
        .with(wallet::configurations::fetch(vec![]).with(configuration::owners::fetch(vec![])))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet
        .clone()
        .ok_or(RouteError::WalletError(WalletError::NotFound("Wallet not found".to_string())))?;

    // Get the userid from the session.
    let user_id = session.get::<String>(&USER_ID_KEY).unwrap().unwrap().to_lowercase();
    info!(?user_id);

    // Check to see if the user is one of the owners of the wallet configurations.
    let _ = wallet
        .configurations
        .unwrap()
        .iter()
        .find(|configuration| {
            configuration
                .owners
                .as_ref()
                .unwrap()
                .iter()
                .any(|owner| owner.clone().user_id.as_ref().unwrap() == &user_id)
        })
        .ok_or(RouteError::WalletError(WalletError::BadRequest(
            "User is not an owner of the wallet".to_string(),
        )))?;

    // Construct the params for the update.
    let name = params.name;
    info!(?name);
    let mut params = vec![];
    if name.is_some() {
        params.push(wallet::name::set(name.unwrap()));
    }

    // Update the wallet name.
    let wallet = client
        .client
        .wallet()
        .update(wallet::address::equals(checksum_address), params)
        .exec()
        .await?;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}
