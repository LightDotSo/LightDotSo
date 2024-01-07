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

use super::types::SupportRequest;
use crate::{result::AppJsonResult, sessions::get_user_id, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The wallet address of the user operation.
    pub wallet_address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct SupportRequestPostRequestParams {
    /// The result of the support_request.
    pub support_request: SupportRequest,
}

/// Create a support_request
#[utoipa::path(
        post,
        path = "/support_request/create",
        params(
            PostQuery
        ),
        request_body = SupportRequestPostRequestParams,
        responses(
            (status = 200, description = "SupportRequest created successfully", body = SupportRequest),
            (status = 500, description = "SupportRequest internal error", body = SupportRequestError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_support_request_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<SupportRequestPostRequestParams>,
) -> AppJsonResult<SupportRequest> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the wallet address from the post query.
    let wallet_address: H160 = query.wallet_address.parse()?;

    // Get the support_request from the post body.
    let support_request = params.support_request;

    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the userid from the session.
    let user_id = get_user_id(&mut session)?;
    info!(?user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the support_request the database.
    let support_request = state
        .client
        .support_request()
        .create(
            support_request.title,
            support_request.description,
            support_request.area,
            support_request.severity,
            lightdotso_prisma::wallet::address::equals(to_checksum(&wallet_address, None)),
            vec![],
        )
        .exec()
        .await?;
    info!(?support_request);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::SupportRequest,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&support_request)?,
            params: CustomParams {
                support_request_id: Some(support_request.id.clone()),
                wallet_address: Some(to_checksum(&wallet_address, None)),
                ..Default::default()
            },
        },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the support_requests to the format that the API expects.
    let support_request: SupportRequest = support_request.into();

    Ok(Json::from(support_request))
}
