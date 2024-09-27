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

use super::types::UserOperationMerkle;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::user_operation_merkle::error::UserOperationMerkleError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    asset_change, billing_operation, interpretation, paymaster_operation, signature, token_price,
    user_operation, user_operation_merkle,
};
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
    pub root: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user operation merkle tree
///
/// Gets a user operation merkle tree by root.
#[utoipa::path(
        get,
        path = "/user_operation_merkle/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User operation merkle returned successfully", body = UserOperationMerkle),
            (status = 404, description = "User operation merkle not found", body = UserOperationMerkleError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_merkle_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<UserOperationMerkle> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get UserOperationMerkle for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the protocol groups from the database.
    let user_operation_merkle = state
        .client
        .user_operation_merkle()
        .find_unique(user_operation_merkle::root::equals(query.root.clone()))
        .with(
            user_operation_merkle::user_operations::fetch(vec![])
                .with(user_operation::paymaster::fetch())
                .with(user_operation::paymaster_operation::fetch().with(
                    paymaster_operation::billing_operation::fetch().with(
                        billing_operation::token_price::fetch().with(token_price::token::fetch()),
                    ),
                ))
                .with(user_operation::transaction::fetch())
                .with(user_operation::signatures::fetch(vec![
                    signature::user_operation_hash::equals(query.root),
                ]))
                .with(
                    user_operation::interpretation::fetch()
                        .with(interpretation::actions::fetch(vec![]))
                        .with(
                            interpretation::asset_changes::fetch(vec![])
                                .with(asset_change::interpretation_action::fetch())
                                .with(asset_change::token::fetch()),
                        ),
                ),
        )
        .with(user_operation_merkle::user_operation_merkle_proofs::fetch(vec![]))
        .exec()
        .await?;

    // If the UserOperationMerkle is not found, return a 404.
    let user_operation_merkle =
        user_operation_merkle.ok_or(RouteError::UserOperationMerkleError(
            UserOperationMerkleError::NotFound("Protocol group not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the protocol group to the format that the API expects.
    let user_operation_merkle: UserOperationMerkle = user_operation_merkle.into();

    Ok(Json::from(user_operation_merkle))
}
