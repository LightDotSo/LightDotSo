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

use super::types::TokenGroup;
use crate::{
    error::RouteError, result::AppJsonResult, routes::token_group::error::TokenGroupError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::token_group;
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
#[utoipa::path(
        get,
        path = "/token/group/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Tokena group returned successfully", body = TokenGroup),
            (status = 404, description = "Tokena group not found", body = TokenGroupError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_group_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
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
    let token_group =
        state.client.token_group().find_unique(token_group::id::equals(query.id)).exec().await?;

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
