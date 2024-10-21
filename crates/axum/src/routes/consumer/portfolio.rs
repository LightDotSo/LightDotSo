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

use super::{error::ConsumerError, types::ConsumerSuccess};
use crate::{result::AppJsonResult, tags::CONSUMER_TAG};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_consumer::topics::portfolio::PortfolioConsumer;
use lightdotso_kafka::types::portfolio::PortfolioMessage;
use lightdotso_state::ClientState;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The address to consume.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Consumer portfolio
///
/// Consumers an portfolio for processing.
#[utoipa::path(
        post,
        path = "/consumer/portfolio",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Consumer ingested successfully", body = ConsumerSuccess),
            (status = 500, description = "Consumer internal error", body = ConsumerError),
        ),
        tag = CONSUMER_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_consumer_portfolio_handler(
    post_query: Query<PostQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<ConsumerSuccess> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Parse the address
    let parsed_query_address: Address = query.address.parse()?;

    // -------------------------------------------------------------------------
    // Consumer
    // -------------------------------------------------------------------------

    let consumer = PortfolioConsumer;
    let msg = PortfolioMessage { address: parsed_query_address };
    consumer.consume_with_message(&state, msg).await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(ConsumerSuccess::Consumed("Consumer Success".to_string())))
}
