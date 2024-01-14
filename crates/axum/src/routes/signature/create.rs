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

use super::types::Signature;
use crate::{
    error::RouteError, result::AppJsonResult, routes::signature::error::SignatureError,
    state::AppState,
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
    owner, user_operation, ActivityEntity, ActivityOperation, SignatureProcedure,
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
    /// The hash of the user operation.
    pub user_operation_hash: String,
    /// The procedure to create(default: OnChain)
    #[param(inline)]
    pub procedure: Option<PostQueryProcedure>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub enum PostQueryProcedure {
    Offchain,
    Onchain,
    Erc1271,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

/// Signature operation post request params
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct SignaturePostRequestParams {
    /// The result of the signature.
    pub signature: SignaturePostRequestSignatureParams,
}

/// Signature operation
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct SignaturePostRequestSignatureParams {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature of the user operation in hex.
    pub signature: String,
    /// The type of the signature.
    pub signature_type: i32,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a signature
#[utoipa::path(
        post,
        path = "/signature/create",
        params(
            PostQuery
        ),
        request_body = SignaturePostRequestParams,
        responses(
            (status = 200, description = "Signature created successfully", body = Signature),
            (status = 400, description = "Invalid Configuration", body = SignatureError),
            (status = 409, description = "Signature already exists", body = SignatureError),
            (status = 500, description = "Signature internal error", body = SignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_signature_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<SignaturePostRequestParams>,
) -> AppJsonResult<Signature> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the procedure from the post query.
    let post_procedure = query.procedure.unwrap_or(PostQueryProcedure::Onchain);

    // Match the procedure to the signature procedure.
    let procedure = match post_procedure {
        PostQueryProcedure::Offchain => SignatureProcedure::OffChain,
        PostQueryProcedure::Onchain => SignatureProcedure::OnChain,
        PostQueryProcedure::Erc1271 => SignatureProcedure::Erc1271,
    };

    // Get the chain id from the post query.
    let user_operation_hash = query.user_operation_hash;

    // Get the signature from the post body.
    let sig = params.signature;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the signature the database.
    let signature = state
        .client
        .signature()
        .create(
            sig.signature.hex_to_bytes()?,
            sig.signature_type,
            procedure,
            owner::id::equals(sig.owner_id),
            user_operation::hash::equals(user_operation_hash.clone()),
            vec![],
        )
        .exec()
        .await?;
    info!(?signature);

    // Get the user operation from the database.
    let user_operation = state
        .client
        .user_operation()
        .find_unique(user_operation::hash::equals(user_operation_hash))
        .with(user_operation::wallet::fetch())
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let user_operation = user_operation.ok_or(RouteError::SignatureError(
        SignatureError::NotFound("User operation not found".to_string()),
    ))?;

    // Get the wallet from the database.
    let wallet = user_operation.clone().wallet.ok_or(RouteError::SignatureError(
        SignatureError::NotFound("Wallet not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Signature,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&signature)?,
            params: CustomParams {
                signature_id: Some(signature.id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let signature: Signature = signature.into();

    Ok(Json::from(signature))
}
