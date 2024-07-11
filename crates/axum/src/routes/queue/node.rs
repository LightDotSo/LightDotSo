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
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::types::H256;
use lightdotso_kafka::{topics::node::produce_node_message, types::node::NodeMessage};
use lightdotso_prisma::{configuration, signature, user_operation, user_operation_merkle};
use lightdotso_redis::query::node::node_rate_limit;
use lightdotso_tracing::tracing::info;
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

/// Queue node handler
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

    info!("parsed_query_hash: {:?}", parsed_query_hash);

    // -------------------------------------------------------------------------
    // Redis
    // -------------------------------------------------------------------------

    // Rate limit the queue.
    node_rate_limit(state.redis, full_op_hash.clone())
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operation from the database.
    let uop = state
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(full_op_hash.clone()))
        .with(
            user_operation::signatures::fetch(vec![signature::user_operation_hash::equals(
                full_op_hash.clone(),
            )])
            .with(signature::owner::fetch()),
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    if let Some(uop) = uop {
        info!("uop: {:?}", uop);

        // Get the latest configuration from the database.
        let configuration = state
            .client
            .configuration()
            .find_first(vec![configuration::address::equals(uop.sender.clone())])
            .exec()
            .await?;

        // If the configuration is not found, return a 404.
        let configuration = configuration
            .ok_or(RouteError::QueueError(QueueError::NotFound(uop.sender.clone())))?;

        // Compare with the configuration's threshold and the uop's signature's owner's culmative
        // weight, if the threshold is not met, return a 404
        if configuration.threshold >
            uop.signatures
                .unwrap_or_default()
                .into_iter()
                .filter_map(|s| s.owner.clone())
                .map(|owner| owner.weight)
                .sum()
        {
            return Err(RouteError::QueueError(QueueError::NotFound(uop.sender.clone())).into());
        }

        // For each chain, run the kafka producer.
        produce_node_message(state.producer.clone(), &NodeMessage { hash: parsed_query_hash })
            .await?;
    } else {
        // If the user operation is not found, search for the user operation merkle root.
        let uop_merkle = state
            .client
            .user_operation_merkle()
            .find_unique(user_operation_merkle::root::equals(full_op_hash.clone()))
            .with(
                user_operation_merkle::signatures::fetch(vec![
                    signature::user_operation_merkle_root::equals(Some(full_op_hash.clone())),
                ])
                .with(signature::owner::fetch()),
            )
            .with(user_operation_merkle::user_operations::fetch(vec![
                user_operation::user_operation_merkle_root::equals(Some(full_op_hash.clone())),
            ]))
            .exec()
            .await?;

        // If the user operation merkle root is not found, return a 404.
        let uop_merkle =
            uop_merkle.ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?;

        // Get the first user operation that is associated with the user operation merkle root.
        let uop = uop_merkle
            .user_operations
            .as_ref()
            .ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?
            .first()
            .ok_or(RouteError::QueueError(QueueError::NotFound(full_op_hash.clone())))?;

        // Get the latest configuration from the database.
        let configuration = state
            .client
            .configuration()
            .find_first(vec![configuration::address::equals(uop.sender.clone())])
            .exec()
            .await?;

        // If the configuration is not found, return a 404.
        let configuration = configuration
            .ok_or(RouteError::QueueError(QueueError::NotFound(uop.sender.clone())))?;

        // Compare with the configuration's threshold and the uop's culmative weight of the
        // signature's owner, if the threshold is not met, return a 404
        if configuration.threshold >
            uop_merkle
                .signatures
                .unwrap_or_default()
                .into_iter()
                .filter_map(|s| s.owner.clone())
                .map(|owner| owner.weight)
                .sum()
        {
            return Err(RouteError::QueueError(QueueError::NotFound(uop.sender.clone())).into());
        }

        // ---------------------------------------------------------------------
        // Kafka
        // ---------------------------------------------------------------------

        // For each user operation, run the kafka producer.
        for uop in uop_merkle.user_operations.as_ref().unwrap() {
            produce_node_message(state.producer.clone(), &NodeMessage { hash: uop.hash.parse()? })
                .await?;
        }
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
