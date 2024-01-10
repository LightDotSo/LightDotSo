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
    topics::interpretation::produce_interpretation_message,
    types::interpretation::InterpretationMessage,
};
use lightdotso_prisma::{transaction, user_operation};
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
    pub transaction_hash: String,
    /// The optional user operation hash to queue.
    pub user_operation_hash: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue interpretation handler.
#[utoipa::path(
        post,
        path = "/queue/interpretation",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = i64),

            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_interpretation_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<QueueSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    let parsed_transaction_hash: H256 = query.transaction_hash.parse()?;
    let parsed_user_operation_hash: Option<H256> =
        query.user_operation_hash.map_or(Ok(None), |hash| hash.parse().map(Some))?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // If the transaction hash is provided, get the transaction from the database.
    state
        .client
        .transaction()
        .find_unique(transaction::hash::equals(format!("{:?}", parsed_transaction_hash)))
        .exec()
        .await?
        .ok_or_else(|| {
            RouteError::QueueError(QueueError::NotFound(format!("{:?}", parsed_transaction_hash)))
        })?;

    // If the user operation hash is provided, get the user operation from the database.
    if let Some(user_operation_hash) = parsed_user_operation_hash {
        state
            .client
            .user_operation()
            .find_unique(user_operation::hash::equals(format!("{:?}", user_operation_hash)))
            .exec()
            .await?
            .ok_or_else(|| {
                RouteError::QueueError(QueueError::NotFound(format!("{:?}", user_operation_hash)))
            })?;
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
