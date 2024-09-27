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

#![allow(clippy::unwrap_used)]

use super::types::ConfigurationOperationSignature;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::configuration_operation_signature::error::ConfigurationOperationSignatureError,
    state::AppState,
};
use alloy::primitives::Address;
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
    configuration, configuration_operation, configuration_operation_owner,
    configuration_operation_signature, owner, ActivityEntity, ActivityOperation,
};
use lightdotso_sequence::{
    builder::rooted_node_builder,
    config::WalletConfig,
    signature::recover_ecdsa_signature,
    types::{AddressSignatureLeaf, SignatureLeaf, Signer, SignerNode},
    utils::{hash_image_bytes32, render_subdigest},
};
use lightdotso_tracing::tracing::{error, info};
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
pub struct ConfigurationOperationSignatureCreateRequestParams {
    /// The result of the signature.
    pub signature: ConfigurationOperationSignatureSignatureCreateParams,
}

/// Signature operation
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ConfigurationOperationSignatureSignatureCreateParams {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature of the user operation in hex.
    pub signature: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a configuration signature
///
/// Creates a configuration signature for a configuration operation.
#[utoipa::path(
        post,
        path = "/configuration_operation_signature/create",
        params(
            PostQuery
        ),
        request_body = ConfigurationOperationSignatureCreateRequestParams,
        responses(
            (status = 200, description = "Signature created successfully", body = Signature),
            (status = 400, description = "Invalid configuration", body = SignatureError),
            (status = 409, description = "Signature already exists", body = SignatureError),
            (status = 500, description = "Signature internal error", body = SignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_signature_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<ConfigurationOperationSignatureCreateRequestParams>,
) -> AppJsonResult<ConfigurationOperationSignature> {
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

    // Get the user operation from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(configuration_operation_id.clone()))
        .with(configuration_operation::configuration_operation_owners::fetch(vec![]))
        .with(configuration_operation::wallet::fetch())
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound("User operation not found".to_string()),
        ))?;

    // Get the owner from configuration operation.
    let configuration_operation_owners = configuration_operation
        .clone()
        .configuration_operation_owners
        .ok_or(RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound("Owner not found".to_string()),
        ))?;

    // Get the wallet from the database.
    let wallet = configuration_operation.clone().wallet.ok_or(
        RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound("Wallet not found".to_string()),
        ),
    )?;

    // Get the previous configuration.
    let configuration = state
        .client
        .configuration()
        .find_unique(configuration::address_checkpoint(
            wallet.address.clone(),
            configuration_operation.clone().checkpoint - 1,
        ))
        .with(configuration::owners::fetch(vec![]).with(owner::user::fetch()))
        .exec()
        .await?;

    let configuration = configuration.ok_or(RouteError::ConfigurationOperationSignatureError(
        ConfigurationOperationSignatureError::NotFound("Configuration not found".to_string()),
    ))?;

    let configuration_owners =
        configuration.clone().owners.ok_or(RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound(
                "Configuration owners not found".to_string(),
            ),
        ))?;

    // -------------------------------------------------------------------------
    // Validate
    // -------------------------------------------------------------------------

    // Check if the signature `owner_id` is in the configuration owners.
    configuration_owners
        .iter()
        .find(|owner| owner.id == sig.owner_id)
        .ok_or(AppError::BadRequest)?;

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;

    // Conver the owners to SignerNode.
    let owner_nodes: Vec<SignerNode> = configuration_operation_owners
        .iter()
        .map(|owner| SignerNode {
            signer: Some(Signer {
                weight: Some(owner.weight as u8),
                leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                    address: owner.address.parse().unwrap(),
                }),
            }),
            left: None,
            right: None,
        })
        .collect();

    // Build the node tree.
    let tree = rooted_node_builder(owner_nodes)?;

    // Create a wallet config
    let mut config = WalletConfig {
        signature_type: 0,
        checkpoint: configuration_operation.checkpoint as u32,
        threshold: configuration_operation.threshold as u16,
        weight: 1,
        image_hash: [0; 32].into(),
        tree,
        internal_root: None,
        internal_recovered_configs: None,
    };

    // Simulate the image hash of the wallet config.
    let res = config.regenerate_image_hash([0; 32])?;

    // Render the subdigest.
    let subdigest = render_subdigest(
        // Chain agnostic signature type.
        0,
        wallet.clone().address.parse()?,
        hash_image_bytes32(&res)?,
    )?;
    info!(?subdigest);

    // Recover the signature.
    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;
    info!(?recovered_sig);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration_operation_owner from the database.
    let configuration_operation_signature_owner = state
        .client
        .owner()
        .find_unique(owner::id::equals(sig.clone().owner_id))
        .with(owner::user::fetch())
        .exec()
        .await?;
    info!(?configuration_operation_signature_owner);

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // If the owner is not found, return a 404.
    let configuration_operation_signature_owner =
        configuration_operation_signature_owner.ok_or(AppError::NotFound)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address !=
        configuration_operation_signature_owner.address.parse::<Address>()?
    {
        error!(
            "recovered_sig.address: {}, configuration_operation_signature_owner.address: {}",
            recovered_sig.address, configuration_operation_signature_owner.address
        );
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration operation from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(configuration_operation_id))
        .with(configuration_operation::wallet::fetch())
        .with(
            configuration_operation::configuration_operation_signatures::fetch(vec![])
                .with(configuration_operation_signature::owner::fetch()),
        )
        .with(
            configuration_operation::configuration_operation_owners::fetch(vec![])
                .with(configuration_operation_owner::user::fetch()),
        )
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound("User operation not found".to_string()),
        ))?;

    // Get the wallet from the database.
    let wallet = configuration_operation.clone().wallet.ok_or(
        RouteError::ConfigurationOperationSignatureError(
            ConfigurationOperationSignatureError::NotFound("Wallet not found".to_string()),
        ),
    )?;

    // Create the signature the database.
    let configuration_operation_signature = state
        .client
        .configuration_operation_signature()
        .create(
            sig.signature.hex_to_bytes()?,
            configuration_operation::id::equals(configuration_operation.id.clone()),
            owner::id::equals(sig.owner_id),
            vec![],
        )
        .exec()
        .await?;
    info!(?configuration_operation_signature);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::ConfigurationOperationSignature,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&configuration_operation_signature)?,
            params: CustomParams {
                configuration_operation_signature_id: Some(
                    configuration_operation_signature.id.clone(),
                ),
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
    let configuration_operation_signature: ConfigurationOperationSignature =
        configuration_operation_signature.into();

    Ok(Json::from(configuration_operation_signature))
}
