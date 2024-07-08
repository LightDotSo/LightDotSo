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
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::user_operation_merkle_proof::error::UserOperationMerkleProofError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::user_operation_merkle_proof;
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

/// Get a user operation merkle proof
#[utoipa::path(
        get,
        path = "/user_operation_merkle_proof/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User operation merkle proof returned successfully", body = UserOperationMerkleProof),
            (status = 404, description = "User operation merkle proof not found", body = UserOperationMerkleProofError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_merkle_proof_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<UserOperationMerkleProof> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get UserOperationMerkleProof for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operation merkle proofs from the database.
    let user_operation_merkle_proof = state
        .client
        .user_operation_merkle_proof()
        .find_unique(user_operation_merkle_proof::id::equals(query.id))
        .exec()
        .await?;

    // If the UserOperationMerkleProof is not found, return a 404.
    let user_operation_merkle_proof = user_operation_merkle_proof.ok_or(
        RouteError::UserOperationMerkleProofError(UserOperationMerkleProofError::NotFound(
            "User operation merkle proof not found".to_string(),
        )),
    )?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the user operation merkle proof to the format that the API expects.
    let user_operation_merkle_proof: UserOperationMerkleProof = user_operation_merkle_proof.into();

    Ok(Json::from(user_operation_merkle_proof))
}
