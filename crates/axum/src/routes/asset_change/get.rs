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

/// Get an asset change
///
/// Gets an asset change by id.
#[utoipa::path(
        get,
        path = "/asset_change/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Asset change returned successfully", body = AssetChange),
            (status = 404, description = "Asset change not found", body = AssetChangeError),
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
    let asset_change = state
        .client
        .asset_change()
        .find_unique(asset_change::id::equals(query.id))
        .with(asset_change::interpretation_action::fetch())
        .with(asset_change::token::fetch())
        .exec()
        .await?;

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
