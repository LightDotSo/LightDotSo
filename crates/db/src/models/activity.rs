// Copyright 2023-2024 Light
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

use crate::types::{AppJsonResult, Database};
use autometrics::autometrics;
use axum::extract::Json;
use lightdotso_prisma::{
    activity, configuration_operation_signature, feedback, notification, paymaster,
    paymaster_operation, signature, simulation, transaction, user_operation, ActivityEntity,
    ActivityOperation,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct CustomParams {
    // Core
    pub user_id: Option<String>,
    pub wallet_address: Option<String>,
    // Mutable
    pub billing_id: Option<String>,
    pub billing_operation_id: Option<String>,
    pub invite_code_id: Option<String>,
    pub support_request_id: Option<String>,
    pub user_settings_id: Option<String>,
    pub user_notification_settings_id: Option<String>,
    pub wallet_billing_id: Option<String>,
    pub wallet_notification_settings_id: Option<String>,
    pub wallet_settings_id: Option<String>,
    // Immutable
    pub feedback_id: Option<String>,
    pub notification_id: Option<String>,
    pub paymaster_id: Option<String>,
    pub paymaster_operation_id: Option<String>,
    pub signature_id: Option<String>,
    pub simulation_id: Option<String>,
    pub transaction_hash: Option<String>,
    pub user_operation_hash: Option<String>,
    // Add-ons
    // Mutable
    pub configuration_operation_id: Option<String>,
    // Immutable
    pub configuration_operation_signature_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Core
    // -------------------------------------------------------------------------

    if let Some(user_id) = custom_params.user_id {
        params.push(activity::user_id::set(Some(user_id)));
    }

    if let Some(wallet_address) = custom_params.wallet_address {
        params.push(activity::wallet_address::set(Some(wallet_address)));
    }

    // -------------------------------------------------------------------------
    // Mutable
    // -------------------------------------------------------------------------

    if let Some(billing_id) = custom_params.billing_id {
        params.push(activity::billing_id::set(Some(billing_id)));
    }

    if let Some(billing_operation_id) = custom_params.billing_operation_id {
        params.push(activity::billing_operation_id::set(Some(billing_operation_id)));
    }

    if let Some(invite_code_id) = custom_params.invite_code_id {
        params.push(activity::invite_code_id::set(Some(invite_code_id)));
    }

    if let Some(support_request_id) = custom_params.support_request_id {
        params.push(activity::support_request_id::set(Some(support_request_id)));
    }

    if let Some(user_settings_id) = custom_params.user_settings_id {
        params.push(activity::user_settings_id::set(Some(user_settings_id)));
    }

    if let Some(user_notification_settings_id) = custom_params.user_notification_settings_id {
        params.push(activity::user_notification_settings_id::set(Some(
            user_notification_settings_id,
        )));
    }

    if let Some(wallet_billing_id) = custom_params.wallet_billing_id {
        params.push(activity::wallet_billing_id::set(Some(wallet_billing_id)));
    }

    if let Some(wallet_notification_settings_id) = custom_params.wallet_notification_settings_id {
        params.push(activity::wallet_notification_settings_id::set(Some(
            wallet_notification_settings_id,
        )));
    }

    if let Some(wallet_settings_id) = custom_params.wallet_settings_id {
        params.push(activity::wallet_settings_id::set(Some(wallet_settings_id)));
    }

    // -------------------------------------------------------------------------
    // Immutable
    // -------------------------------------------------------------------------

    if let Some(feedback_id) = custom_params.feedback_id {
        params.push(activity::feedback::connect(feedback::id::equals(feedback_id)));
    }

    if let Some(notification_id) = custom_params.notification_id {
        params.push(activity::notification::connect(notification::id::equals(notification_id)));
    }

    if let Some(paymaster_id) = custom_params.paymaster_id {
        params.push(activity::paymaster::connect(paymaster::id::equals(paymaster_id)));
    }

    if let Some(paymaster_operation_id) = custom_params.paymaster_operation_id {
        params.push(activity::paymaster_operation::connect(paymaster_operation::id::equals(
            paymaster_operation_id,
        )));
    }

    if let Some(signature_id) = custom_params.signature_id {
        params.push(activity::signature::connect(signature::id::equals(signature_id)));
    }

    if let Some(simulation_id) = custom_params.simulation_id {
        params.push(activity::simulation::connect(simulation::id::equals(simulation_id)));
    }

    if let Some(transaction_hash) = custom_params.transaction_hash {
        params.push(activity::transaction::connect(transaction::hash::equals(transaction_hash)));
    }

    if let Some(user_operation_hash) = custom_params.user_operation_hash {
        params.push(activity::user_operation::connect(user_operation::hash::equals(
            user_operation_hash,
        )));
    }

    // -------------------------------------------------------------------------
    // Add-ons
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Mutable
    // -------------------------------------------------------------------------

    if let Some(configuration_operation_id) = custom_params.configuration_operation_id {
        params.push(activity::configuration_operation_id::set(Some(configuration_operation_id)));
    }

    // -------------------------------------------------------------------------
    // Immutable
    // -------------------------------------------------------------------------

    if let Some(configuration_operation_signature_id) =
        custom_params.configuration_operation_signature_id
    {
        params.push(activity::configuration_operation_signature::connect(
            configuration_operation_signature::id::equals(configuration_operation_signature_id),
        ));
    }

    let activity = db.activity().create(entity, operation, log, params).exec().await?;

    Ok(Json::from(activity))
}
