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

use super::types::Transaction;
use crate::{
    error::RouteError, result::AppJsonResult, routes::transaction::error::TransactionError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::transaction;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The transaction hash.
    pub transaction_hash: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a transaction
#[utoipa::path(
        get,
        path = "/transaction/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Transaction returned successfully", body = Transaction),
            (status = 404, description = "Transaction not found", body = TransactionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_transaction_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Transaction> {
    // Get the get query.
    let Query(query) = get;

    info!("Get transaction for address: {:?}", query);

    // Get the transactions from the database.
    let transaction = client
        .client
        .transaction()
        .find_unique(transaction::hash::equals(query.transaction_hash))
        .exec()
        .await?;

    // If the transaction is not found, return a 404.
    let transaction = transaction.ok_or(RouteError::TransactionError(
        TransactionError::NotFound("Transaction not found".to_string()),
    ))?;

    // Change the transaction to the format that the API expects.
    let transaction: Transaction = transaction.into();

    Ok(Json::from(transaction))
}
