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

use crate::types::{AppJsonResult, Database};
use autometrics::autometrics;
use axum::extract::Json;
use lightdotso_prisma::{
    activity, feedback, notification, transaction, user_operation, ActivityEntity,
    ActivityOperation,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Default, Serialize, Deserialize)]
pub struct CustomParams {
    pub user_id: Option<String>,
    pub wallet_address: Option<String>,
    pub invite_code_id: Option<String>,
    pub support_request_id: Option<String>,
    pub wallet_settings_id: Option<String>,
    pub feedback_id: Option<String>,
    pub notification_id: Option<String>,
    pub user_operation_hash: Option<String>,
    pub transaction_hash: Option<String>,
}

/// Create activity with user and wallet w/ optional custom params
#[autometrics]
pub async fn create_activity_with_user_and_wallet(
    db: Database,
    entity: ActivityEntity,
    operation: ActivityOperation,
    log: Value,

    custom_params: CustomParams,
) -> AppJsonResult<activity::Data> {
    info!("Creating activity at entity: {:?}", entity);

    let mut params = vec![];

    if let Some(user_id) = custom_params.user_id {
        params.push(activity::user_id::set(Some(user_id)));
    }

    if let Some(wallet_address) = custom_params.wallet_address {
        params.push(activity::wallet_address::set(Some(wallet_address)));
    }

    if let Some(invite_code_id) = custom_params.invite_code_id {
        params.push(activity::invite_code_id::set(Some(invite_code_id)));
    }

    if let Some(support_request_id) = custom_params.support_request_id {
        params.push(activity::support_request_id::set(Some(support_request_id)));
    }

    if let Some(wallet_settings_id) = custom_params.wallet_settings_id {
        params.push(activity::wallet_settings_id::set(Some(wallet_settings_id)));
    }

    if let Some(feedback_id) = custom_params.feedback_id {
        params.push(activity::feedback::connect(feedback::id::equals(feedback_id)));
    }

    if let Some(notification_id) = custom_params.notification_id {
        params.push(activity::notification::connect(notification::id::equals(notification_id)));
    }

    if let Some(user_operation_hash) = custom_params.user_operation_hash {
        params.push(activity::user_operation::connect(user_operation::hash::equals(
            user_operation_hash,
        )));
    }

    if let Some(transaction_hash) = custom_params.transaction_hash {
        params.push(activity::transaction::connect(transaction::hash::equals(transaction_hash)));
    }

    let activity = db.activity().create(entity, operation, log, params).exec().await?;

    Ok(Json::from(activity))
}
