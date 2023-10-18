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

use super::signature::Signature;
use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
    traits::HexToBytes,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::hex};
use eyre::Result;
use lightdotso_prisma::{configuration, owner, signature, user_operation, wallet};
use lightdotso_solutions::{signature::recover_ecdsa_signature, utils::render_subdigest};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    // The user operation hash to get.
    pub user_operation_hash: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first user operation to return.
    pub offset: Option<i64>,
    // The maximum number of user operations to return.
    pub limit: Option<i64>,
    // The sender address to filter by.
    pub address: Option<String>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The chain id to create the user operation for.
    pub chain_id: i64,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct PostRequestParams {
    // The user operation to create.
    pub user_operation: UserOperation,
    // The hash of the user operation.
    pub user_operation_hash: String,
    // The signature of the user operation.
    pub signature: Signature,
}

/// User operation operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum UserOperationError {
    // User operation query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// User operation not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperation {
    hash: String,
    sender: String,
    nonce: i64,
    init_code: String,
    call_data: String,
    call_gas_limit: i64,
    verification_gas_limit: i64,
    pre_verification_gas: i64,
    max_fee_per_gas: i64,
    max_priority_fee_per_gas: i64,
    paymaster_and_data: String,
}

// Implement From<user_operation::Data> for User operation.
impl From<user_operation::Data> for UserOperation {
    fn from(user_operation: user_operation::Data) -> Self {
        Self {
            hash: user_operation.hash,
            sender: user_operation.sender,
            nonce: user_operation.nonce,
            init_code: format!("0x{}", hex::encode(user_operation.init_code)),
            call_data: format!("0x{}", hex::encode(user_operation.call_data)),
            call_gas_limit: user_operation.call_gas_limit,
            verification_gas_limit: user_operation.verification_gas_limit,
            pre_verification_gas: user_operation.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas,
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
            paymaster_and_data: format!("0x{}", hex::encode(user_operation.paymaster_and_data)),
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/user_operation/get", get(v1_user_operation_get_handler))
        .route("/user_operation/list", get(v1_user_operation_list_handler))
}

/// Get a user operation
#[utoipa::path(
        get,
        path = "/user_operation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User Operation returned successfully", body = UserOperation),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperation> {
    // Get the get query.
    let Query(query) = get;

    // Get the user operations from the database.
    let user_operation = client
        .client
        .unwrap()
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(AppError::NotFound)?;

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

/// Returns a list of user operations.
#[utoipa::path(
        get,
        path = "/user_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User Operations returned successfully", body = [UserOperation]),
            (status = 500, description = "User Operation bad request", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<UserOperation>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    let query = match pagination.address {
        Some(owner) => vec![user_operation::sender::equals(owner)],
        None => vec![],
    };

    // Get the user operations from the database.
    let user_operations = client
        .client
        .unwrap()
        .user_operation()
        .find_many(query)
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .order_by(user_operation::nonce::order(prisma_client_rust::Direction::Desc))
        .exec()
        .await?;

    // Change the user operations to the format that the API expects.
    let user_operations: Vec<UserOperation> =
        user_operations.into_iter().map(UserOperation::from).collect();

    Ok(Json::from(user_operations))
}

/// Create a user operation
#[utoipa::path(
        post,
        path = "/user_operation/create",
        params(
            PostQuery
        ),
        request_body = PostRequestParams,
        responses(
            (status = 200, description = "User Operation created successfully", body = UserOperation),
            (status = 400, description = "Invalid Configuration", body = UserOperationError),
            (status = 409, description = "User Operation already exists", body = UserOperationError),
            (status = 500, description = "User Operation internal error", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<PostRequestParams>,
) -> AppJsonResult<UserOperation> {
    // Get the post query.
    let Query(post) = post;

    // Get the chain id from the post query.
    let chain_id = post.chain_id;

    let user_operation = params.user_operation;
    let user_operation_hash = params.user_operation_hash;
    let sig = params.signature;

    // Parse the user operation address.
    let sender_address: H160 = user_operation.sender.parse()?;

    // Get the wallet from the database.
    let wallet = client
        .clone()
        .client
        .unwrap()
        .wallet()
        .find_unique(wallet::address::equals(user_operation.clone().sender))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // Get the current configuration for the wallet.
    let configuration = client
        .clone()
        .client
        .unwrap()
        .configuration()
        .find_first(vec![configuration::address::equals(user_operation.clone().sender)])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .with(configuration::owners::fetch(vec![]))
        .exec()
        .await?;

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // If the owners are not found, return a 404.
    let owners = configuration.owners.ok_or(AppError::NotFound)?;

    // Check that the signature sender is one of the owners.
    if !owners.iter().any(|owner| owner.id == sig.owner_id) {
        return Err(AppError::BadRequest);
    }

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;
    let digest_chain_id = match sig.signature_type {
        0 => chain_id,
        1 => chain_id,
        2 => 0,
        _ => return Err(AppError::BadRequest),
    };
    let subdigest = render_subdigest(
        digest_chain_id as u64,
        sender_address,
        user_operation_hash.hex_to_bytes32()?,
    );
    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address != sender_address {
        return Err(AppError::BadRequest);
    }

    // Create the user operation in the database w/ the sig.
    let user_operation: Result<lightdotso_prisma::user_operation::Data> = client
        .client
        .unwrap()
        ._transaction()
        .run(|client| async move {
            let signature = client
                .signature()
                .create(
                    sig.signature.hex_to_bytes()?,
                    sig.signature_type,
                    owner::id::equals(sig.owner_id),
                    user_operation::hash::equals(user_operation_hash),
                    vec![],
                )
                .exec()
                .await?;
            info!(?signature);

            let user_operation = client
                .user_operation()
                .create(
                    user_operation.hash,
                    user_operation.sender,
                    user_operation.nonce,
                    user_operation.init_code.hex_to_bytes()?,
                    user_operation.call_data.hex_to_bytes()?,
                    user_operation.call_gas_limit,
                    user_operation.verification_gas_limit,
                    user_operation.pre_verification_gas,
                    user_operation.max_fee_per_gas,
                    user_operation.max_priority_fee_per_gas,
                    user_operation.paymaster_and_data.hex_to_bytes()?,
                    chain_id,
                    wallet::address::equals(wallet.address),
                    vec![user_operation::signatures::connect(vec![signature::id::equals(sig.id)])],
                )
                .exec()
                .await?;
            info!(?user_operation);

            Ok(user_operation)
        })
        .await;

    // If the user_operation is not created, return a 500.
    let user_operation = user_operation.map_err(|_| AppError::InternalError)?;
    info!(?user_operation);

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}
