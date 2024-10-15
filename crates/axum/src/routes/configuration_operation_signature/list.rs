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

#[allow(unused_imports)]
use super::{error::ConfigurationOperationSignatureError, types::ConfigurationOperationSignature};
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration_operation_signature;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first signature to return.
    pub offset: Option<i64>,
    /// The maximum number of signatures to return.
    pub limit: Option<i64>,
    /// The configuration operation id to filter by.
    pub configuration_operation_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// List configuration operation signatures
///
/// Returns a list of configuration operation signatures with optional filtering.
#[utoipa::path(
        get,
        path = "/configuration_operation_signature/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configuration Signatures returned successfully", body = [ConfigurationOperationSignature]),
            (status = 500, description = "Configuration Signature bad request", body = ConfigurationOperationSignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_signature_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<ConfigurationOperationSignature>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query parameters.
    let query_params = match query.configuration_operation_id {
        Some(configuration_operation_id) => {
            vec![configuration_operation_signature::configuration_operation_id::equals(
                configuration_operation_id,
            )]
        }
        None => vec![],
    };

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let configuration_operation_signatures = state
        .client
        .configuration_operation_signature()
        .find_many(query_params)
        .order_by(configuration_operation_signature::created_at::order(Direction::Desc))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the configuration_operation_signatures to the format that the API expects.
    let configuration_operation_signatures: Vec<ConfigurationOperationSignature> =
        configuration_operation_signatures
            .into_iter()
            .map(ConfigurationOperationSignature::from)
            .collect();

    Ok(Json::from(configuration_operation_signatures))
}
