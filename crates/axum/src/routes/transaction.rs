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
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use lightdotso_prisma::transaction;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub transaction_hash: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first transaction to return.
    pub offset: Option<i64>,
    // The maximum number of transactions to return.
    pub limit: Option<i64>,
    // The sender address to filter by.
    pub address: Option<String>,
}

/// Transaction operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum TransactionError {
    // Transaction query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Transaction not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Transaction {
    /// The chain id of the transaction.
    chain_id: i64,
    /// The hash of the transaction.
    hash: String,
    /// The timestamp of the transaction.
    timestamp: String,
}

// Implement From<transaction::Data> for Transaction.
impl From<transaction::Data> for Transaction {
    fn from(transaction: transaction::Data) -> Self {
        Self {
            chain_id: transaction.chain_id,
            hash: transaction.hash,
            timestamp: transaction.timestamp.to_rfc3339(),
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/transaction/get", get(v1_transaction_get_handler))
        .route("/transaction/list", get(v1_transaction_list_handler))
}

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
async fn v1_transaction_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Transaction> {
    // Get the get query.
    let Query(query) = get;

    info!("Get transaction for address: {:?}", query);

    // Get the transactions from the database.
    let transaction = client
        .client
        .unwrap()
        .transaction()
        .find_unique(transaction::hash::equals(query.transaction_hash))
        .exec()
        .await?;

    // If the transaction is not found, return a 404.
    let transaction = transaction.ok_or(AppError::NotFound)?;

    // Change the transaction to the format that the API expects.
    let transaction: Transaction = transaction.into();

    Ok(Json::from(transaction))
}

/// Returns a list of transactions.
#[utoipa::path(
        get,
        path = "/transaction/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Transactions returned successfully", body = [Transaction]),
            (status = 500, description = "Transaction bad request", body = TransactionError),
        )
    )]
#[autometrics]
async fn v1_transaction_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Transaction>> {
    // Get the pagination query.
    let Query(pagination) = pagination;
    info!(?pagination);

    // If the address is provided, add it to the query.
    let query = match pagination.address {
        Some(addr) => {
            vec![or![
                transaction::wallet_address::equals(Some(addr.clone())),
                transaction::from::equals(addr.clone()),
                transaction::to::equals(Some(addr.clone()))
            ]]
        }
        None => vec![],
    };

    // Get the transactions from the database.
    let transactions = client
        .client
        .unwrap()
        .transaction()
        .find_many(query)
        .order_by(transaction::timestamp::order(Direction::Desc))
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the transactions to the format that the API expects.
    let transactions: Vec<Transaction> = transactions.into_iter().map(Transaction::from).collect();

    Ok(Json::from(transactions))
}
