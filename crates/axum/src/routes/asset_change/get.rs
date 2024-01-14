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

use super::types::AssetChange;
use crate::{
    error::RouteError, result::AppJsonResult, routes::asset_change::error::AssetChangeError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::asset_change;
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

/// Get a asset
#[utoipa::path(
        get,
        path = "/asset_change/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Asset Change returned successfully", body = AssetChange),
            (status = 404, description = "Asset Change not found", body = AssetChangeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_asset_change_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<AssetChange> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get asset change for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the asset_changes from the database.
    let asset_change =
        state.client.asset_change().find_unique(asset_change::id::equals(query.id)).exec().await?;

    // If the asset_change is not found, return a 404.
    let asset_change = asset_change.ok_or(RouteError::AssetChangeError(
        AssetChangeError::NotFound("Asset_change not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the asset_change to the format that the API expects.
    let asset_change: AssetChange = asset_change.into();

    Ok(Json::from(asset_change))
}
