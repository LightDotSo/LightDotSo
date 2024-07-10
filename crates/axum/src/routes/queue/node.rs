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
use lightdotso_kafka::{topics::node::produce_node_message, types::node::NodeMessage};
use lightdotso_prisma::{user_operation, user_operation_merkle};
use lightdotso_redis::query::node::node_rate_limit;
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
    /// The user operation hash or the user operation merkle root of the target queue.
    pub hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue user operation handler
#[utoipa::path(
        post,
        path = "/queue/node",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = QueueSuccess),
            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_node_handler(
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

    // If the user operation is not found, search for the user operation merkle root.
    uop.ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?;

    // Get the user operation merkle root from the database.
    let uop_merkle = state
        .client
        .user_operation_merkle()
        .find_unique(user_operation_merkle::root::equals(full_op_hash.clone()))
        .exec()
        .await?;

    // If the user operation merkle root is not found, return a 404.
    uop_merkle.ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?;

    // -------------------------------------------------------------------------
    // Redis
    // -------------------------------------------------------------------------

    // Rate limit the queue.
    node_rate_limit(state.redis, full_op_hash)
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // For each chain, run the kafka producer.
    produce_node_message(state.producer.clone(), &NodeMessage { hash: parsed_query_hash }).await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
