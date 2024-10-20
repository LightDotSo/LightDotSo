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

use super::{error::TokenGroupError, types::TokenGroup};
use crate::{error::RouteError, result::AppJsonResult, tags::TOKEN_GROUP_TAG};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::token_group;
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

/// Get a token group
///
/// Gets a token group by id.
#[utoipa::path(
        get,
        path = "/token/group/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Tokena group returned successfully", body = TokenGroup),
            (status = 404, description = "Tokena group not found", body = TokenGroupError),
        ),
        tag = TOKEN_GROUP_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_token_group_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<TokenGroup> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get tokengroup for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the token groups from the database.
    let token_group = state
        .client
        .token_group()
        .find_unique(token_group::id::equals(query.id))
        .with(token_group::tokens::fetch(vec![]))
        .exec()
        .await?;

    // If the tokengroup is not found, return a 404.
    let token_group = token_group.ok_or(RouteError::TokenGroupError(TokenGroupError::NotFound(
        "Token group not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token group to the format that the API expects.
    let token_group: TokenGroup = token_group.into();

    Ok(Json::from(token_group))
}
