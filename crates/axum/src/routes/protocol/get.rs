// Copyright 2023-2024 Light.
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

use super::types::Protocol;
use crate::{
    error::RouteError, result::AppJsonResult, routes::protocol::error::ProtocolError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::protocol;
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
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a protocol
#[utoipa::path(
        get,
        path = "/protocol/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Protocol returned successfully", body = Protocol),
            (status = 404, description = "Protocol not found", body = ProtocolError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_protocol_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Protocol> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get protocol for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the protocols from the database.
    let protocol =
        state.client.protocol().find_unique(protocol::id::equals(query.id)).exec().await?;

    // If the protocol is not found, return a 404.
    let protocol = protocol.ok_or(RouteError::ProtocolError(ProtocolError::NotFound(
        "Protocol not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocol to the format that the API expects.
    let protocol: Protocol = protocol.into();

    Ok(Json::from(protocol))
}
