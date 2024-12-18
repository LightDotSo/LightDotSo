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

#![allow(clippy::unwrap_used)]

use super::{error::WalletError, types::Wallet};
use crate::{
    authentication::authenticate_wallet_user, result::AppJsonResult, sessions::verify_session,
    tags::WALLET_TAG,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{wallet, ActivityEntity, ActivityOperation};
use lightdotso_state::ClientState;
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
///
/// Updates a wallet by address.
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
        ),
        tag = WALLET_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_wallet_update_handler(
    State(state): State<ClientState>,
    mut session: Session,
    put_query: Query<PutQuery>,
    Json(params): Json<WalletUpdateRequestParams>,
) -> AppJsonResult<Wallet> {
    // Verify the session
    verify_session(&session).await?;

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = put_query;

    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Check to see if the user is one of the owners of the wallet configurations.
    let auth_user_id =
        authenticate_wallet_user(&state, &mut session, &parsed_query_address, None, None).await?;

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
    let _ = produce_activity_message(
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
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}
