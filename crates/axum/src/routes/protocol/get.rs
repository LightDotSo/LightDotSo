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
