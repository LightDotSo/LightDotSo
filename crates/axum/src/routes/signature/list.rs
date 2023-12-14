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
use lightdotso_prisma::signature;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first signature to return.
    pub offset: Option<i64>,
    /// The maximum number of signatures to return.
    pub limit: Option<i64>,
    /// The user operation hash to filter by.
    pub user_operation_hash: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_signature_list_handler(
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
