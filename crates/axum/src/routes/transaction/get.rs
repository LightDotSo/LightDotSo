// Copyright 2023-2024 Light
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
use lightdotso_prisma::{asset_change, interpretation, transaction};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
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
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Transaction> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get transaction for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the transactions from the database.
    let transaction = state
        .client
        .transaction()
        .find_unique(transaction::hash::equals(query.transaction_hash))
        .with(
            transaction::interpretation::fetch().with(interpretation::actions::fetch(vec![])).with(
                interpretation::asset_changes::fetch(vec![])
                    .with(asset_change::interpretation_action::fetch())
                    .with(asset_change::token::fetch()),
            ),
        )
        .exec()
        .await?;
    info!(?transaction);

    // If the transaction is not found, return a 404.
    let transaction = transaction.ok_or(RouteError::TransactionError(
        TransactionError::NotFound("Transaction not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the transaction to the format that the API expects.
    let transaction: Transaction = transaction.into();

    Ok(Json::from(transaction))
}
