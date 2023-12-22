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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_common::traits::HexToBytes;
use lightdotso_prisma::{owner, user_operation, SignatureProcedure};
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

/// Signature operation errors
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct SignaturePostRequestParams {
    /// The result of the signature.
    pub signature: Signature,
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
pub(crate) async fn v1_signature_post_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<SignaturePostRequestParams>,
) -> AppJsonResult<Signature> {
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

    // Create the signature the database.
    let signature = state
        .client
        .signature()
        .create(
            sig.signature.hex_to_bytes()?,
            sig.signature_type,
            procedure,
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
