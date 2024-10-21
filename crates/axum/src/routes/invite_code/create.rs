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

use super::{
    error::InviteCodeError,
    types::{GenerateInviteCode, InviteCode},
};
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult, sessions::get_user_id,
    tags::INVITE_CODE_TAG,
};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use tower_sessions_core::Session;

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create an invite code
///
/// Creates an invite code for the application.
#[utoipa::path(
        post,
        path = "/invite_code/create",
        responses(
            (status = 200, description = "Invite code created successfully", body = InviteCode),
            (status = 500, description = "Invite code internal error", body = InviteCodeError),
        ),
        tag = INVITE_CODE_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_create_handler(
    State(state): State<ClientState>,
    mut session: Session,
) -> AppJsonResult<InviteCode> {
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
        return Err(RouteError::InviteCodeError(InviteCodeError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Generate a new invite_code w/ the format AAA-ZZZ.
    let code = InviteCode::generate_invite_code();

    // Create the invite_code the database.
    let invite_code = state
        .client
        .invite_code()
        .create(code, lightdotso_prisma::user::id::equals(auth_user_id.clone()), vec![])
        .exec()
        .await?;
    info!(?invite_code);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::InviteCode,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&invite_code)?,
            params: CustomParams {
                invite_code_id: Some(invite_code.id.clone()),
                user_id: Some(auth_user_id),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the invite_codes to the format that the API expects.
    let invite_code: InviteCode = invite_code.into();

    Ok(Json::from(invite_code))
}
