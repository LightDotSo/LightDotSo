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
    authentication::authenticate_wallet_user, result::AppJsonResult, sessions::verify_session,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{wallet, ActivityEntity, ActivityOperation};
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
pub struct WalletUpdateRequestParams {
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
        request_body = WalletUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet returned successfully", body = Wallet),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_update_handler(
    State(state): State<AppState>,
    mut session: Session,
    put_query: Query<PutQuery>,
    Json(params): Json<WalletUpdateRequestParams>,
) -> AppJsonResult<Wallet> {
    // Verify the session
    verify_session(&session)?;

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = put_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Check to see if the user is one of the owners of the wallet configurations.
    let auth_user_id =
        authenticate_wallet_user(&state, &mut session, &parsed_query_address).await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the params for the update.
    let name = params.name;
    info!(?name);
    let mut params = vec![];
    if name.is_some() {
        params.push(wallet::name::set(name.unwrap()));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Update the wallet name.
    let wallet = state
        .client
        .wallet()
        .update(wallet::address::equals(checksum_address), params)
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Wallet,
        &ActivityMessage {
            operation: ActivityOperation::Update,
            log: serde_json::to_value(&wallet)?,
            params: CustomParams {
                user_id: Some(auth_user_id),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}
