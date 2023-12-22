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
    result::AppJsonResult, routes::user_operation::types::UserOperationSuccess, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
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
pub struct PostQuery {
    /// The sender address to filter by.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user operation
#[utoipa::path(
        post,
        path = "/user_operation/update",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "User Operation updated successfully", body = UserOperationSuccess),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_update_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<UserOperationSuccess> {
    // Get the get query.
    let Query(query) = post_query;
    // Get the wallet address from the nonce query.
    let address: H160 = query.address.parse()?;

    // Get the user operations from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_many(vec![
            user_operation::sender::equals(to_checksum(&address, None)),
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
                    user_operation::status::equals(UserOperationStatus::Proposed),
                ],
                vec![user_operation::status::set(UserOperationStatus::Invalid)],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(UserOperationSuccess::Updated("Success".to_string())))
}
