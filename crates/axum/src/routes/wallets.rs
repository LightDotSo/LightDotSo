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

use crate::{api::ApiState, result::AppJsonResult};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use lightdotso_prisma::wallet;
use serde::Deserialize;

#[derive(Debug, Deserialize, Default)]
pub struct Pagination {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}

#[autometrics]
pub(crate) fn router() -> Router<ApiState> {
    Router::new().route("/check", get(handler))
}

/// Check if the server is running.
#[utoipa::path(
        get,
        path = "/wallet/list",
        responses(
            (status = 200, description = "Check returned successfully"),
        )
    )]
#[autometrics]
async fn handler(
    pagination: Option<Query<Pagination>>,
    State(client): State<ApiState>,
) -> AppJsonResult<Vec<wallet::Data>> {
    let Query(pagination) = pagination.unwrap_or_default();

    let users = client
        .client
        .wallet()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(i64::MAX))
        .exec()
        .await?;

    Ok(Json::from(users))
}
