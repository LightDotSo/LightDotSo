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

use super::types::Signature;
use crate::{
    error::RouteError, result::AppJsonResult, routes::signature::error::SignatureError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::signature;
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
    /// The owner of the signature.
    pub owner_id: String,
    /// The hash of the user operation.
    pub user_operation_hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a signature
#[utoipa::path(
        get,
        path = "/signature/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Signature returned successfully", body = Signature),
            (status = 404, description = "Signature not found", body = SignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_signature_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Signature> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get signature for address: {:?}", query);

    let owner_id = query.owner_id;
    let user_operation_hash = query.user_operation_hash;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let signature = state
        .client
        .signature()
        .find_unique(signature::owner_id_user_operation_hash(owner_id, user_operation_hash))
        .with(signature::owner::fetch())
        .exec()
        .await?;

    // If the signature is not found, return a 404.
    let signature = signature.ok_or(RouteError::SignatureError(SignatureError::NotFound(
        "Signature not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signature to the format that the API expects.
    let signature: Signature = signature.into();

    Ok(Json::from(signature))
}
