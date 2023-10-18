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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use lightdotso_prisma::user_operation;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub user_operation_hash: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first user operation to return.
    pub offset: Option<i64>,
    // The maximum number of user operations to return.
    pub limit: Option<i64>,
}

/// User operation operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum UserOperationError {
    // User operation query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// User operation not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperation {
    hash: String,
    #[schema(value_type = String)]
    chain_id: i64,
    sender: String,
}

// Implement From<user_operation::Data> for User operation.
impl From<user_operation::Data> for UserOperation {
    fn from(user_operation: user_operation::Data) -> Self {
        Self {
            hash: user_operation.hash,
            chain_id: user_operation.chain_id,
            sender: user_operation.sender,
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/user_operation/get", get(v1_user_operation_get_handler))
        .route("/user_operation/list", get(v1_user_operation_list_handler))
}

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
async fn v1_user_operation_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperation> {
    // Get the get query.
    let Query(query) = get;

    // Get the user operations from the database.
    let user_operation = client
        .client
        .unwrap()
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(AppError::NotFound)?;

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

/// Returns a list of user operations.
#[utoipa::path(
        get,
        path = "/user_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User Operations returned successfully", body = [UserOperation]),
            (status = 500, description = "User Operation bad request", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_list_handler(
    pagination: Option<Query<ListQuery>>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<UserOperation>> {
    // Get the pagination query.
    let Query(pagination) = pagination.unwrap_or_default();

    // Get the user operations from the database.
    let user_operations = client
        .client
        .unwrap()
        .user_operation()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the user operations to the format that the API expects.
    let user_operations: Vec<UserOperation> =
        user_operations.into_iter().map(UserOperation::from).collect();

    Ok(Json::from(user_operations))
}
