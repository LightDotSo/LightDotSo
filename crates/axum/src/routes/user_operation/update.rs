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

use super::{error::UserOperationError, types::UserOperationSuccess};
use crate::{result::AppJsonResult, state::AppState};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{user_operation, UserOperationStatus};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The sender address to filter by.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a user operation
///
/// Updates a user operation by address.
#[utoipa::path(
        put,
        path = "/user_operation/update",
        params(
            PutQuery
        ),
        responses(
            (status = 200, description = "User operation updated successfully", body = UserOperationSuccess),
            (status = 404, description = "User operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<UserOperationSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = put_query;
    // Get the wallet address from the nonce query.
    let address: Address = query.address.parse()?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operations from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_many(vec![
            user_operation::sender::equals(address.to_checksum(None)),
            or![
                user_operation::status::equals(UserOperationStatus::Executed),
                user_operation::status::equals(UserOperationStatus::Reverted)
            ],
        ])
        .order_by(user_operation::nonce::order(Direction::Desc))
        .exec()
        .await?;
    info!(?user_operation);

    // Filter the user operations by same chainId
    let mut unique_chain_ids = std::collections::HashSet::new();
    let unique_user_operations: Vec<_> =
        user_operation.into_iter().filter(|op| unique_chain_ids.insert(op.chain_id)).collect();

    // For each user operation w/ update many the matching chainId where nonce is equal to or lower
    // than change the status to Invalid.
    for op in unique_user_operations {
        let _ = state
            .client
            .user_operation()
            .update_many(
                vec![
                    user_operation::chain_id::equals(op.chain_id),
                    user_operation::nonce::lte(op.nonce),
                    user_operation::hash::not(op.hash),
                    or![
                        user_operation::status::equals(UserOperationStatus::Proposed),
                        user_operation::status::equals(UserOperationStatus::Pending)
                    ],
                ],
                vec![user_operation::status::set(UserOperationStatus::Invalid)],
            )
            .exec()
            .await?;
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(UserOperationSuccess::Updated("Success".to_string())))
}
