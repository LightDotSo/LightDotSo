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
use lightdotso_prisma::{log, user, wallet, PrismaClient};
use prisma_client_rust::NewClientError;
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
pub async fn create_wallet_with_log(
    db: Database,
    log: ethers::types::Log,
    chain_id: String,
    address: String,
    hash: String,
    testnet: Option<bool>,
) -> AppJsonResult<wallet::Data> {
    let (wallet, _log) = db
        ._transaction()
        .run(|client| async move {
            let wallet = client
                .wallet()
                .create(
                    address.clone(),
                    chain_id.clone(),
                    hash.clone(),
                    vec![wallet::testnet::set(testnet.unwrap_or(false))],
                )
                .exec()
                .await?;

            client
                .log()
                .create(
                    address.clone(),
                    chain_id.clone(),
                    log.data.to_string(),
                    vec![
                        log::wallet::connect(wallet::id::equals(wallet.id.clone())),
                        log::topics::set(
                            log.topics.iter().map(|tx_hash| tx_hash.to_string()).collect(),
                        ),
                        log::block_hash::set(log.block_hash.map(|bh| bh.to_string())),
                        log::block_number::set(log.block_number.map(|bn| bn.try_into().unwrap())),
                        log::transaction_hash::set(log.transaction_hash.map(|th| th.to_string())),
                        log::transaction_index::set(
                            log.transaction_index.map(|ti| ti.try_into().unwrap()),
                        ),
                        log::transaction_log_index::set(
                            log.transaction_log_index.map(|lti| lti.try_into().unwrap()),
                        ),
                        log::log_index::set(log.log_index.map(|li| li.try_into().unwrap())),
                        log::log_type::set(log.log_type),
                        log::removed::set(log.removed),
                    ],
                )
                .exec()
                .await
                // if query succeeds, return user + log from transaction
                .map(|log| (wallet, log))
        })
        .await?;

    Ok(Json::from(wallet))
}
