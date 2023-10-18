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
    state::AppState,
    traits::HexToBytes,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::utils::hex;
use lightdotso_prisma::{owner, signature, user_operation};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub user_operation_hash: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first signature to return.
    pub offset: Option<i64>,
    // The maximum number of signatures to return.
    pub limit: Option<i64>,
    // The user operation hash to filter by.
    pub user_operation_hash: Option<String>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The hash of the user operation.
    pub user_operation_hash: String,
}

/// Signature operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum SignatureError {
    // Signature query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Signature not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Signature {
    // The id of the signature.
    pub id: String,
    // The signature of the user operation in hex.
    pub signature: String,
    // The type of the signature.
    pub signature_type: i32,
    // The owner id of the signature.
    pub owner_id: String,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct PostRequestParams {
    /// The result of the signature.
    pub signature: Signature,
}

// Implement From<signature::Data> for Signature.
impl From<signature::Data> for Signature {
    fn from(signature: signature::Data) -> Self {
        Self {
            id: signature.id.to_string(),
            signature: format!("0x{}", hex::encode(signature.signature)),
            signature_type: signature.signature_type,
            owner_id: signature.owner_id.to_string(),
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/signature/get", get(v1_signature_get_handler))
        .route("/signature/list", get(v1_signature_list_handler))
}

/// Get a signature
#[utoipa::path(
        get,
        path = "/signature/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Signature returned successfully", body = Signature),
            (status = 404, description = "Signature not found", body = SignatureError),
        )
    )]
#[autometrics]
async fn v1_signature_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Signature> {
    // Get the get query.
    let Query(query) = get;

    info!("Get signature for address: {:?}", query);

    let user_operation_hash = query.user_operation_hash;

    // Get the signatures from the database.
    let signature = client
        .client
        .unwrap()
        .signature()
        .find_unique(signature::user_operation_hash::equals(user_operation_hash))
        .with(signature::owner::fetch())
        .exec()
        .await?;

    // If the signature is not found, return a 404.
    let signature = signature.ok_or(AppError::NotFound)?;

    // Change the signature to the format that the API expects.
    let signature: Signature = signature.into();

    Ok(Json::from(signature))
}

/// Returns a list of signatures.
#[utoipa::path(
        get,
        path = "/signature/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Signatures returned successfully", body = [Signature]),
            (status = 500, description = "Signature bad request", body = SignatureError),
        )
    )]
#[autometrics]
async fn v1_signature_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Signature>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    let query = match pagination.user_operation_hash {
        Some(user_operation_hash) => {
            vec![signature::user_operation_hash::equals(user_operation_hash)]
        }
        None => vec![],
    };

    // Get the signatures from the database.
    let signatures = client
        .client
        .unwrap()
        .signature()
        .find_many(query)
        .order_by(signature::created_at::order(Direction::Desc))
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the signatures to the format that the API expects.
    let signatures: Vec<Signature> = signatures.into_iter().map(Signature::from).collect();

    Ok(Json::from(signatures))
}

/// Create a signature
#[utoipa::path(
        post,
        path = "/signature/create",
        params(
            PostQuery
        ),
        request_body = PostRequestParams,
        responses(
            (status = 200, description = "Signature created successfully", body = UserOperation),
            (status = 400, description = "Invalid Configuration", body = UserOperationError),
            (status = 409, description = "Signature already exists", body = UserOperationError),
            (status = 500, description = "Signature internal error", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_signature_create_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<PostRequestParams>,
) -> AppJsonResult<Signature> {
    // Get the post query.
    let Query(post) = post;

    // Get the chain id from the post query.
    let user_operation_hash = post.user_operation_hash;

    // Get the signature from the post body.
    let sig = params.signature;

    // Create the signature the database.
    let signature = client
        .client
        .unwrap()
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

    // Change the signatures to the format that the API expects.
    let signature: Signature = signature.into();

    Ok(Json::from(signature))
}
