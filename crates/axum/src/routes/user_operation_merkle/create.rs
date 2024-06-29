// Copyright 2023-2024 Light.
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

use super::types::UserOperationMerkle;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::user_operation_merkle;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The root of the merkle root to post for.
    user_operation_merkle_root: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a user operation merkle
#[utoipa::path(
        post,
        path = "/user_operation_merkle/create",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "User operation merkle created successfully", body = UserOperationMerkle),
            (status = 500, description = "User operation merkle internal error", body = UserOperationMerkleError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_merkle_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<UserOperationMerkle> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the merkle root.
    let user_operation_merkle_root = query.user_operation_merkle_root;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the user operation merkle.
    let user_operation_merkle = state
        .client
        .user_operation_merkle()
        .upsert(
            user_operation_merkle::root::equals(user_operation_merkle_root.clone()),
            user_operation_merkle::create(user_operation_merkle_root.clone(), vec![]),
            vec![],
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocol group to the format that the API expects.
    let user_operation_merkle: UserOperationMerkle = user_operation_merkle.into();

    Ok(Json::from(user_operation_merkle))
}
