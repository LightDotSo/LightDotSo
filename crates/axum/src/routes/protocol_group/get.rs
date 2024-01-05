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

use super::types::ProtocolGroup;
use crate::{
    error::RouteError, result::AppJsonResult, routes::protocol_group::error::ProtocolGroupError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::protocol_group;
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

/// Get a protocol group
#[utoipa::path(
        get,
        path = "/protocol/group/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Protocola group returned successfully", body = ProtocolGroup),
            (status = 404, description = "Protocola group not found", body = ProtocolGroupError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_protocol_group_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ProtocolGroup> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get protocolgroup for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the protocol groups from the database.
    let protocol_group = state
        .client
        .protocol_group()
        .find_unique(protocol_group::id::equals(query.id))
        .exec()
        .await?;

    // If the protocolgroup is not found, return a 404.
    let protocol_group = protocol_group.ok_or(RouteError::ProtocolGroupError(
        ProtocolGroupError::NotFound("Protocol group not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocol group to the format that the API expects.
    let protocol_group: ProtocolGroup = protocol_group.into();

    Ok(Json::from(protocol_group))
}
