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
use super::{error::ConfigurationOperationOwnerError, types::ConfigurationOperationOwner};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_state::ClientState;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first owner to return.
    pub offset: Option<i64>,
    /// The maximum number of owners to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// List configuration operation owners
///
/// Returns a list of configuration operation owners with optional filtering.
#[utoipa::path(
        get,
        path = "/configuration_operation_owner/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configuration operation owners returned successfully", body = [ConfigurationOperationOwner]),
            (status = 500, description = "Configuration operation owners bad request", body = ConfigurationOperationOwnerError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_owner_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<ConfigurationOperationOwner>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration owners from the database.
    let configuration_operation_owners = state
        .client
        .configuration_operation_owner()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the owners to the format that the API expects.
    let configuration_operation_owners: Vec<ConfigurationOperationOwner> =
        configuration_operation_owners.into_iter().map(ConfigurationOperationOwner::from).collect();

    Ok(Json::from(configuration_operation_owners))
}
