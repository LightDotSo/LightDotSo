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
        &UserOperationMessage { hash: parsed_query_hash, chain_id: uop.chain_id as u64 },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
