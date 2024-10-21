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

use super::{error::SupportRequestError, types::SupportRequest};
use crate::{result::AppJsonResult, sessions::get_user_id, tags::SUPPORT_REQUEST_TAG};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use lightdotso_state::ClientState;
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
pub struct SupportRequestCreateRequestParams {
    /// The result of the support_request.
    pub support_request: SupportRequest,
}

/// Create a support_request
///
/// Creates a support_request with the given parameters.
#[utoipa::path(
        post,
        path = "/support_request/create",
        params(
            PostQuery
        ),
        request_body = SupportRequestCreateRequestParams,
        responses(
            (status = 200, description = "SupportRequest created successfully", body = SupportRequest),
            (status = 500, description = "SupportRequest internal error", body = SupportRequestError),
        ),
        tag = SUPPORT_REQUEST_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_support_request_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<ClientState>,
    mut session: Session,
    Json(params): Json<SupportRequestCreateRequestParams>,
) -> AppJsonResult<SupportRequest> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the wallet address from the post query.
    let wallet_address: Address = query.wallet_address.parse()?;

    // Get the support_request from the post body.
    let support_request = params.support_request;

    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id from the session.
    let auth_user_id = get_user_id(&mut session).await?;
    info!(?auth_user_id);

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
            lightdotso_prisma::wallet::address::equals(wallet_address.to_checksum(None)),
            vec![],
        )
        .exec()
        .await?;
    info!(?support_request);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::SupportRequest,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&support_request)?,
            params: CustomParams {
                support_request_id: Some(support_request.id.clone()),
                user_id: Some(auth_user_id.clone()),
                wallet_address: Some(wallet_address.to_checksum(None)),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the support_requests to the format that the API expects.
    let support_request: SupportRequest = support_request.into();

    Ok(Json::from(support_request))
}
