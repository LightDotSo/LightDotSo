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
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_contracts::constants::{ALL_CHAIN_IDS, MAINNET_CHAIN_IDS};
use lightdotso_kafka::{
    topics::covalent::produce_covalent_message, types::covalent::CovalentMessage,
};
use lightdotso_prisma::wallet;
use lightdotso_redis::query::token::token_rate_limit;
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
    /// The address of the target queue.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Queue token handler.
#[utoipa::path(
        post,
        path = "/queue/token",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Queue created successfully", body = i64),

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

    // Rate limit the queue.
    token_rate_limit(state.redis, checksum_address)
        .map_err(|err| RouteError::QueueError(QueueError::RateLimitExceeded(err.to_string())))?;

    // Get whether testnet is enabled.
    let testnet_enabled = if let Some(Some(wallet_settings)) = wallet.wallet_settings {
        wallet_settings.is_enabled_testnet
    } else {
        false
    };

    // Define the chains.
    let chains = if testnet_enabled { ALL_CHAIN_IDS.clone() } else { MAINNET_CHAIN_IDS.clone() };

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // For each chain, run the kafka producer.
    for chain in chains.iter() {
        produce_covalent_message(
            state.producer.clone(),
            &CovalentMessage { address: parsed_query_address, chain_id: *chain.0 },
        )
        .await?;
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(QueueSuccess::Queued("Queue Success".to_string())))
}
