// Copyright 2023-2024 Light, Inc.
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

use super::types::ConfigurationSignature;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::configuration_signature::error::ConfigurationSignatureError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_common::traits::HexToBytes;
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{
    configuration_operation, configuration_owner, ActivityEntity, ActivityOperation,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The operation of the configuration.
    pub configuration_operation_id: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

/// Signature operation post request params
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ConfigurationSignatureCreateRequestParams {
    /// The result of the signature.
    pub signature: ConfigurationSignatureCreateParams,
}

/// Signature operation
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ConfigurationSignatureCreateParams {
    /// The id of the owner of the signature.
    pub configuration_owner_id: String,
    /// The signature of the user operation in hex.
    pub signature: String,
    /// The type of the signature.
    pub signature_type: i32,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a configuration signature
#[utoipa::path(
        post,
        path = "/configuration_signature/create",
        params(
            PostQuery
        ),
        request_body = ConfigurationSignatureCreateRequestParams,
        responses(
            (status = 200, description = "Signature created successfully", body = Signature),
            (status = 400, description = "Invalid Configuration", body = SignatureError),
            (status = 409, description = "Signature already exists", body = SignatureError),
            (status = 500, description = "Signature internal error", body = SignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_signature_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<ConfigurationSignatureCreateRequestParams>,
) -> AppJsonResult<ConfigurationSignature> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the chain id from the post query.
    let configuration_operation_id = query.configuration_operation_id;

    // Get the signature from the post body.
    let sig = params.signature;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the signature the database.
    let configuration_signature = state
        .client
        .configuration_signature()
        .create(
            sig.signature.hex_to_bytes()?,
            configuration_operation::id::equals(configuration_operation_id.clone()),
            configuration_owner::id::equals(sig.configuration_owner_id),
            vec![],
        )
        .exec()
        .await?;
    info!(?configuration_signature);

    // Get the configuration operation from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(configuration_operation_id))
        .with(configuration_operation::wallet::fetch())
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("User operation not found".to_string()),
        ))?;

    // Get the wallet from the database.
    let wallet =
        configuration_operation.clone().wallet.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("Wallet not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::ConfigurationSignature,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&configuration_signature)?,
            params: CustomParams {
                configuration_signature_id: Some(configuration_signature.id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let configuration_signature: ConfigurationSignature = configuration_signature.into();

    Ok(Json::from(configuration_signature))
}
