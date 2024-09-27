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
#![allow(clippy::unnecessary_fallible_conversions)]

use crate::{
    result::{AppError, AppJsonResult},
    routes::{owner::types::Owner, signature::types::Signature},
    state::AppState,
};
use alloy::hex;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::{eyre, Result};
use lightdotso_common::traits::{HexToBytes, VecU8ToHex};
use lightdotso_prisma::{
    configuration, owner, signature, user_operation, user_operation_merkle_proof,
};
use lightdotso_sequence::{
    builder::rooted_node_builder,
    config::WalletConfig,
    merkle::render_merkle,
    types::{
        AddressSignatureLeaf, ECDSASignatureLeaf, SignatureLeaf, Signer, SignerNode,
        ECDSA_SIGNATURE_LENGTH,
    },
    utils::parse_hex_to_bytes32,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The user operation hash to get.
    pub user_operation_hash: String,
    /// The optional configuration id that is on the current wallet.
    pub configuration_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Check a user operation signature
///
/// Checks a user operation for its validity and returns the computed signature if valid.
#[utoipa::path(
        get,
        path = "/user_operation/signature",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User operation signature returned successfully", body = String),
            (status = 404, description = "User operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_signature_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<String> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;
    let user_operation_hash = query.user_operation_hash.clone();

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operations from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .with(
            user_operation::signatures::fetch(vec![signature::user_operation_hash::equals(
                user_operation_hash,
            )])
            .with(signature::owner::fetch()),
        )
        .with(
            user_operation::user_operation_merkle_proofs::fetch(vec![])
                .order_by(user_operation_merkle_proof::index::order(Direction::Asc)),
        )
        .exec()
        .await?;
    info!(?user_operation);

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(AppError::NotFound)?;

    // Map the signatures into type from the user_operation
    let signatures = user_operation
        .clone()
        .signatures
        .map_or(Vec::new(), |signature| signature.into_iter().map(Signature::from).collect());
    info!("{}", signatures.len());

    // Get the configurations from the database.
    let configurations = state
        .client
        .configuration()
        .find_many(vec![configuration::address::equals(user_operation.clone().sender)])
        .with(configuration::owners::fetch(vec![]).order_by(owner::index::order(Direction::Asc)))
        .with(configuration::configuration_operation_signatures::fetch(vec![]))
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .exec()
        .await?;
    info!(?configurations);

    // If the configurations is not found, return a 404.
    if configurations.is_empty() {
        return Err(AppError::NotFound);
    }

    // Get the current configuration for the matching signature -> owner id -> configuration id.
    let op_configuration = configurations
        .clone()
        .into_iter()
        .find(|configuration| {
            configuration.owners.as_ref().map_or(false, |owners| {
                owners.iter().any(|owner| {
                    user_operation.signatures.as_ref().map_or(false, |signatures| {
                        signatures.iter().any(|signature| signature.owner_id == owner.id)
                    })
                })
            })
        })
        .ok_or(AppError::NotFound)?;
    info!(?op_configuration);

    // Get the configurations up to the op_configuration checkpoint.
    let up_to_configurations = configurations
        .clone()
        .into_iter()
        // Filter the configurations that are less than or equal to the op_configuration
        // checkpoint.
        .filter(|configuration| configuration.checkpoint < op_configuration.checkpoint)
        .collect::<Vec<_>>();
    info!(?up_to_configurations);

    // Get the configurations needed to build the wallet configuration - should be uprooted from the
    // query configuration id, to the most recent configuration. Start with the query configuration
    // id, and then get up to the most recent configuration (don't include the most recent)
    let mut uproot_configurations = if let Some(query_configuration_id) = query.configuration_id {
        let query_configuration = configurations
            .clone()
            .into_iter()
            .find(|configuration| configuration.id == query_configuration_id)
            .ok_or(AppError::NotFound)?;
        info!(?query_configuration);

        up_to_configurations
            .into_iter()
            // Filter the configurations that are smaller than or equal to than the query
            // configuration
            .filter(|configuration| configuration.checkpoint <= query_configuration.checkpoint)
            .collect::<Vec<_>>()
    } else {
        vec![]
    };

    // Order the uproot configurations by checkpoint in descending order.
    uproot_configurations.sort_by(|a, b| b.checkpoint.cmp(&a.checkpoint));
    info!(?uproot_configurations);

    let mut owners = op_configuration.owners.ok_or(AppError::NotFound)?;
    owners.sort_by(|a, b| a.index.cmp(&b.index));
    info!(?owners);

    // Map the signatures into type from the user_operation
    let owners: Vec<Owner> = owners.into_iter().map(Owner::from).collect();

    // Convert the owners to SignerNode.
    let owner_nodes: Result<Vec<SignerNode>> = owners
        .iter()
        .map(|owner| {
            Ok(SignerNode {
                signer: Some(Signer {
                    weight: Some(owner.weight.try_into()?),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: owner.address.parse()?,
                    }),
                }),
                left: None,
                right: None,
            })
        })
        .collect();

    // Build the node tree.
    let mut tree = rooted_node_builder(owner_nodes?)?;
    info!(?tree);

    // Conver the signatures to SignerNode.
    let signer_nodes: Result<Vec<SignerNode>> = signatures
        .iter()
        .map(|sig| {
            // Filter the owner with the same id from `owners`
            let owner = owners
                .iter()
                .find(|&owner| owner.id == sig.owner_id)
                .ok_or(eyre!("Owner not found"))?;

            let mut signature_slice = [0; ECDSA_SIGNATURE_LENGTH];
            let bytes = sig.signature.hex_to_bytes()?;
            signature_slice.copy_from_slice(&bytes[0..bytes.len() - 1]);
            let signature_type = match bytes.last() {
                Some(&0x1) => {
                    lightdotso_sequence::types::ECDSASignatureType::ECDSASignatureTypeEIP712
                }
                _ => lightdotso_sequence::types::ECDSASignatureType::ECDSASignatureTypeEthSign,
            };

            Ok(SignerNode {
                signer: Some(Signer {
                    weight: Some(owner.weight.try_into()?),
                    leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                        address: owner.address.parse()?,
                        signature: signature_slice.try_into()?,
                        signature_type,
                    }),
                }),
                left: None,
                right: None,
            })
        })
        .collect();
    tree.replace_node(signer_nodes?);
    info!(?tree);

    // If the uproot configurations are not empty, then we need to uproot the wallet configuration.
    // For each uproot configuration, fetch the owners, and convert them to SignerNode. Then, append
    // to the recovered_configs vector.
    let recovered_configs = uproot_configurations
        .into_iter()
        .map(|recovered_configuration| {
            let mut recovered_config_owners = recovered_configuration
                .owners
                .ok_or(AppError::NotFound)
                .map_err(|_err| eyre!("Error fetching recovered configuration owners"))?;
            recovered_config_owners.sort_by(|a, b| a.index.cmp(&b.index));
            info!(?recovered_config_owners);

            // Map the signatures into type from the user_operation
            let recovered_config_owners: Vec<Owner> =
                recovered_config_owners.into_iter().map(Owner::from).collect();

            // Convert the owners to SignerNode.
            let owner_nodes: Result<Vec<SignerNode>> = recovered_config_owners
                .iter()
                .map(|owner| {
                    Ok(SignerNode {
                        signer: Some(Signer {
                            weight: Some(owner.weight.try_into()?),
                            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                address: owner.address.parse()?,
                            }),
                        }),
                        left: None,
                        right: None,
                    })
                })
                .collect();
            let owner_nodes = owner_nodes?;

            // Build the node tree.
            let mut tree = rooted_node_builder(owner_nodes)?;
            info!(?tree);

            // Get the configuration signatures from the matching recovered configuration.
            let upgrade_signatures = recovered_configuration
                .configuration_operation_signatures
                .ok_or(AppError::NotFound)
                .map_err(|_err| eyre!("Error fetching recovered configuration signatures"))?;

            // If the upgrade signatures is empty, return an error.
            if upgrade_signatures.is_empty() {
                return Err(eyre!("Upgrade signatures are empty"));
            }

            // Conver the signatures to SignerNode.
            let signer_nodes: Result<Vec<SignerNode>> = upgrade_signatures
                .iter()
                .map(|sig| {
                    // Filter the owner with the same id from `owners`
                    let owner = recovered_config_owners
                        .iter()
                        .find(|&owner| owner.id == sig.clone().owner_id)
                        .ok_or(eyre!("Owner not found"))?;

                    let mut signature_slice = [0; ECDSA_SIGNATURE_LENGTH];
                    let bytes = &sig.signature;
                    signature_slice.copy_from_slice(&bytes[0..bytes.len() - 1]);
                    let signature_type = match bytes.last() {
                        Some(&0x1) => {
                            lightdotso_sequence::types::ECDSASignatureType::ECDSASignatureTypeEIP712
                        }
                        _ => lightdotso_sequence::types::ECDSASignatureType::ECDSASignatureTypeEthSign,
                    };

                    Ok(SignerNode {
                        signer: Some(Signer {
                            weight: Some(owner.weight.try_into()?),
                            leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                                address: owner.address.parse()?,
                                signature: signature_slice.try_into()?,
                                signature_type,
                            }),
                        }),
                        left: None,
                        right: None,
                    })
                })
                .collect();

            tree.replace_node(signer_nodes?);
            info!(?tree);

            let wallet_config = WalletConfig {
                checkpoint: recovered_configuration.checkpoint as u32,
                threshold: recovered_configuration.threshold as u16,
                // Weight is not used in the signature.
                weight: 0,
                image_hash: recovered_configuration.image_hash.hex_to_bytes32()?.into(),
                tree,
                // All recovered configurations are in chain agnostic mode.
                signature_type: 2,
                // Internal fields are not used in the signature.
                internal_root: None,
                internal_recovered_configs: None,
            };

            Ok(wallet_config)
        })
        .collect::<Result<Vec<WalletConfig>>>()?;
    info!(?recovered_configs);

    let wallet_config = WalletConfig {
        checkpoint: op_configuration.checkpoint as u32,
        threshold: op_configuration.threshold as u16,
        // Weight is not used in the signature.
        weight: 0,
        image_hash: op_configuration.image_hash.hex_to_bytes32()?.into(),
        tree,
        // The default signature type is chain dependent.
        signature_type: if user_operation.clone().user_operation_merkle_proofs.unwrap().is_empty() {
            // Chain dependent if the user operation merkle proofs is empty.
            1
        } else {
            // Chain agnostic if the user operation merkle proofs is not empty.
            2
        },
        // Internal fields are not used in the signature.
        internal_root: None,
        internal_recovered_configs: if recovered_configs.is_empty() {
            None
        } else {
            Some(recovered_configs)
        },
    };
    info!(?wallet_config);

    // Check if the configuration is valid.
    let is_valid = wallet_config.is_wallet_valid();
    info!(?is_valid);

    // If the configuration is not valid, return a 400.
    if !is_valid {
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Get the encoded user operation.
    let sig = if wallet_config.internal_recovered_configs.is_none() {
        wallet_config.encode()?.to_hex_string()
    } else {
        wallet_config.encode_chained_wallet()?.to_hex_string()
    };
    info!(?sig);

    // If a merkle proof is not empty, then the concatenated merkle proof is returned.
    if !user_operation.clone().user_operation_merkle_proofs.unwrap().is_empty() {
        // Get the merkle proof from the user operation.
        let merkle_proof = user_operation
            .clone()
            .user_operation_merkle_proofs
            .unwrap()
            .iter()
            .map(|proof| parse_hex_to_bytes32(&proof.proof))
            .collect::<Result<Vec<[u8; 32]>>>()?;
        info!(?merkle_proof);

        // Get the merkle root from the user operation.
        let merkle_root = parse_hex_to_bytes32(
            &user_operation
                .clone()
                .user_operation_merkle_proofs
                .unwrap()
                .first()
                .unwrap()
                .user_operation_merkle_root
                .clone(),
        )?;
        info!(?merkle_root);

        // Decode the signature.
        let decoded_sig = hex::decode(&sig[2..])?;
        info!(?decoded_sig);

        return Ok(Json::from(format!(
            "0x{}",
            hex::encode(render_merkle(merkle_root, merkle_proof, decoded_sig)?)
        )));
    }

    Ok(Json::from(sig))
}
