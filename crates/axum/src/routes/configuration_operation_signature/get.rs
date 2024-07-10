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

use super::types::ConfigurationOperationSignature;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::configuration_operation_signature::error::ConfigurationOperationSignatureError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration_operation_signature;
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
    /// The configuration operation id of the signature.
    pub configuration_operation_id: String,
    /// The configuration owner of the signature.
    pub owner_id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a signature
#[utoipa::path(
        get,
        path = "/configuration_operation_signature/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Configuration operation signature returned successfully", body = ConfigurationOperationSignature),
            (status = 404, description = "Configuration operation signature not found", body = ConfigurationOperationSignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_signature_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ConfigurationOperationSignature> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get signature for address: {:?}", query);

    let operation_id = query.configuration_operation_id;
    let owner_id = query.owner_id;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let configuration_operation_signature = state
        .client
        .configuration_operation_signature()
        .find_unique(configuration_operation_signature::configuration_operation_id_owner_id(
            operation_id,
            owner_id,
        ))
        .with(configuration_operation_signature::owner::fetch())
        .exec()
        .await?;

    // If the signature is not found, return a 404.
    let configuration_operation_signature = configuration_operation_signature.ok_or(
        RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound(
                "Configuration Signature not found".to_string(),
            ),
        ),
    )?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signature to the format that the API expects.
    let configuration_operation_signature: ConfigurationOperationSignature =
        configuration_operation_signature.into();

    Ok(Json::from(configuration_operation_signature))
}
