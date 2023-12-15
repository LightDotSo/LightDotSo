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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::transaction::{self, WhereParam};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first transaction to return.
    pub offset: Option<i64>,
    /// The maximum number of transactions to return.
    pub limit: Option<i64>,
    /// The sender address to filter by.
    pub address: Option<String>,
    /// The flag to indicate if the transaction is a testnet transaction.
    pub is_testnet: Option<bool>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of user operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct TransactionListCount {
    /// The count of the list of user operations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_transaction_list_handler(
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Transaction>> {
    // Get the  query.
    let Query(list_query) = query;
    info!(?list_query);

    // If the address is provided, add it to the query.
    let query = construct_transaction_list_query(&list_query);

    // Get the transactions from the database.
    let transactions = client
        .client
        .transaction()
        .find_many(query)
        .order_by(transaction::timestamp::order(Direction::Desc))
        .skip(list_query.offset.unwrap_or(0))
        .take(list_query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the transactions to the format that the API expects.
    let transactions: Vec<Transaction> = transactions.into_iter().map(Transaction::from).collect();

    Ok(Json::from(transactions))
}

/// Returns a count of list of transactions.
#[utoipa::path(
        get,
        path = "/transaction/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Transactions returned successfully", body = TransactionListCount),
            (status = 500, description = "Transaction bad request", body = TransactionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_transaction_list_count_handler(
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<TransactionListCount> {
    // Get the  query.
    let Query(list_query) = query;
    info!(?list_query);

    // If the address is provided, add it to the query.
    let query = construct_transaction_list_query(&list_query);

    // Get the transactions from the database.
    let count = client.client.transaction().count(query).exec().await?;

    Ok(Json::from(TransactionListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for transactions.
fn construct_transaction_list_query(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(addr) => {
            vec![or![
                transaction::wallet_address::equals(Some(addr.clone())),
                transaction::from::equals(addr.clone()),
                transaction::to::equals(Some(addr.clone()))
            ]]
        }
        None => vec![],
    };

    match query.is_testnet {
        Some(false) | None => query_exp.push(transaction::is_testnet::equals(false)),
        _ => (),
    }

    query_exp
}
