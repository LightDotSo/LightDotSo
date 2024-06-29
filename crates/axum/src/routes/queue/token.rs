// Copyright 2023-2024 Light.
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

use super::{error::QueueError, types::QueueSuccess};
use crate::{error::RouteError, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_constants::chains::{ALL_CHAIN_IDS, MAINNET_CHAIN_IDS, ROUTESCAN_CHAIN_IDS};
use lightdotso_kafka::{
    topics::{covalent::produce_covalent_message, routescan::produce_routescan_message},
    types::{covalent::CovalentMessage, routescan::RoutescanMessage},
};
use lightdotso_prisma::wallet;
use lightdotso_redis::query::token::token_rate_limit;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The address of the target queue.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue token handler
#[utoipa::path(
        post,
        path = "/queue/token",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = QueueSuccess),
            (status = 500, description = "Queue internal error", body = QueueError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_queue_token_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<QueueSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallet from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(checksum_address.clone()))
        .with(wallet::wallet_settings::fetch())
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet =
        wallet.ok_or(RouteError::QueueError(QueueError::NotFound(checksum_address.clone())))?;

    // -------------------------------------------------------------------------
    // Redis
    // -------------------------------------------------------------------------

    // Rate limit the queue.
    token_rate_limit(state.redis, checksum_address)
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Get whether testnet is enabled.
    let testnet_enabled = if let Some(Some(wallet_settings)) = wallet.wallet_settings {
        wallet_settings.is_enabled_testnet
    } else {
        false
    };

    // Define the chains.
    let chains = if testnet_enabled { ALL_CHAIN_IDS.clone() } else { MAINNET_CHAIN_IDS.clone() };

    // For each chain, run the kafka producer.
    for chain in chains.iter() {
        produce_covalent_message(
            state.producer.clone(),
            &CovalentMessage { address: parsed_query_address, chain_id: *chain.0 },
        )
        .await?;
    }

    // For each chain in routescan, run the kafka producer.
    for chain in ROUTESCAN_CHAIN_IDS.iter() {
        produce_routescan_message(
            state.producer.clone(),
            &RoutescanMessage { address: parsed_query_address, chain_id: *chain.0 },
        )
        .await?;
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
