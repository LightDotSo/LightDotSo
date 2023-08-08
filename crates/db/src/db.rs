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

use axum::extract::Json;

use crate::error::DbError;
use lightdotso_prisma::{log, receipt, transaction, user, wallet, PrismaClient};
use prisma_client_rust::{
    chrono::{DateTime, FixedOffset, NaiveDateTime},
    NewClientError,
};
use std::sync::Arc;

type Database = Arc<PrismaClient>;
type AppResult<T> = Result<T, DbError>;
type AppJsonResult<T> = AppResult<Json<T>>;

/// Create a new Prisma client.
pub async fn create_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;

    client
}

/// Find a user by id.
pub async fn find_user(db: Database) -> Vec<user::Data> {
    let users: Vec<user::Data> =
        db.user().find_many(vec![user::id::equals("Id".to_string())]).exec().await.unwrap();

    users
}

/// Get a user by id.
/// Taken from: https://github.com/Brendonovich/prisma-client-rust/blob/124e8216a9d093e9ae1feb8b9b84614bc3579f18/examples/axum-rest/src/routes.rs
pub async fn handle_user_get(db: Database) -> AppJsonResult<Vec<user::Data>> {
    let users = db.user().find_many(vec![]).with(user::sessions::fetch(vec![])).exec().await?;

    Ok(Json::from(users))
}

/// Create a new user.
pub async fn create_wallet(
    db: Database,
    log: ethers::types::Log,
    chain_id: String,
    testnet: Option<bool>,
) -> AppJsonResult<wallet::Data> {
    let wallet = db
        .wallet()
        .create(
            log.address.to_string(),
            chain_id,
            log.data.to_string(),
            vec![wallet::testnet::set(testnet.unwrap_or(false))],
        )
        .exec()
        .await?;

    Ok(Json::from(wallet))
}

/// Taken from: https://prisma.brendonovich.dev/extra/transactions
pub async fn create_transaction_with_log_receipt(
    db: Database,
    transaction: ethers::types::Transaction,
    log: ethers::types::Log,
    receipt: ethers::types::TransactionReceipt,
    chain_id: ethers::types::U256,
    timestamp: ethers::types::U256,
) -> AppJsonResult<transaction::Data> {
    let (tx, _log) = db
        ._transaction()
        .run(|client| async move {
            let tx = client
                .transaction()
                .create(
                    transaction.hash.to_string(),
                    chain_id.to_string(),
                    transaction.nonce.to_string(),
                    transaction.from.to_string(),
                    transaction.value.to_string(),
                    transaction.gas.to_string(),
                    transaction.input.to_string(),
                    transaction.v.to_string(),
                    transaction.r.to_string(),
                    transaction.s.to_string(),
                    DateTime::<FixedOffset>::from_utc(
                        NaiveDateTime::from_timestamp_opt(timestamp.as_u64() as i64, 0).unwrap(),
                        FixedOffset { local_minus_utc: 0 },
                    ),
                    vec![transaction::block_number::set(
                        receipt.block_number.map(|n| n.to_string()),
                    )],
                )
                .exec()
                .await?;

            client
                .receipt()
                .create(
                    transaction.hash.to_string(),
                    chain_id.to_string(),
                    receipt.block_hash.map(|bh| bh.to_string()),
                    receipt.cumulative_gas_used.to_string(),
                    receipt.status.map(|s| s.to_string()),
                    DateTime::<FixedOffset>::from_utc(
                        NaiveDateTime::from_timestamp_opt(timestamp.as_u64() as i64, 0).unwrap(),
                        FixedOffset { local_minus_utc: 0 },
                    ),
                    // receipt::transaction::connect(transaction::hash::equals(tx.hash.clone())),
                    vec![],
                )
                .exec()
                .await?;

            client
                .log()
                .create(
                    chain_id.to_string(),
                    log.data.to_string(),
                    vec![
                        log::transaction::connect(transaction::hash::equals(tx.hash.clone())),
                        log::topics::set(
                            log.topics.iter().map(|tx_hash| tx_hash.to_string()).collect(),
                        ),
                        log::block_hash::set(log.block_hash.map(|bh| bh.to_string())),
                        log::block_number::set(log.block_number.map(|bn| bn.to_string())),
                        log::transaction_hash::set(log.transaction_hash.map(|th| th.to_string())),
                        log::transaction_index::set(log.transaction_index.map(|ti| ti.to_string())),
                        log::transaction_log_index::set(
                            log.transaction_log_index.map(|lti| lti.to_string()),
                        ),
                        log::log_index::set(log.log_index.map(|li| li.to_string())),
                        log::log_type::set(log.log_type),
                        log::removed::set(log.removed),
                    ],
                )
                .exec()
                .await
                .map(|log| (tx, log))

            // let receipt = client
        })
        .await?;

    Ok(Json::from(tx))
}
