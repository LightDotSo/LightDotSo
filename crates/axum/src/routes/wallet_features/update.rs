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

use super::types::{WalletFeatures, WalletFeaturesOptional};
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::wallet_features::error::WalletFeaturesError, sessions::get_user_id, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{wallet, wallet_features};
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
pub struct PostQuery {
    /// The hash of the wallet features.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletFeaturesUpdateRequestParams {
    /// The result of the wallet_features.
    pub wallet_features: WalletFeaturesOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a wallet_features
#[utoipa::path(
        post,
        path = "/wallet/features/update",
        params(
            PostQuery
        ),
        request_body = WalletFeaturesUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet Features updated successfully", body = WalletFeatures),
            (status = 400, description = "Invalid Configuration", body = WalletFeaturesError),
            (status = 401, description = "Unauthorized", body = WalletFeaturesError),
            (status = 500, description = "Wallet Features internal error", body = WalletFeaturesError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_features_update_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<WalletFeaturesUpdateRequestParams>,
) -> AppJsonResult<WalletFeatures> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    // If the authenticated user id is not `KAKI_USER_ID`, return an error.
    if auth_user_id != KAKI_USER_ID.to_string() {
        return Err(RouteError::WalletFeaturesError(WalletFeaturesError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(post) = post_query;

    // Parse the address from the post query.
    let parsed_query_address: H160 = post.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallet_features from the post body.
    let wallet_features = params.wallet_features;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // For each wallet_features, create the params update.
    let mut params = vec![];

    info!("Update wallet_features for address: {:?}", checksum_address);

    if wallet_features.is_enabled_ai.is_some() {
        let is_enabled_ai = wallet_features.is_enabled_ai.unwrap();
        params.push(wallet_features::is_enabled_ai::set(is_enabled_ai));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the wallet_features the database.
    let wallet_features = state
        .client
        .wallet_features()
        .upsert(
            wallet_features::wallet_address::equals(checksum_address.clone()),
            wallet_features::create(
                wallet::address::equals(checksum_address.clone()),
                params.clone(),
            ),
            params.clone(),
        )
        .exec()
        .await?;
    info!(?wallet_features);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let wallet_features: WalletFeatures = wallet_features.into();

    Ok(Json::from(wallet_features))
}
