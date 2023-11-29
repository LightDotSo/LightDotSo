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
use ethers::{
    types::{Bloom, H256, U256},
    utils::to_checksum,
};
use eyre::Result;
use lightdotso_contracts::{
    paymaster::decode_paymaster_and_data, types::UserOperationWithTransactionAndReceiptLogs,
};
use lightdotso_prisma::{
    log, log_topic, paymaster,
    paymaster_operation::{self, sender_nonce},
    receipt, transaction, transaction_category, user_operation, wallet, PrismaClient,
    UserOperationStatus,
};
use lightdotso_tracing::{
    tracing::{info, info_span, trace},
    tracing_futures::Instrument,
};
use prisma_client_rust::{
    chrono::{DateTime, FixedOffset, NaiveDateTime, Utc},
    serde_json::{self, json},
    Direction, NewClientError,
};
use std::{collections::HashMap, sync::Arc};
type Database = Arc<PrismaClient>;
type AppResult<T> = Result<T, DbError>;
type AppJsonResult<T> = AppResult<Json<T>>;

/// Create a new Prisma client.
pub async fn create_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;

    client
}

/// Create a new wallet.
#[autometrics]
pub async fn create_wallet_with_configuration(
    db: Database,
    address: ethers::types::H160,
    chain_id: i64,
    salt: H256,
    factory_address: ethers::types::H160,
) -> AppJsonResult<wallet::Data> {
    info!("Creating wallet at address: {:?} chain_id: {:?}", address, chain_id);

    let wallet = db
        .wallet()
        .create(
            to_checksum(&address, None),
            format!("{:?}", salt),
            to_checksum(&factory_address, None),
            vec![],
        )
        .exec()
        .await?;

    Ok(Json::from(wallet))
}

#[autometrics]
pub async fn create_transaction_category(
    db: Database,
    category: String,
    transaction_hash: ethers::types::H256,
) -> AppJsonResult<transaction_category::Data> {
    info!("Creating transaction category");

    let category = db
        .transaction_category()
        .create(
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
#[allow(clippy::too_many_arguments)]
pub async fn upsert_transaction_with_log_receipt(
    db: Database,
    wallet_address: ethers::types::H160,
    transaction: ethers::types::Transaction,
    logs: Vec<ethers::types::Log>,
    receipt: ethers::types::TransactionReceipt,
    chain_id: i64,
    timestamp: ethers::types::U256,
    trace: Option<ethers::types::GethTrace>,
) -> AppJsonResult<transaction::Data> {
    info!("Creating transaction with log and receipt");

    // Check if the wallet exists in the database
    let wallet = db
        .wallet()
        .find_unique(wallet::address::equals(to_checksum(&wallet_address, None)))
        .exec()
        .await?;

    // If wallet is none, throw an error
    if wallet.is_none() {
        return Err(DbError::NotFound);
    }

    // Arc the logs for later use
    let logs: Arc<Vec<ethers::types::Log>> = Arc::new(logs);
    let logs_clone = logs.clone();

    let mut transaction_params = vec![
        transaction::nonce::set(transaction.nonce.as_u64() as i64),
        transaction::input::set(Some(transaction.input.0.to_vec())),
        transaction::block_number::set(transaction.block_number.map(|n| n.as_u32() as i32)),
        transaction::to::set(transaction.to.map(|to| to_checksum(&to, None))),
        transaction::wallet_address::set(Some(to_checksum(&wallet_address, None))),
    ];

    // Don't push from the params if it is `Determistic Option Zero` or `Determistic Option None`.
    // `crates/graphql/src/traits.rs`
    if transaction.r != 0.into() {
        transaction_params.push(transaction::r::set(Some(transaction.r.to_string())))
    };
    if transaction.s != 0.into() {
        transaction_params.push(transaction::s::set(Some(transaction.s.to_string())))
    };
    if transaction.v != 0.into() {
        transaction_params.push(transaction::v::set(Some(transaction.v.to_string())))
    };
    if transaction.block_hash.is_some() {
        transaction_params.push(transaction::block_hash::set(
            transaction.block_hash.map(|bh| format!("{:?}", bh)),
        ))
    }
    if transaction.transaction_index.is_some() {
        transaction_params.push(transaction::transaction_index::set(
            transaction.transaction_index.map(|ti| ti.as_u32() as i32),
        ))
    }
    if transaction.gas != 0.into() {
        transaction_params.push(transaction::gas::set(Some(transaction.gas.to_string())))
    }
    if transaction.value != 0.into() {
        transaction_params.push(transaction::value::set(Some(transaction.value.to_string())))
    }
    if transaction.gas_price.is_some() {
        transaction_params
            .push(transaction::gas_price::set(transaction.gas_price.map(|gp| gp.as_u64() as i64)))
    }
    if transaction.transaction_type.is_some() {
        transaction_params.push(transaction::transaction_type::set(
            transaction.transaction_type.map(|gu| gu.as_u32() as i32),
        ))
    }
    if transaction.max_fee_per_gas.is_some() {
        transaction_params.push(transaction::max_fee_per_gas::set(
            transaction.max_fee_per_gas.map(|mfpg| mfpg.as_u64() as i64),
        ))
    }
    if transaction.max_priority_fee_per_gas.is_some() {
        transaction_params.push(transaction::max_priority_fee_per_gas::set(
            transaction.max_priority_fee_per_gas.map(|mpfpg| mpfpg.as_u64() as i64),
        ))
    }

    let tx_data = db
        .transaction()
        .upsert(
            transaction::hash::equals(format!("{:?}", transaction.hash)),
            transaction::create(
                format!("{:?}", transaction.hash),
                transaction.nonce.as_u64() as i64,
                to_checksum(&transaction.from, None),
                chain_id,
                DateTime::<FixedOffset>::from_utc(
                    NaiveDateTime::from_timestamp_opt(timestamp.as_u64() as i64, 0).unwrap(),
                    FixedOffset::east_opt(0).unwrap(),
                ),
                trace
                    .clone()
                    .map_or(json!({}), |t| serde_json::to_value(t).unwrap_or_else(|_| (json!({})))),
                transaction_params.clone(),
            ),
            transaction_params.clone(),
        )
        .exec()
        .instrument(info_span!("upsert_transaction"))
        .await?;
    trace!(?tx_data);

    // Don't push from the params if it is `Determistic Option Zero` or `Determistic Option None`.
    // `crates/graphql/src/traits.rs`
    let mut receipt_params = vec![
        receipt::block_number::set(receipt.block_number.map(|bn| bn.as_u32() as i32)),
        receipt::transaction_hash::set(format!("{:?}", receipt.transaction_hash)),
        receipt::transaction_index::set(receipt.transaction_index.as_u32() as i32),
        receipt::from::set(to_checksum(&receipt.from, None)),
        receipt::cumulative_gas_used::set(receipt.cumulative_gas_used.as_u64() as i64),
    ];

    if receipt.block_hash.is_some() {
        receipt_params
            .push(receipt::block_hash::set(receipt.block_hash.map(|bh| format!("{:?}", bh))))
    }
    if receipt.cumulative_gas_used != 0.into() {
        receipt_params
            .push(receipt::cumulative_gas_used::set(receipt.cumulative_gas_used.as_u64() as i64))
    }
    if receipt.gas_used.is_some() {
        receipt_params.push(receipt::gas_used::set(receipt.gas_used.map(|gu| gu.as_u64() as i64)))
    }
    if receipt.contract_address.is_some() {
        receipt_params.push(receipt::contract_address::set(
            receipt.contract_address.map(|ca| to_checksum(&ca, None)),
        ))
    }
    if receipt.status.is_some() {
        receipt_params.push(receipt::status::set(receipt.status.map(|s| s.as_u32() as i32)))
    }
    if receipt.logs_bloom == Bloom::default() {
        receipt_params.push(receipt::logs_bloom::set(Some(receipt.logs_bloom.0.into())))
    }
    if receipt.root.is_some() {
        receipt_params.push(receipt::root::set(receipt.root.map(|r| format!("{:?}", r))))
    }
    if receipt.to.is_some() {
        receipt_params.push(receipt::to::set(receipt.to.map(|to| format!("{:?}", to))))
    }
    if receipt.transaction_type.is_some() {
        receipt_params.push(receipt::transaction_type::set(
            receipt.transaction_type.map(|tt| tt.as_u32() as i32),
        ))
    }
    if receipt.effective_gas_price.is_some() {
        receipt_params.push(receipt::effective_gas_price::set(
            receipt.effective_gas_price.map(|egp| egp.as_u64() as i64),
        ))
    }

    let _receipt_data = db
        .receipt()
        .upsert(
            receipt::transaction_hash::equals(format!("{:?}", receipt.transaction_hash)),
            receipt::create(
                format!("{:?}", receipt.transaction_hash),
                receipt.transaction_index.as_u32() as i32,
                to_checksum(&receipt.from, None),
                receipt.cumulative_gas_used.as_u64() as i64,
                receipt_params.clone(),
            ),
            receipt_params.clone(),
        )
        .exec()
        .instrument(info_span!("upsert_receipt"))
        .await?;

    let log_creations = db
        ._transaction()
        .run(|client| async move {
            let logs_upsert_items = logs
                .clone()
                .iter()
                .map(|log| {
                    client.log().upsert(
                        log::UniqueWhereParam::TransactionHashLogIndexEquals(
                            format!("{:?}", transaction.hash),
                            log.log_index.unwrap().as_u64() as i64,
                        ),
                        log::create(
                            to_checksum(&log.address, None),
                            log.data.to_vec(),
                            vec![
                                log::block_hash::set(log.block_hash.map(|bh| format!("{:?}", bh))),
                                log::block_number::set(
                                    log.block_number.map(|bn| bn.as_u32() as i32),
                                ),
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
                        ),
                        vec![],
                    )
                })
                .collect::<Vec<_>>();

            client._batch(logs_upsert_items).await
        })
        .await?;

    // Iterate through the logs and get the log_topics for each log
    let mut log_topics: HashMap<_, _> = HashMap::new();

    for (log_creation, log) in log_creations.iter().zip(logs_clone.iter()) {
        for (i, topic) in log.topics.iter().enumerate() {
            info!(?topic, ?log_creation.id, i);
            // Insert the log topic w/ the index
            log_topics.insert(format!("{:?}-{}", topic, i), log_creation.id.clone());
        }
    }

    // Iterate through and upsert the log topics
    let _ = db
        ._transaction()
        .run(|client| async move {
            let log_topics_upsert_items = log_topics
                .iter()
                .map(|(log_topic_index, id)| {
                    client.log_topic().upsert(
                        log_topic::id::equals(log_topic_index.to_string()),
                        log_topic::create(
                            log_topic_index.to_string(),
                            vec![log_topic::logs::connect(vec![log::id::equals(id.to_string())])],
                        ),
                        vec![log_topic::logs::connect(vec![log::id::equals(id.to_string())])],
                    )
                })
                .collect::<Vec<_>>();

            client._batch(log_topics_upsert_items).await
        })
        .await?;

    Ok(Json::from(tx_data))
}

/// Create a new wallet.
#[autometrics]
pub async fn upsert_wallet_with_configuration(
    db: Database,
    address: ethers::types::H160,
    chain_id: i64,
    salt: H256,
    factory_address: ethers::types::H160,
) -> AppJsonResult<wallet::Data> {
    info!("Creating wallet at address: {:?} chain_id: {:?}", address, chain_id);

    let wallet = db
        .wallet()
        .upsert(
            wallet::address::equals(to_checksum(&address, None)),
            wallet::create(
                to_checksum(&address, None),
                format!("{:?}", salt),
                to_checksum(&factory_address, None),
                vec![],
            ),
            vec![],
        )
        .exec()
        .await?;

    Ok(Json::from(wallet))
}

#[autometrics]
pub async fn upsert_user_operation(
    db: Database,
    uow: UserOperationWithTransactionAndReceiptLogs,
    chain_id: i64,
) -> AppJsonResult<user_operation::Data> {
    info!("Creating user operation");

    let user_operation = db
        .user_operation()
        .upsert(
            user_operation::hash::equals(format!("{:?}", uow.hash)),
            user_operation::create(
                format!("{:?}", uow.hash),
                to_checksum(&uow.light_wallet, None),
                uow.nonce.unwrap_or(0.into()).as_u64() as i64,
                uow.init_code.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                uow.call_data.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                uow.call_gas_limit.unwrap_or(0.into()).as_u64() as i64,
                uow.verification_gas_limit.unwrap_or(0.into()).as_u64() as i64,
                uow.pre_verification_gas.unwrap_or(0.into()).as_u64() as i64,
                uow.max_fee_per_gas.unwrap_or(0.into()).as_u64() as i64,
                uow.max_priority_fee_per_gas.unwrap_or(0.into()).as_u64() as i64,
                uow.paymaster_and_data.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                chain_id,
                to_checksum(&uow.entry_point, None),
                wallet::address::equals(to_checksum(&uow.light_wallet, None)),
                vec![user_operation::signature::set(Some(
                    uow.signature.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                ))],
            ),
            vec![
                user_operation::status::set(UserOperationStatus::Executed),
                user_operation::transaction_hash::set(Some(format!("{:?}", uow.transaction.hash))),
            ],
        )
        .exec()
        .await?;

    // Upsert the paymaster if it exists
    if let Some(paymaster_and_data) = uow.paymaster_and_data {
        // Parse the paymaster and data
        let (paymaster_address, valid_until, valid_after, _) =
            decode_paymaster_and_data(paymaster_and_data.to_vec());

        let pm = db
            .paymaster()
            .upsert(
                paymaster::address_chain_id(to_checksum(&paymaster_address, None), chain_id),
                paymaster::create(
                    to_checksum(&paymaster_address, None),
                    chain_id,
                    vec![paymaster::user_operations::connect(vec![user_operation::hash::equals(
                        format!("{:?}", uow.hash),
                    )])],
                ),
                vec![paymaster::user_operations::connect(vec![user_operation::hash::equals(
                    format!("{:?}", uow.hash),
                )])],
            )
            .exec()
            .await?;

        let _ = db
            .paymaster_operation()
            .update(
                paymaster_operation::valid_after_paymaster_id(
                    DateTime::<Utc>::from_utc(
                        NaiveDateTime::from_timestamp_opt(valid_after as i64, 0).unwrap(),
                        Utc,
                    )
                    .into(),
                    pm.clone().id.clone(),
                ),
                vec![paymaster_operation::user_operations::connect(vec![
                    user_operation::hash::equals(format!("{:?}", uow.hash)),
                ])],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(user_operation))
}

#[autometrics]
pub async fn upsert_user_operation_logs(
    db: Database,
    uow: UserOperationWithTransactionAndReceiptLogs,
) -> AppJsonResult<()> {
    info!("Creating user operation");

    // Get the logs for the user operation
    let logs = db
        .log()
        .find_many(vec![log::transaction_hash::equals(Some(format!("{:?}", uow.transaction.hash)))])
        .exec()
        .await?;

    // Filter the logs by the user operation by the id in uow.logs
    let logs = logs
        .into_iter()
        .filter(|log| {
            uow.logs.iter().any(|l| {
                l.log_index == log.log_index.map(U256::from) &&
                    l.log_index.is_some() &&
                    log.log_index.is_some()
            })
        })
        .collect::<Vec<_>>();

    // Iterate over the logs and connect them to the user operation logs
    let _res = db
        ._transaction()
        .run(|client| async move {
            let log_update_items = logs
                .iter()
                .map(|log| {
                    client.user_operation().update(
                        user_operation::hash::equals(format!("{:?}", uow.hash)),
                        vec![user_operation::logs::connect(vec![log::id::equals(log.id.clone())])],
                    )
                })
                .collect::<Vec<_>>();

            client._batch(log_update_items).await
        })
        .await?;

    Ok(Json::from(()))
}

#[autometrics]
pub async fn create_paymaster_operation(
    db: Database,
    chain_id: i64,
    paymaster_address: ethers::types::H160,
    sender_address: ethers::types::H160,
    sender_nonce: i64,
    valid_until: i64,
    valid_after: i64,
) -> Result<paymaster_operation::Data, eyre::Report> {
    info!("Creating new paymaster operation");

    let paymaster = db
        .paymaster()
        .upsert(
            paymaster::address_chain_id(to_checksum(&paymaster_address, None), chain_id),
            paymaster::create(to_checksum(&paymaster_address, None), chain_id, vec![]),
            vec![],
        )
        .exec()
        .await?;
    info!(?paymaster);

    let paymaster_operation = db
        .paymaster_operation()
        .create(
            sender_nonce,
            DateTime::<Utc>::from_utc(
                NaiveDateTime::from_timestamp_opt(valid_until, 0).unwrap(),
                Utc,
            )
            .into(),
            DateTime::<Utc>::from_utc(
                NaiveDateTime::from_timestamp_opt(valid_after, 0).unwrap(),
                Utc,
            )
            .into(),
            paymaster::id::equals(paymaster.clone().id.clone()),
            wallet::address::equals(to_checksum(&sender_address, None)),
            vec![],
        )
        .exec()
        .await?;

    Ok(paymaster_operation)
}

#[autometrics]
pub async fn get_most_recent_paymaster_operation_with_sender(
    db: Database,
    chain_id: i64,
    paymaster_address: ethers::types::H160,
    sender_address: ethers::types::H160,
) -> Result<Option<paymaster_operation::Data>> {
    info!("Getting paymaster sender nonce");

    // Find the paymaster
    let paymaster = db
        .paymaster()
        .find_unique(paymaster::address_chain_id(to_checksum(&paymaster_address, None), chain_id))
        .exec()
        .await?;

    if let Some(paymaster) = paymaster {
        // Get the most recent paymaster operation
        let user_operation = db
            .user_operation()
            .find_first(vec![
                user_operation::chain_id::equals(chain_id),
                user_operation::sender::equals(to_checksum(&sender_address, None)),
                user_operation::status::equals(UserOperationStatus::Executed),
                user_operation::paymaster_id::equals(Some(paymaster.id)),
            ])
            .order_by(user_operation::nonce::order(Direction::Desc))
            .with(user_operation::paymaster_operation::fetch())
            .exec()
            .await?;
        info!(?user_operation);

        if let Some(user_operation) = user_operation {
            if let Some(Some(op)) = user_operation.paymaster_operation {
                return Ok(Some(*op));
            }
        }
    }

    Ok(None)
}

// Tests
#[cfg(test)]
mod tests {
    // use super::*;
    use ethers::types::Address;
    // use lightdotso_prisma::PrismaClient;

    #[test]
    fn test_display_address() {
        let address = Address::zero();
        assert_eq!(format!("{:?}", address), "0x0000000000000000000000000000000000000000");
    }

    // #[tokio::test]
    // FIXME: Blocked by `create_wallet_with_configuration_and_owners`
    // async fn test_create_wallet() {
    //     // Set the mocked db client
    //     let (client, _mock) = PrismaClient::_mock();
    //     let client = Arc::new(client);

    //     // Check the wallet is created
    //     _mock
    //         .expect(
    //             client.wallet().create(
    //                 format!("{:?}", Address::zero()),
    //                 3_i64,
    //                 format!("{:?}", Address::zero()),
    //                 vec![wallet::testnet::set(false)],
    //             ),
    //             wallet::Data {
    //                 id: "".to_string(),
    //                 address: format!("{:?}", Address::zero()),
    //                 chain_id: 3_i64,
    //                 factory_address: format!("{:?}", Address::zero()),
    //                 testnet: false,
    //                 created_at: DateTime::<FixedOffset>::from_utc(
    //                     NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
    //                     FixedOffset::east_opt(0).unwrap(),
    //                 ),
    //                 updated_at: DateTime::<FixedOffset>::from_utc(
    //                     NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
    //                     FixedOffset::east_opt(0).unwrap(),
    //                 ),
    //                 configuration: None,
    //                 users: Some(vec![]),
    //             },
    //         )
    //         .await;

    //     // Create a wallet
    //     let wallet =
    //         create_wallet(client, Address::zero(), 3_i64, Address::zero(), Some(false)).await;

    //     if let Ok(wallet) = wallet {
    //         assert_eq!(wallet.address, format!("{:?}", Address::zero()));
    //         assert_eq!(wallet.chain_id, 3_i64,);
    //         assert!(!wallet.testnet);
    //         assert_eq!(wallet.created_at.timestamp(), 0);
    //         assert_eq!(wallet.updated_at.timestamp(), 0);
    //         assert_eq!(wallet.users.clone().unwrap().len(), 0);
    //     }
    // }
}
