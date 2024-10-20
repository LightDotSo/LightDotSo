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

use super::{error::ProtocolError, types::Protocol};
use crate::{result::AppJsonResult, tags::PROTOCOL_TAG};
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
    /// The offset of the first protocol to return.
    pub offset: Option<i64>,
    /// The maximum number of protocols to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// List protocols
///
/// Returns a list of protocols with optional filtering.
#[utoipa::path(
        get,
        path = "/protocol/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Protocols returned successfully", body = [Protocol]),
            (status = 500, description = "Protocol bad request", body = ProtocolError),
        ),
        tag = PROTOCOL_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_protocol_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<Protocol>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the protocols from the database.
    let protocols = state
        .client
        .protocol()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocols to the format that the API expects.
    let protocols: Vec<Protocol> = protocols.into_iter().map(Protocol::from).collect();

    Ok(Json::from(protocols))
}
