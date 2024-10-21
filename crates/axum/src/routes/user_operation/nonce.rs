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

use super::error::UserOperationError;
use crate::{result::AppJsonResult, tags::USER_OPERATION_TAG};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{user_operation, UserOperationStatus};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The chain id to get the user operation nonce for.
    pub chain_id: i64,
    /// The sender address to filter by.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Nonce
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationNonce {
    /// The hash of the transaction.
    pub nonce: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user operation nonce
///
/// Gets a user operation nonce by address.
#[utoipa::path(
        get,
        path = "/user_operation/nonce",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = " User operation nonce returned successfully", body = UserOperationNonce),
            (status = 404, description = " User operation nonce not found", body = UserOperationError),
        ),
        tag = USER_OPERATION_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_nonce_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<UserOperationNonce> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;
    let chain_id = query.chain_id;
    // Get the wallet address from the nonce query.
    let address: Address = query.address.parse()?;

    // Get the user operations from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_first(vec![
            user_operation::chain_id::equals(chain_id),
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

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the user operation is not found, return 0 as Ok.
    match user_operation {
        Some(user_operation) => {
            Ok(Json::from(UserOperationNonce { nonce: user_operation.nonce + 1 }))
        }
        None => Ok(Json::from(UserOperationNonce { nonce: 0 })),
    }
}
