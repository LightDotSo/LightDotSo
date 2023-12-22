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
    result::{AppError, AppJsonResult},
    routes::user_operation::types::{UserOperationOwner, UserOperationSignature},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::{eyre, Result};
use lightdotso_common::traits::{HexToBytes, VecU8ToHex};
use lightdotso_prisma::{
    configuration,
    // log,
    owner,
    signature,
    user_operation,
    wallet,
};
use lightdotso_solutions::{
    builder::rooted_node_builder,
    config::WalletConfig,
    types::{
        AddressSignatureLeaf, ECDSASignatureLeaf, SignatureLeaf, Signer, SignerNode,
        ECDSA_SIGNATURE_LENGTH,
    },
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
    /// The type of signature to get for.
    pub signature_type: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Check a user operation for its validity and return the computed signature if valid.
#[utoipa::path(
        get,
        path = "/user_operation/signature",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User Operation signature returned successfully", body = String),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_signature_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<String> {
    // Get the get query.
    let Query(query) = get_query;
    let user_operation_hash = query.user_operation_hash.clone();
    let signature_type = query.signature_type.unwrap_or(1);

    // Get the user operations from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .with(user_operation::signatures::fetch(vec![signature::user_operation_hash::equals(
            user_operation_hash,
        )]))
        .exec()
        .await?;
    info!(?user_operation);

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(AppError::NotFound)?;

    // Map the signatures into type from the user_operation
    let signatures = user_operation.clone().signatures.map_or(Vec::new(), |signature| {
        signature.into_iter().map(UserOperationSignature::from).collect()
    });
    info!("{}", signatures.len());

    // Get the wallet from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(user_operation.clone().sender))
        .with(
            wallet::configurations::fetch(vec![configuration::address::equals(
                user_operation.clone().sender,
            )])
            .with(
                configuration::owners::fetch(vec![]).order_by(owner::weight::order(Direction::Asc)),
            ),
        )
        .exec()
        .await?;
    info!(?wallet);

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // Parse the current wallet configuration.
    // TODO: This should be the configuration with the signature required to upsert the most up to
    // date configuration.
    let configuration = wallet
        .configurations
        .ok_or(AppError::NotFound)?
        .into_iter()
        .max_by_key(|configuration| configuration.checkpoint)
        .ok_or(AppError::NotFound)?;
    info!(?configuration);

    let mut owners = configuration.owners.ok_or(AppError::NotFound)?;
    owners.sort_by(|a, b| a.index.cmp(&b.index));
    info!(?owners);
    // Map the signatures into type from the user_operation
    let owners: Vec<UserOperationOwner> =
        owners.into_iter().map(UserOperationOwner::from).collect();

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
                    lightdotso_solutions::types::ECDSASignatureType::ECDSASignatureTypeEIP712
                }
                _ => lightdotso_solutions::types::ECDSASignatureType::ECDSASignatureTypeEthSign,
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
        checkpoint: configuration.checkpoint as u32,
        threshold: configuration.threshold as u16,
        weight: 0,
        image_hash: configuration.image_hash.hex_to_bytes32()?.into(),
        tree,
        signature_type: signature_type as u8,
        internal_root: None,
    };

    // Check if the configuration is valid.
    let is_valid = wallet_config.is_wallet_valid();
    info!(?is_valid);

    // If the configuration is not valid, return a 400.
    if !is_valid {
        return Err(AppError::BadRequest);
    }

    // Get the encoded user operation.
    let sig = wallet_config.encode()?.to_hex_string();

    Ok(Json::from(sig))
}
