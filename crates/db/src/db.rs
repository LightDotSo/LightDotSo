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

use crate::error::DbError;
use autometrics::autometrics;
use axum::extract::Json;
use ethers::utils::to_checksum;
use lightdotso_prisma::{
    log, receipt, transaction, transaction_category, user, wallet, PrismaClient,
};
use prisma_client_rust::{
    chrono::{DateTime, FixedOffset, NaiveDateTime},
    NewClientError,
};
use std::sync::Arc;
use tracing::{info, trace};
use tracing_futures::Instrument;
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
#[autometrics]
pub async fn create_wallet(
    db: Database,
    log: ethers::types::Log,
    chain_id: i64,
    factory_address: ethers::types::H160,
    testnet: Option<bool>,
) -> AppJsonResult<wallet::Data> {
    info!("Creating wallet");

    let wallet = db
        .wallet()
        .create(
            to_checksum(&log.address, None),
            chain_id,
            to_checksum(&factory_address, None),
            // Parse the log indexed data as a string.
            log.data.to_string(),
            vec![wallet::testnet::set(testnet.unwrap_or(false))],
        )
        .exec()
        .await?;

    Ok(Json::from(wallet))
}

pub async fn create_transaction_category(
    db: Database,
    address: ethers::types::H160,
    category: String,
    transaction_hash: ethers::types::H256,
) -> AppJsonResult<transaction_category::Data> {
    info!("Creating transaction category");

    let category = db
        .transaction_category()
        .create(
            to_checksum(&address, None),
            category,
            transaction::UniqueWhereParam::HashEquals(format!("{:?}", transaction_hash)),
            vec![],
        )
        .exec()
        .await?;

    Ok(Json::from(category))
}

/// Taken from: https://prisma.brendonovich.dev/extra/transactions
#[autometrics]
pub async fn create_transaction_with_log_receipt(
    db: Database,
    transaction: ethers::types::Transaction,
    logs: Vec<ethers::types::Log>,
    receipt: ethers::types::TransactionReceipt,
    chain_id: i64,
    timestamp: ethers::types::U256,
    trace: Option<ethers::types::Trace>,
) -> AppJsonResult<transaction::Data> {
    info!("Creating transaction with log and receipt");

    let (tx, _receipt) = db
        ._transaction()
        .run(|client| async move {
            let tx_data = client
                .transaction()
                .create(
                    format!("{:?}", transaction.hash),
                    transaction.nonce.as_u64() as i64,
                    to_checksum(&transaction.from, None),
                    transaction.value.to_string(),
                    transaction.gas.to_string(),
                    transaction.input.to_string(),
                    transaction.v.to_string(),
                    transaction.r.to_string(),
                    transaction.s.to_string(),
                    chain_id,
                    DateTime::<FixedOffset>::from_utc(
                        NaiveDateTime::from_timestamp_opt(timestamp.as_u64() as i64, 0).unwrap(),
                        FixedOffset::east_opt(0).unwrap(),
                    ),
                    trace.map_or(serde_json::Value::Null, |t| {
                        serde_json::to_value(t).unwrap_or_else(|_| serde_json::Value::Null)
                    }),
                    vec![
                        transaction::block_hash::set(
                            transaction.block_hash.map(|bh| format!("{:?}", bh)),
                        ),
                        transaction::block_number::set(
                            transaction.block_number.map(|n| n.as_u32() as i32),
                        ),
                        transaction::transaction_index::set(
                            transaction.transaction_index.map(|ti| ti.as_u32() as i32),
                        ),
                        transaction::to::set(transaction.to.map(|to| to_checksum(&to, None))),
                        transaction::gas_price::set(
                            transaction.gas_price.map(|gp| gp.as_u64() as i64),
                        ),
                        transaction::transaction_type::set(
                            transaction.transaction_type.map(|gu| gu.as_u32() as i32),
                        ),
                        transaction::max_priority_fee_per_gas::set(
                            transaction.max_priority_fee_per_gas.map(|mpfpg| mpfpg.as_u64() as i64),
                        ),
                        transaction::max_fee_per_gas::set(
                            transaction.max_fee_per_gas.map(|mfpg| mfpg.as_u64() as i64),
                        ),
                    ],
                )
                .exec()
                .instrument(tracing::info_span!("create_transaction"))
                .await?;
            trace!(?tx_data);

            client
                .receipt()
                .create(
                    format!("{:?}", receipt.transaction_hash),
                    receipt.transaction_index.as_u32() as i32,
                    to_checksum(&receipt.from, None),
                    receipt.cumulative_gas_used.as_u64() as i64,
                    receipt.logs_bloom.to_string(),
                    vec![
                        receipt::block_hash::set(receipt.block_hash.map(|bh| format!("{:?}", bh))),
                        receipt::block_number::set(
                            receipt.block_number.map(|bn| bn.as_u32() as i32),
                        ),
                        receipt::to::set(receipt.to.map(|to| format!("{:?}", to))),
                        receipt::gas_used::set(receipt.gas_used.map(|gu| gu.as_u64() as i64)),
                        receipt::contract_address::set(
                            receipt.contract_address.map(|ca| to_checksum(&ca, None)),
                        ),
                        receipt::status::set(receipt.status.map(|s| s.as_u32() as i32)),
                        receipt::transaction_type::set(
                            receipt.transaction_type.map(|tt| tt.as_u32() as i32),
                        ),
                        receipt::effective_gas_price::set(
                            receipt.effective_gas_price.map(|egp| egp.as_u64() as i64),
                        ),
                    ],
                )
                .exec()
                .instrument(tracing::info_span!("create_receipt"))
                .await
                .map(|op| (tx_data, op))
        })
        .await?;

    // FIXME: This is a workaround for the fact that the log batch creation cannot be batched w/
    // transaction and receipt
    let _ = db
        ._transaction()
        .run(|client| async move {
            let logs_create_items = logs
                .iter()
                .map(|log| {
                    client.log().create(
                        to_checksum(&log.address, None),
                        log.data.to_string(),
                        vec![
                            log::topics::set(
                                log.topics.iter().map(|topic| format!("{:?}", topic)).collect(),
                            ),
                            log::block_hash::set(log.block_hash.map(|bh| format!("{:?}", bh))),
                            log::block_number::set(log.block_number.map(|bn| bn.as_u32() as i32)),
                            log::transaction_hash::set(
                                log.transaction_hash.map(|th| format!("{:?}", th)),
                            ),
                            log::transaction_index::set(
                                log.transaction_index.map(|ti| ti.as_u32() as i32),
                            ),
                            log::log_index::set(log.log_index.map(|li| li.as_u64() as i64)),
                            log::transaction_log_index::set(
                                log.transaction_log_index.map(|lti| lti.as_u64() as i64),
                            ),
                            log::log_type::set(log.clone().log_type),
                            log::removed::set(log.removed),
                        ],
                    )
                })
                .collect::<Vec<_>>();

            client._batch(logs_create_items).await
        })
        .await?;

    Ok(Json::from(tx))
}

// Tests
#[cfg(test)]
mod tests {
    use super::*;
    use ethers::types::{Address, Log};
    use lightdotso_prisma::PrismaClient;

    #[test]
    fn test_display_address() {
        let address = Address::zero();
        assert_eq!(format!("{:?}", address), "0x0000000000000000000000000000000000000000");
    }

    #[tokio::test]
    async fn test_create_wallet() {
        let log = Log {
            address: Address::zero(),
            block_hash: Some(
                "0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2"
                    .parse()
                    .unwrap(),
            ),
            block_number: Some(0x5daf3b.into()),
            data: "0x68656c6c6f21".parse().unwrap(),
            transaction_hash: Some(
                "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
                    .parse()
                    .unwrap(),
            ),
            transaction_index: Some(0x41.into()),
            log_index: Some(0x1.into()),
            transaction_log_index: Some(0x0.into()),
            log_type: None,
            removed: Some(false),
            topics: vec![
                "bd9bb67345a2fcc8ef3b0857e7e2901f5a0dcfc7fe5e3c10dc984f02842fb7ba".parse().unwrap(),
                "000000000000000000000000000000000000000000000000000000000000007b".parse().unwrap(),
            ],
        };

        // Set the mocked db client
        let (client, _mock) = PrismaClient::_mock();
        let client = Arc::new(client);

        // Check the wallet is created
        _mock
            .expect(
                client.wallet().create(
                    format!("{:?}", log.address),
                    3_i64,
                    format!("{:?}", Address::zero()),
                    log.data.to_string(),
                    vec![wallet::testnet::set(false)],
                ),
                wallet::Data {
                    id: "".to_string(),
                    address: format!("{:?}", Address::zero()),
                    chain_id: 3_i64,
                    factory_address: format!("{:?}", Address::zero()),
                    hash: "".to_string(),
                    testnet: false,
                    created_at: DateTime::<FixedOffset>::from_utc(
                        NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
                        FixedOffset::east_opt(0).unwrap(),
                    ),
                    updated_at: DateTime::<FixedOffset>::from_utc(
                        NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
                        FixedOffset::east_opt(0).unwrap(),
                    ),
                    users: Some(vec![]),
                },
            )
            .await;

        // Create a wallet
        let wallet = create_wallet(client, log, 3_i64, Address::zero(), Some(false)).await;

        if let Ok(wallet) = wallet {
            assert_eq!(wallet.address, format!("{:?}", Address::zero()));
            assert_eq!(wallet.chain_id, 3_i64,);
            assert_eq!(wallet.hash, "".to_string());
            assert!(!wallet.testnet);
            assert_eq!(wallet.created_at.timestamp(), 0);
            assert_eq!(wallet.updated_at.timestamp(), 0);
            assert_eq!(wallet.users.clone().unwrap().len(), 0);
        }
    }
}
