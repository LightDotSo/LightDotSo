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

#![allow(clippy::unwrap_used)]

use super::types::ConfigurationSignature;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::configuration_signature::error::ConfigurationSignatureError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::Result;
use lightdotso_common::traits::HexToBytes;
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{
    configuration, configuration_operation, configuration_owner, configuration_signature, owner,
    ActivityEntity, ActivityOperation, ConfigurationOperationStatus,
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

    // Get the user operation from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(configuration_operation_id.clone()))
        .with(configuration_operation::configuration_owners::fetch(vec![]))
        .with(configuration_operation::wallet::fetch())
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("User operation not found".to_string()),
        ))?;

    // Get the owner from configuration operation.
    let configuration_owners = configuration_operation.clone().configuration_owners.ok_or(
        RouteError::ConfigurationSignatureError(ConfigurationSignatureError::NotFound(
            "Owner not found".to_string(),
        )),
    )?;

    // Get the wallet from the database.
    let wallet =
        configuration_operation.clone().wallet.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("Wallet not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;

    // Conver the owners to SignerNode.
    let owner_nodes: Vec<SignerNode> = configuration_owners
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

    // Get the configuration_owner from the database.
    let configuration_owner = state
        .client
        .configuration_owner()
        .find_unique(configuration_owner::id::equals(sig.clone().configuration_owner_id))
        .with(configuration_owner::user::fetch())
        .exec()
        .await?;
    info!(?configuration_owner);

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // If the owner is not found, return a 404.
    let configuration_owner = configuration_owner.ok_or(AppError::NotFound)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address != configuration_owner.address.parse()? {
        error!(
            "recovered_sig.address: {}, configuration_owner.address: {}",
            recovered_sig.address, configuration_owner.address
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
            configuration_operation::configuration_signatures::fetch(vec![])
                .with(configuration_signature::configuration_owner::fetch()),
        )
        .with(
            configuration_operation::configuration_owners::fetch(vec![])
                .with(configuration_owner::user::fetch()),
        )
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

    // Get the configuration signatures from the database.
    let configuration_signatures = configuration_operation.clone().configuration_signatures.ok_or(
        RouteError::ConfigurationSignatureError(ConfigurationSignatureError::NotFound(
            "Configuration signatures not found".to_string(),
        )),
    )?;

    // Get the configuration owners from the database.
    let owners = configuration_operation.clone().configuration_owners.ok_or(
        RouteError::ConfigurationSignatureError(ConfigurationSignatureError::NotFound(
            "Configuration owners not found".to_string(),
        )),
    )?;

    // Create the signature the database.
    let configuration_signature = state
        .client
        .configuration_signature()
        .create(
            sig.signature.hex_to_bytes()?,
            configuration_operation::id::equals(configuration_operation.id.clone()),
            configuration_owner::id::equals(sig.configuration_owner_id),
            vec![],
        )
        .exec()
        .await?;
    info!(?configuration_signature);

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

    // Get the culmulative weight of the existing signatures.
    let culmulative_weight:i64 =
        // Unwrap is safe because we are fetching the configuration_owner.
        configuration_signatures.iter().map(|sig| sig.configuration_owner.as_ref().unwrap().weight).sum();

    // If the culmulative weight is greater than the threshold, update the configuration operation.
    if culmulative_weight + configuration_owner.weight >= configuration_operation.threshold {
        // Update the configuration operation.
        let configuration_operation = state
            .client
            .configuration_operation()
            .update(
                configuration_operation::id::equals(configuration_operation.id.clone()),
                vec![configuration_operation::status::set(ConfigurationOperationStatus::Confirmed)],
            )
            .exec()
            .await?;
        info!(?configuration_operation);

        // ---------------------------------------------------------------------
        // Kafka
        // ---------------------------------------------------------------------

        // Produce an activity message.
        let _ = produce_activity_message(
            state.producer.clone(),
            ActivityEntity::ConfigurationOperation,
            &ActivityMessage {
                operation: ActivityOperation::Update,
                log: serde_json::to_value(&configuration_operation.clone())?,
                params: CustomParams {
                    configuration_operation_id: Some(configuration_operation.clone().id.clone()),
                    wallet_address: Some(wallet.address.clone()),
                    ..Default::default()
                },
            },
        )
        .await;

        // ---------------------------------------------------------------------
        // DB
        // ---------------------------------------------------------------------

        // Create a new configuration w/ the same contents as the configuration operation.
        let configuration: Result<configuration::Data> = state
            .client
            ._transaction()
            .run(|client| async move {
                // Create the configuration to the database.
                let configuration_data = client
                    .configuration()
                    .create(
                        configuration_operation.clone().address,
                        configuration_operation.clone().checkpoint,
                        configuration_operation.clone().image_hash,
                        configuration_operation.clone().threshold,
                        vec![],
                    )
                    .exec()
                    .await?;
                info!(?configuration_data);

                // Create the owners to the database.
                let owner_data = client
                    .owner()
                    .create_many(
                        owners
                            .iter()
                            .enumerate()
                            .map(|(_index, owner)| {
                                owner::create_unchecked(
                                    owner.clone().address,
                                    owner.clone().weight,
                                    owner.clone().index,
                                    configuration_data.clone().id,
                                    vec![owner::user_id::set(Some(
                                        owner
                                            .clone()
                                            .user
                                            .as_ref()
                                            .unwrap()
                                            .as_ref()
                                            .unwrap()
                                            .id
                                            .clone(),
                                    ))],
                                )
                            })
                            .collect(),
                    )
                    .exec()
                    .await?;
                info!(?owner_data);

                Ok(configuration_data)
            })
            .await;
        info!(?configuration);
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let configuration_signature: ConfigurationSignature = configuration_signature.into();

    Ok(Json::from(configuration_signature))
}
