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

#![allow(clippy::unwrap_used)]

use crate::{error::RouteError, result::AppJsonResult, state::AppState};
use alloy::{eips::BlockNumberOrTag, primitives::B256, providers::Provider};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_contracts::provider::get_provider;
use lightdotso_kafka::topics::transaction::produce_transaction_message;
use lightdotso_redis::query::transaction::transaction_rate_limit;
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
    /// The transaction hash of the target queue.
    pub hash: String,
    /// The chain id of the target queue.
    pub chain_id: u64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue transaction
///
/// Queues a transaction for processing.
#[utoipa::path(
        post,
        path = "/queue/transaction",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = QueueSuccess),
            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_transaction_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<QueueSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    let parsed_query_hash: B256 = query.hash.parse()?;
    let full_op_hash = format!("{:?}", parsed_query_hash);

    // -------------------------------------------------------------------------
    // Redis
    // -------------------------------------------------------------------------

    // Rate limit the queue.
    transaction_rate_limit(state.redis, full_op_hash)
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // -------------------------------------------------------------------------
    // Provider
    // -------------------------------------------------------------------------

    let (provider, _) = get_provider(query.chain_id).await?;

    let tx = provider
        .get_transaction_by_hash(parsed_query_hash)
        .await
        .map_err(|err| RouteError::QueueError(QueueError::ProviderError(err.to_string())))?;

    // If the tx is not found, return a 404.
    let tx = tx
        .ok_or(RouteError::QueueError(QueueError::NotFound("Transaction not found".to_string())))?;

    // Get the block.
    let block = provider
        .get_block_by_number(BlockNumberOrTag::Number(tx.block_number.unwrap()), true)
        .await
        .map_err(|err| RouteError::QueueError(QueueError::ProviderError(err.to_string())))?;

    let payload = serde_json::to_value((&block, &query.chain_id))
        .unwrap_or_else(|_| serde_json::Value::Null)
        .to_string();

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // For each chain, run the kafka producer.
    produce_transaction_message(state.producer.clone(), &payload).await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
