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

use super::types::UserOperationMerkleProof;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first User operation merkle proof to return.
    pub offset: Option<i64>,
    /// The maximum number of User operation merkle proofs to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of user operation merkle proofs
#[utoipa::path(
        get,
        path = "/user_operation_merkle_proof/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User operation merkle proofs returned successfully", body = [UserOperationMerkleProof]),
            (status = 500, description = "User operation merkle proofs bad request", body = UserOperationMerkleProofError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_merkle_proof_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<UserOperationMerkleProof>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the User operation merkle proofs from the database.
    let user_operation_merkle_proofs = state
        .client
        .user_operation_merkle_proof()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the User operation merkle proofs to the format that the API expects.
    let user_operation_merkle_proofs: Vec<UserOperationMerkleProof> =
        user_operation_merkle_proofs.into_iter().map(UserOperationMerkleProof::from).collect();

    Ok(Json::from(user_operation_merkle_proofs))
}
