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

use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
};
use alloy::primitives::B256;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_kafka::{
    topics::interpretation::produce_interpretation_message,
    types::interpretation::InterpretationMessage,
};
use lightdotso_prisma::{transaction, user_operation, UserOperationStatus};
use lightdotso_state::ClientState;
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
    /// The optional transaction hash to queue.
    pub transaction_hash: Option<String>,
    /// The optional user operation hash to queue.
    pub user_operation_hash: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue interpretation
///
/// Queues an interpretation for processing.
#[utoipa::path(
        post,
        path = "/queue/interpretation",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = QueueSuccess),
            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_interpretation_handler(
    post_query: Query<PostQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<QueueSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    let parsed_transaction_hash: Option<B256> =
        query.transaction_hash.map_or(Ok(None), |hash| hash.parse().map(Some))?;
    let parsed_user_operation_hash: Option<B256> =
        query.user_operation_hash.map_or(Ok(None), |hash| hash.parse().map(Some))?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // If the transaction hash is provided, get the transaction from the database.
    if let Some(transaction_hash) = parsed_transaction_hash {
        state
            .client
            .transaction()
            .find_unique(transaction::hash::equals(format!("{:?}", transaction_hash)))
            .exec()
            .await?
            .ok_or_else(|| {
                RouteError::QueueError(QueueError::NotFound(format!("{:?}", transaction_hash)))
            })?;
    }

    // If the user operation hash is provided, get the user operation from the database.
    if let Some(user_operation_hash) = parsed_user_operation_hash {
        let user_operation = state
            .client
            .user_operation()
            .find_unique(user_operation::hash::equals(format!("{:?}", user_operation_hash)))
            .exec()
            .await?
            .ok_or_else(|| {
                RouteError::QueueError(QueueError::NotFound(format!("{:?}", user_operation_hash)))
            })?;

        // If the user operation's status is not `Executed` or `Reverted`, return an error.
        if user_operation.status != UserOperationStatus::Invalid &&
            user_operation.status != UserOperationStatus::Pending &&
            user_operation.status != UserOperationStatus::Proposed &&
            // Also, if the user operation's transaction hash is `None`, return an error.
            user_operation.transaction_hash.is_none()
        {
            return Err(AppError::RouteError(RouteError::QueueError(QueueError::BadRequest(
                "User operation is invalid, pending, proposed, or not executed yet".to_string(),
            ))));
        }
    }

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // For each chain, run the kafka producer.
    produce_interpretation_message(
        state.producer.clone(),
        &InterpretationMessage {
            transaction_hash: parsed_transaction_hash,
            user_operation_hash: parsed_user_operation_hash,
        },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
