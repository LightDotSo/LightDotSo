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

use super::types::UserOperation;
use crate::{
    error::RouteError, result::AppJsonResult, routes::user_operation::error::UserOperationError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{signature, user_operation};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The user operation hash to get.
    pub user_operation_hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user operation
#[utoipa::path(
        get,
        path = "/user_operation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User Operation returned successfully", body = UserOperation),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperation> {
    // Get the get query.
    let Query(query) = get;
    let user_operation_hash = query.user_operation_hash.clone();

    // Get the user operations from the database.
    let user_operation = client
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .with(user_operation::signatures::fetch(vec![signature::user_operation_hash::equals(
            user_operation_hash,
        )]))
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(RouteError::UserOperationError(
        UserOperationError::NotFound("User operation not found".to_string()),
    ))?;

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}
