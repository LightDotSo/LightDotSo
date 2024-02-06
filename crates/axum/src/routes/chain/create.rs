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

use crate::{
    constants::KAKI_USER_ID,
    error::RouteError,
    result::AppJsonResult,
    routes::chain::{error::ChainError, types::Chain},
    sessions::get_user_id,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::chain;
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
    /// The id of the chain id to createfor.
    id: i64,
    /// The name of the chain.
    name: String,
    /// A boolean value to indicate if the chain is testnet.
    is_testnet: bool,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a chain.
#[utoipa::path(
        post,
        path = "/chain/create",
        params(
            PostQuery
        ),
        request_body = ChainCreateRequestParams,
        responses(
            (status = 200, description = "Chain created successfully", body = Chain),
            (status = 500, description = "Chain internal error", body = ChainError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_chain_create_handler(
    State(state): State<AppState>,
    mut session: Session,
    post_query: Query<PostQuery>,
) -> AppJsonResult<Chain> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;
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
