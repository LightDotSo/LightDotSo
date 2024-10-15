// Copyright 2023-2024 LightDotSo.
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

#[allow(unused_imports)]
use super::{error::TransactionError, types::Transaction};
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    asset_change, interpretation, interpretation_action,
    transaction::{self, WhereParam},
    wallet,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
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
#[serde(rename_all = "snake_case")]
pub(crate) struct TransactionListCount {
    /// The count of the list of user operations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of transactions
///
/// Returns a list of transactions with optional filtering.
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
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Transaction>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_transaction_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation action params.
    let mut interpretation_action_params =
        vec![or![interpretation_action::address::equals("".to_string())]];
    if let Some(addr) = &query.address {
        interpretation_action_params
            .push(or![interpretation_action::address::equals(addr.clone())]);
    }

    // Get the transactions from the database.
    let transactions = state
        .client
        .transaction()
        .find_many(query_params)
        .order_by(transaction::timestamp::order(Direction::Desc))
        .with(
            transaction::interpretation::fetch()
                .with(interpretation::actions::fetch(interpretation_action_params))
                .with(
                    interpretation::asset_changes::fetch(vec![])
                        .with(asset_change::interpretation_action::fetch())
                        .with(asset_change::token::fetch()),
                ),
        )
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;
    info!(?transactions);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the transactions to the format that the API expects.
    let transactions: Vec<Transaction> = transactions.into_iter().map(Transaction::from).collect();

    Ok(Json::from(transactions))
}

/// Returns a count of list of transactions
///
/// Returns a count of transactions with optional filtering.
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
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<TransactionListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_transaction_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the transactions from the database.
    let count = state.client.transaction().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(TransactionListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for transactions.
fn construct_transaction_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(addr) => {
            vec![or![
                transaction::wallets::some(vec![wallet::address::equals(addr.clone())]),
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
