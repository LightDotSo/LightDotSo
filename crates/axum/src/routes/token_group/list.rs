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
use super::{error::TokenGroupError, types::TokenGroup};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::token_group;
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
    /// The offset of the first token group to return.
    pub offset: Option<i64>,
    /// The maximum number of token groups to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of token groups
///
/// Returns a list of token groups with optional filtering.
#[utoipa::path(
        get,
        path = "/token/group/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Token groups returned successfully", body = [TokenGroup]),
            (status = 500, description = "Token group bad request", body = TokenGroupError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_group_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<TokenGroup>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the token groups from the database.
    let token_groups = state
        .client
        .token_group()
        .find_many(vec![])
        .with(token_group::tokens::fetch(vec![]))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token groups to the format that the API expects.
    let token_groups: Vec<TokenGroup> = token_groups.into_iter().map(TokenGroup::from).collect();

    Ok(Json::from(token_groups))
}
