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

use crate::{error::RouteError, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::types::H256;
use lightdotso_kafka::{
    topics::user_operation::produce_user_operation_message,
    types::user_operation::UserOperationMessage,
};
use lightdotso_prisma::user_operation;
use lightdotso_redis::query::user_operation::user_operation_rate_limit;
use serde::Deserialize;
use utoipa::IntoParams;

use super::{error::QueueError, types::QueueSuccess};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The user operation hash of the target queue.
    pub hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue user operation handler
#[utoipa::path(
        post,
        path = "/queue/user_operation",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = QueueSuccess),
            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_user_operation_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<QueueSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    let parsed_query_hash: H256 = query.hash.parse()?;
    let full_op_hash = format!("{:?}", parsed_query_hash);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operation from the database.
    let uop = state
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(full_op_hash.clone()))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let uop = uop.ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?;

    // -------------------------------------------------------------------------
    // Redis
    // -------------------------------------------------------------------------

    // Rate limit the queue.
    user_operation_rate_limit(state.redis, full_op_hash)
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // For each chain, run the kafka producer.
    produce_user_operation_message(
        state.producer.clone(),
        &UserOperationMessage {
            hash: parsed_query_hash,
            chain_id: uop.chain_id as u64,
            is_pending_update: false,
        },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
