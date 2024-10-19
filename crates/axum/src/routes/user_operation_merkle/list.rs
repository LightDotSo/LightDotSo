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

use super::{error::UserOperationMerkleError, types::UserOperationMerkle};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::user_operation_merkle;
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
    /// The offset of the first protocol group to return.
    pub offset: Option<i64>,
    /// The maximum number of protocol groups to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of user operation merkle trees
///
/// Returns a list of user operation merkle trees with optional filtering.
#[utoipa::path(
        get,
        path = "/user_operation_merkle/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Protocol groups returned successfully", body = [UserOperationMerkle]),
            (status = 500, description = "Protocol group bad request", body = UserOperationMerkleError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_merkle_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<UserOperationMerkle>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the protocol groups from the database.
    let user_operation_merkles = state
        .client
        .user_operation_merkle()
        .find_many(vec![])
        .with(user_operation_merkle::user_operation_merkle_proofs::fetch(vec![]))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocol groups to the format that the API expects.
    let user_operation_merkles: Vec<UserOperationMerkle> =
        user_operation_merkles.into_iter().map(UserOperationMerkle::from).collect();

    Ok(Json::from(user_operation_merkles))
}
