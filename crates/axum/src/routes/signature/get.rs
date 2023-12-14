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
use lightdotso_prisma::signature;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub user_operation_hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_signature_get_handler(
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
        .signature()
        .find_unique(signature::user_operation_hash::equals(user_operation_hash))
        .with(signature::owner::fetch())
        .exec()
        .await?;

    // If the signature is not found, return a 404.
    let signature = signature.ok_or(RouteError::SignatureError(SignatureError::NotFound(
        "Signature not found".to_string(),
    )))?;

    // Change the signature to the format that the API expects.
    let signature: Signature = signature.into();

    Ok(Json::from(signature))
}
