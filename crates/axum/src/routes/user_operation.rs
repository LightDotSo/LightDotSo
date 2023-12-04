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
    error::RouteError,
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::{get, post},
    Json, Router,
};
use ethers_main::{
    types::H160,
    utils::{hex, to_checksum},
};
use eyre::{Report, Result};
use lightdotso_common::{
    traits::{HexToBytes, VecU8ToHex},
    utils::hex_to_bytes,
};
use lightdotso_contracts::{
    constants::{ENTRYPOINT_V060_ADDRESS, MAINNET_CHAIN_IDS},
    // constants::{ENTRYPOINT_V060_ADDRESS, LIGHT_PAYMASTER_ADDRESSES},
    paymaster::decode_paymaster_and_data,
};
use lightdotso_prisma::{
    configuration,
    // log,
    owner,
    paymaster,
    paymaster_operation,
    // receipt,
    signature,
    transaction,
    user_operation,
    wallet,
    SignatureProcedure,
    UserOperationStatus,
};
use lightdotso_solutions::{
    builder::rooted_node_builder,
    config::WalletConfig,
    signature::recover_ecdsa_signature,
    types::{
        AddressSignatureLeaf, ECDSASignatureLeaf, SignatureLeaf, Signer, SignerNode,
        ECDSA_SIGNATURE_LENGTH,
    },
    utils::render_subdigest,
};
use lightdotso_tracing::tracing::{error, info};
use prisma_client_rust::{
    chrono::{DateTime, NaiveDateTime, Utc},
    or, Direction,
};
use rundler_types::UserOperation as RundlerUserOperation;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The user operation hash to get.
    pub user_operation_hash: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct UpdateQuery {
    /// The sender address to filter by.
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct NonceQuery {
    /// The chain id to get the user operation nonce for.
    pub chain_id: i64,
    /// The sender address to filter by.
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first user operation to return.
    pub offset: Option<i64>,
    /// The maximum number of user operations to return.
    pub limit: Option<i64>,
    /// The sender address to filter by.
    pub address: Option<String>,
    /// The status to filter by.
    #[param(inline)]
    pub status: Option<ListQueryStatus>,
    /// The direction to order by.
    /// Default is `asc`.
    #[param(inline)]
    pub order: Option<ListQueryOrder>,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum ListQueryOrder {
    Asc,
    Desc,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum ListQueryStatus {
    Proposed,
    Pending,
    Executed,
    Reverted,
}

// Implement From<owner::Data> for Owner.
impl From<ListQueryStatus> for UserOperationStatus {
    fn from(status: ListQueryStatus) -> Self {
        match status {
            ListQueryStatus::Proposed => UserOperationStatus::Proposed,
            ListQueryStatus::Pending => UserOperationStatus::Pending,
            ListQueryStatus::Executed => UserOperationStatus::Executed,
            ListQueryStatus::Reverted => UserOperationStatus::Reverted,
        }
    }
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The chain id to create the user operation for.
    pub chain_id: i64,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct SignatureQuery {
    // The user operation hash to get.
    pub user_operation_hash: String,
    // The type of signature to get for.
    pub signature_type: Option<i64>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct UserOperationPostRequestParams {
    // The user operation to create.
    pub user_operation: UserOperationCreate,
    // The signature of the user operation.
    pub signature: UserOperationSignature,
}

/// Item to create.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationCreate {
    chain_id: i64,
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

/// Paymaster
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationPaymaster {
    /// The address of the paymaster.
    address: String,
}

/// Owner
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationOwner {
    /// The id of the owner.
    id: String,
    /// The address of the owner.
    address: String,
    /// The weight of the owner.
    weight: i64,
}

/// Signature
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationSignature {
    /// The id of the owner of the signature.
    owner_id: String,
    /// The signature in hex string.
    signature: String,
    /// The signature type
    signature_type: i32,
}

/// Nonce
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationNonce {
    /// The hash of the transaction.
    nonce: i64,
}

/// Transaction
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationTransaction {
    /// The hash of the transaction.
    hash: String,
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

/// User operation operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum UserOperationSuccess {
    /// User operation updated successfully.
    #[schema(example = "Update Success")]
    Updated(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperation {
    chain_id: i64,
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
    status: String,
    paymaster: Option<UserOperationPaymaster>,
    signatures: Vec<UserOperationSignature>,
    transaction: Option<UserOperationTransaction>,
}

impl TryFrom<UserOperationCreate> for RundlerUserOperation {
    type Error = Report;

    fn try_from(op: UserOperationCreate) -> Result<Self> {
        Ok(RundlerUserOperation {
            sender: op.sender.parse()?,
            nonce: op.nonce.into(),
            init_code: hex_to_bytes(&op.init_code)?.into(),
            call_data: hex_to_bytes(&op.call_data)?.into(),
            call_gas_limit: op.call_gas_limit.into(),
            verification_gas_limit: op.verification_gas_limit.into(),
            pre_verification_gas: op.pre_verification_gas.into(),
            max_fee_per_gas: op.max_fee_per_gas.into(),
            max_priority_fee_per_gas: op.max_priority_fee_per_gas.into(),
            paymaster_and_data: hex_to_bytes(&op.paymaster_and_data)?.into(),
            signature: vec![].into(),
        })
    }
}

// Implement From<user_operation::Data> for User operation.
impl From<user_operation::Data> for UserOperation {
    fn from(user_operation: user_operation::Data) -> Self {
        Self {
            chain_id: user_operation.chain_id,
            hash: user_operation.hash,
            sender: user_operation.sender,
            nonce: user_operation.nonce,
            init_code: user_operation.init_code.to_hex_string(),
            call_data: user_operation.call_data.to_hex_string(),
            call_gas_limit: user_operation.call_gas_limit,
            verification_gas_limit: user_operation.verification_gas_limit,
            pre_verification_gas: user_operation.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas,
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
            paymaster_and_data: user_operation.paymaster_and_data.to_hex_string(),
            status: user_operation.status.to_string(),
            paymaster: user_operation
                .paymaster
                .and_then(|paymaster| paymaster.map(|data| UserOperationPaymaster::from(*data))),
            signatures: user_operation.signatures.map_or(Vec::new(), |signature| {
                signature.into_iter().map(UserOperationSignature::from).collect()
            }),
            transaction: user_operation.transaction.and_then(|transaction| {
                transaction.map(|data| UserOperationTransaction::from(*data))
            }),
        }
    }
}

// Implement From<owner::Data> for Owner.
impl From<owner::Data> for UserOperationOwner {
    fn from(owner: owner::Data) -> Self {
        Self { id: owner.id.to_string(), address: owner.address.to_string(), weight: owner.weight }
    }
}

// Implement From<paymaster::Data> for Paymaster.
impl From<paymaster::Data> for UserOperationPaymaster {
    fn from(paymaster: paymaster::Data) -> Self {
        Self { address: paymaster.address }
    }
}

// Implement From<signature::Data> for Owner.
impl From<signature::Data> for UserOperationSignature {
    fn from(signature: signature::Data) -> Self {
        Self {
            owner_id: signature.owner_id.to_string(),
            signature: signature.signature.to_hex_string(),
            signature_type: signature.signature_type,
        }
    }
}

// Implement From<transaction::Data> for Owner.
impl From<transaction::Data> for UserOperationTransaction {
    fn from(transaction: transaction::Data) -> Self {
        Self { hash: transaction.hash }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/user_operation/get", get(v1_user_operation_get_handler))
        .route("/user_operation/update", post(v1_user_operation_update_handler))
        .route("/user_operation/nonce", get(v1_user_operation_nonce_handler))
        .route("/user_operation/list", get(v1_user_operation_list_handler))
        .route("/user_operation/create", post(v1_user_operation_post_handler))
        .route("/user_operation/signature", get(v1_user_operation_signature_handler))
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
    let user_operation_hash = query.user_operation_hash.clone();

    // Get the user operations from the database.
    let user_operation = client
        .client
        .unwrap()
        .user_operation()
        .find_unique(user_operation::hash::equals(query.user_operation_hash))
        .with(user_operation::signatures::fetch(vec![signature::user_operation_hash::equals(
            user_operation_hash,
        )]))
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(RouteError::UserOperationError(
        UserOperationError::NotFound("User operation not found".to_string()),
    ))?;

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

/// Get a user operation
#[utoipa::path(
        post,
        path = "/user_operation/update",
        params(
            UpdateQuery
        ),
        responses(
            (status = 200, description = "User Operation updated successfully", body = UserOperationSuccess),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_update_handler(
    post: Query<UpdateQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperationSuccess> {
    // Get the get query.
    let Query(query) = post;
    // Get the wallet address from the nonce query.
    let address: H160 = query.address.parse()?;

    // Get the user operations from the database.
    let user_operation = client
        .clone()
        .client
        .unwrap()
        .user_operation()
        .find_many(vec![
            user_operation::sender::equals(to_checksum(&address, None)),
            or![
                user_operation::status::equals(UserOperationStatus::Executed),
                user_operation::status::equals(UserOperationStatus::Reverted)
            ],
        ])
        .order_by(user_operation::nonce::order(Direction::Desc))
        .exec()
        .await?;
    info!(?user_operation);

    // Filter the user operations by same chainId
    let mut unique_chain_ids = std::collections::HashSet::new();
    let unique_user_operations: Vec<_> =
        user_operation.into_iter().filter(|op| unique_chain_ids.insert(op.chain_id)).collect();

    // For each user operation w/ update many the matching chainId where nonce is equal to or lower
    // than change the status to Invalid.
    for op in unique_user_operations {
        let _ = client
            .clone()
            .client
            .unwrap()
            .user_operation()
            .update_many(
                vec![
                    user_operation::chain_id::equals(op.chain_id),
                    user_operation::nonce::lte(op.nonce),
                    user_operation::hash::not(op.hash),
                    user_operation::status::equals(UserOperationStatus::Proposed),
                ],
                vec![user_operation::status::set(UserOperationStatus::Invalid)],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(UserOperationSuccess::Updated("Success".to_string())))
}

/// Get a user operation nonce
#[utoipa::path(
        get,
        path = "/user_operation/nonce",
        params(
            NonceQuery
        ),
        responses(
            (status = 200, description = "User Operation nonce returned successfully", body = UserOperationNonce),
            (status = 404, description = "User Operation nonce not found", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_nonce_handler(
    get: Query<NonceQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperationNonce> {
    // Get the get query.
    let Query(query) = get;
    let chain_id = query.chain_id;
    // Get the wallet address from the nonce query.
    let address: H160 = query.address.parse()?;

    // Get the user operations from the database.
    let user_operation = client
        .clone()
        .client
        .unwrap()
        .user_operation()
        .find_first(vec![
            user_operation::chain_id::equals(chain_id),
            user_operation::sender::equals(to_checksum(&address, None)),
            or![
                user_operation::status::equals(UserOperationStatus::Executed),
                user_operation::status::equals(UserOperationStatus::Reverted)
            ],
        ])
        .order_by(user_operation::nonce::order(Direction::Desc))
        .exec()
        .await?;
    info!(?user_operation);

    // If the user operation is not found, return 0 as Ok.
    match user_operation {
        Some(user_operation) => {
            // If the user operation is of nonce 0, query if there is an additional user operation
            // of AccountDeploy
            // if user_operation.nonce == 0 {
            //     info!("Found user operation of nonce 0");

            //     if let Some(hash) = user_operation.transaction_hash {
            //         // Fetch the receipt and logs
            //         let receipt = client
            //             .client
            //             .unwrap()
            //             .receipt()
            //             .find_unique(receipt::transaction_hash::equals(hash))
            //             .with(receipt::logs::fetch(vec![]).with(log::topics::fetch(vec![])))
            //             .exec()
            //             .await?;
            //         info!(?receipt);

            //         if let Some(receipt) = receipt {
            //             info!(?receipt);

            //             // Iterate through the logs and check if the first log is an `Account
            //             // Deployed` event
            //             // Unwrap is safe because `with::Fetch`` has been called
            //             for log in receipt.logs.unwrap() {
            //                 for topic in log.topics.unwrap() {
            //                     // If the data is equal to the hash of the `AccountDeployed`
            // event                     if topic.id ==
            // *"0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d-0" &&
            // log.data.len() == 64 {                       // Parse the topic data as
            // hex string                       // Get the first 64 characters
            //                       let address = H160::from_slice(&log.data[44..64]);
            //                       info!("address: {}", to_checksum(&address, None));

            //                       // Check if the data in the paymaster is one of ours
            //                       if LIGHT_PAYMASTER_ADDRESSES.contains(&address) {
            //                         return Ok(Json::from(UserOperationNonce { nonce: 2 }));
            //                       }
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            Ok(Json::from(UserOperationNonce { nonce: user_operation.nonce + 1 }))
        }
        None => Ok(Json::from(UserOperationNonce { nonce: 0 })),
    }
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
    info!(?pagination);

    // If the address is provided, add it to the query.
    let query = match pagination.address {
        Some(owner) => vec![user_operation::sender::equals(owner)],
        None => vec![],
    };

    // If the status is provided, add it to the query.
    let query = match pagination.status {
        Some(status) => {
            let status = user_operation::status::equals(status.into());
            query.into_iter().chain(vec![status]).collect()
        }
        None => query,
    };

    // Parse the order from the pagination query.
    let order = match pagination.order {
        Some(ListQueryOrder::Asc) => Direction::Asc,
        Some(ListQueryOrder::Desc) => Direction::Desc,
        None => Direction::Asc,
    };

    // Get the user operations from the database.
    let user_operations = client
        .client
        .unwrap()
        .user_operation()
        .find_many(query)
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .order_by(user_operation::nonce::order(order))
        .with(user_operation::signatures::fetch(vec![]))
        .with(user_operation::transaction::fetch())
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
        request_body = UserOperationPostRequestParams,
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
    Json(params): Json<UserOperationPostRequestParams>,
) -> AppJsonResult<UserOperation> {
    // Get the post query.
    let Query(post) = post;

    info!(?post);

    // Get the chain id from the post query.
    let chain_id = post.chain_id;

    let user_operation = params.user_operation.clone();
    let user_operation_hash = params.user_operation.clone().hash;
    let sig = params.signature;

    let rundler_user_operation = RundlerUserOperation::try_from(user_operation.clone())?;
    let rundler_hash = rundler_user_operation.op_hash(*ENTRYPOINT_V060_ADDRESS, chain_id as u64);

    // Assert that the hex hash of rundler_hash is the same as the user_operation_hash (prefix 0x)
    if (format!("0x{}", hex::encode(rundler_hash)) != user_operation_hash) {
        error!(
            "rundler_hash: {}, user_operation_hash: {}",
            hex::encode(rundler_hash),
            user_operation_hash
        );
        return Err(AppError::BadRequest);
    }
    info!("rundler_hash: 0x{}", hex::encode(rundler_hash));

    // Parse the user operation address.
    let sender_address: H160 = user_operation.sender.parse()?;

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;
    let digest_chain_id = match sig.signature_type {
        // Legacy
        0 => chain_id,
        // Dynamic
        1 => chain_id,
        // No chainId
        2 => 0,
        // Chained
        // 3 => 0,
        _ => return Err(AppError::BadRequest),
    };
    let subdigest = render_subdigest(
        digest_chain_id as u64,
        sender_address,
        user_operation_hash.hex_to_bytes32()?,
    );
    info!(?subdigest);

    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;
    info!(?recovered_sig);

    // Get the owner from the database.
    let owner = client
        .clone()
        .client
        .unwrap()
        .owner()
        .find_unique(owner::id::equals(sig.clone().owner_id))
        .exec()
        .await?;
    info!(?owner);

    // If the owner is not found, return a 404.
    let owner = owner.ok_or(AppError::NotFound)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address != owner.address.parse()? {
        error!(
            "recovered_sig.address: {}, owner.address: {}",
            recovered_sig.address, owner.address
        );
        return Err(AppError::BadRequest);
    }

    // Get the wallet from the database.
    let wallet = client
        .clone()
        .client
        .unwrap()
        .wallet()
        .find_unique(wallet::address::equals(user_operation.clone().sender))
        .exec()
        .await?;
    info!(?wallet);

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
    info!(?configuration);

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // If the owners are not found, return a 404.
    let owners = configuration.owners.ok_or(AppError::NotFound)?;
    info!(?owners);

    // Check that the signature sender is one of the owners.
    if !owners.iter().any(|owner| owner.id == sig.owner_id) {
        error!("owners not found sig.owner_id: {}, owners: {:?}", sig.owner_id, owners);
        return Err(AppError::BadRequest);
    }

    // The optional params to connect paymaster to user_operation.
    let mut params =
        vec![user_operation::is_testnet::set(!MAINNET_CHAIN_IDS.contains_key(&(chain_id as u64)))];

    // Parse the paymaster_and_data for the paymaster data if the paymaster is provided.
    if user_operation.paymaster_and_data.len() > 2 {
        let paymaster_data = user_operation.paymaster_and_data.hex_to_bytes()?;
        let (decded_paymaster_address, _, valid_after, _msg) =
            decode_paymaster_and_data(paymaster_data);

        let paymaster = client
            .clone()
            .client
            .unwrap()
            .paymaster()
            .upsert(
                paymaster::address_chain_id(to_checksum(&decded_paymaster_address, None), chain_id),
                paymaster::create(to_checksum(&decded_paymaster_address, None), chain_id, vec![]),
                vec![],
            )
            .exec()
            .await?;
        info!(?paymaster);

        // Add the paymaster to the params.
        params
            .push(user_operation::paymaster::connect(paymaster::id::equals(paymaster.clone().id)));

        // This could potentially not found (not our paymaster), so we should handle it.
        let paymaster_operation = client
            .clone()
            .client
            .unwrap()
            .paymaster_operation()
            .find_unique(paymaster_operation::valid_after_paymaster_id(
                DateTime::<Utc>::from_utc(
                    NaiveDateTime::from_timestamp_opt(valid_after as i64, 0).unwrap(),
                    Utc,
                )
                .into(),
                paymaster.clone().id.clone(),
            ))
            .exec()
            .await;
        info!(?paymaster_operation);

        // Add the paymaster operation to the params.
        if let Ok(Some(op)) = paymaster_operation {
            params.push(user_operation::paymaster_operation::connect(
                paymaster_operation::id::equals(op.id),
            ));
        }
    }

    // Create the user operation in the database w/ the sig.
    let user_operation: Result<lightdotso_prisma::user_operation::Data> = client
        .client
        .unwrap()
        ._transaction()
        .run(|client| async move {
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
                    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789".parse()?,
                    wallet::address::equals(wallet.address),
                    params,
                )
                .exec()
                .await?;
            info!(?user_operation);

            let signature = client
                .signature()
                .create(
                    sig.signature.hex_to_bytes()?,
                    sig.signature_type,
                    SignatureProcedure::OnChain,
                    owner::id::equals(sig.owner_id),
                    user_operation::hash::equals(user_operation_hash),
                    vec![],
                )
                .exec()
                .await?;
            info!(?signature);

            Ok(user_operation)
        })
        .await;
    info!(?user_operation);

    // If the user_operation is not created, return a 500.
    let user_operation = user_operation.map_err(|_| AppError::InternalError)?;
    info!(?user_operation);

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

/// Check a user operation for its validity and return the computed signature if valid.
#[utoipa::path(
        get,
        path = "/user_operation/signature",
        params(
            SignatureQuery
        ),
        responses(
            (status = 200, description = "User Operation signature returned successfully", body = String),
            (status = 404, description = "User Operation not found", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_user_operation_signature_handler(
    signature: Query<SignatureQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<String> {
    // Get the get query.
    let Query(query) = signature;
    let user_operation_hash = query.user_operation_hash.clone();
    let signature_type = query.signature_type.unwrap_or(1);

    // Get the user operations from the database.
    let user_operation = client
        .clone()
        .client
        .unwrap()
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
    let wallet = client
        .client
        .unwrap()
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
                .ok_or(eyre::eyre!("Owner not found"))?;

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

// Create tests for rundler user operation
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion() {
        let user_op = UserOperationCreate {
            chain_id: 1,
            hash: "0x9e1a7c8".to_string(),
            sender: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".to_string(),
            nonce: 1,
            init_code: "0x1234".to_string(),
            call_data: "0x5678".to_string(),
            call_gas_limit: 1,
            verification_gas_limit: 1,
            pre_verification_gas: 1,
            max_fee_per_gas: 1,
            max_priority_fee_per_gas: 1,
            paymaster_and_data: "0x1234".to_string(),
        };

        let result = RundlerUserOperation::try_from(user_op);

        assert!(result.is_ok());
    }
}
