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

use super::{error::ProtocolGroupError, types::ProtocolGroup};
use crate::{error::RouteError, result::AppJsonResult, tags::PROTOCOL_GROUP_TAG};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::protocol_group;
use lightdotso_state::ClientState;
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
///
/// Gets a protocol group by id.
#[utoipa::path(
        get,
        path = "/protocol/group/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Protocol group returned successfully", body = ProtocolGroup),
            (status = 404, description = "Protocol group not found", body = ProtocolGroupError),
        ),
        tag = PROTOCOL_GROUP_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_protocol_group_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
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
