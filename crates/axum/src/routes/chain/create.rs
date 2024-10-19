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
    constants::KAKI_USER_ID,
    error::RouteError,
    result::AppJsonResult,
    routes::chain::{error::ChainError, types::Chain},
    sessions::get_user_id,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::chain;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use tower_sessions_core::Session;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The id of the chain id to create for.
    id: i64,
    /// The name of the chain.
    name: String,
    /// A boolean value to indicate if the chain is testnet.
    is_testnet: bool,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a chain
///
/// Creates a chain w/ the given id and name.
#[utoipa::path(
        post,
        path = "/chain/create",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Chain created successfully", body = Chain),
            (status = 500, description = "Chain internal error", body = ChainError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_chain_create_handler(
    State(state): State<ClientState>,
    mut session: Session,
    post_query: Query<PostQuery>,
) -> AppJsonResult<Chain> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session).await?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    // If the authenticated user id is not `KAKI_USER_ID`, return an error.
    if auth_user_id != KAKI_USER_ID.to_string() {
        return Err(RouteError::ChainError(ChainError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the chain id from the post query.
    let chain_id = query.id;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the chain.
    let chain = state
        .client
        .chain()
        .create(
            chain_id,
            vec![chain::name::set(Some(query.name)), chain::is_testnet::set(query.is_testnet)],
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the chain to the format that the API expects.
    let chain: Chain = chain.into();

    Ok(Json::from(chain))
}
