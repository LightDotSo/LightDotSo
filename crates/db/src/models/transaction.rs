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

#![allow(clippy::unwrap_used)]

use crate::{
    error::DbError,
    models::log::DbLog,
    types::{AppJsonResult, Database},
};
use alloy::{
    primitives::{Address, B256, U256},
    rpc::types::{trace::geth::GethTrace, Log, Transaction, TransactionReceipt},
};
use autometrics::autometrics;
use axum::extract::Json;
use eyre::Result;
use lightdotso_prisma::{chain, log, log_topic, receipt, transaction, wallet};
use lightdotso_tracing::{
    tracing::{info, info_span, trace},
    tracing_futures::Instrument,
};
use lightdotso_utils::is_testnet;
use prisma_client_rust::{
    chrono::DateTime,
    serde_json::{self, json},
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};

// -----------------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------------

/// Taken from: https://prisma.brendonovich.dev/extra/transactions
#[autometrics]
#[allow(clippy::too_many_arguments)]
pub async fn upsert_transaction_with_log_receipt(
    db: Database,
    wallet_address: Address,
    transaction: Transaction,
    logs: Vec<Log>,
    receipt: TransactionReceipt,
    chain_id: i64,
    timestamp: u64,
    trace: Option<GethTrace>,
) -> AppJsonResult<transaction::Data> {
    info!("Creating transaction with log and receipt");

    // Check if the wallet exists in the database
    let wallet = db
        .wallet()
        .find_unique(wallet::address::equals(wallet_address.to_checksum(None)))
        .exec()
        .await?;

    // If wallet is none, throw an error
    if wallet.is_none() {
        return Err(DbError::NotFound);
    }

    // Arc the logs for later use
    let logs: Arc<Vec<Log>> = Arc::new(logs);
    let logs_clone = logs.clone();

    let mut transaction_params = vec![
        transaction::nonce::set(transaction.nonce as i64),
        transaction::input::set(Some(transaction.input.0.to_vec())),
        transaction::block_number::set(transaction.block_number.map(|n| n as i32)),
        transaction::to::set(transaction.to.map(|to| to.to_checksum(None))),
        transaction::is_testnet::set(is_testnet(chain_id as u64)),
    ];

    // Don't push from the params if it is `Determistic Option Zero` or `Determistic Option None`.
    // `crates/graphql/src/traits.rs`
    // if transaction.r != 0.into() {
    //     transaction_params.push(transaction::r::set(Some(transaction.r.to_string())))
    // };
    // if transaction.s != 0.into() {
    //     transaction_params.push(transaction::s::set(Some(transaction.s.to_string())))
    // };
    // if transaction.v != 0.into() {
    //     transaction_params.push(transaction::v::set(Some(transaction.v.to_string())))
    // };

    if transaction.block_hash.is_some() {
        transaction_params.push(transaction::block_hash::set(
            transaction.block_hash.map(|bh| format!("{:?}", bh)),
        ))
    }
    if transaction.transaction_index.is_some() {
        transaction_params.push(transaction::transaction_index::set(
            transaction.transaction_index.map(|ti| ti as i32),
        ))
    }
    if transaction.gas != 0_u64 {
        transaction_params.push(transaction::gas::set(Some(transaction.gas as i64)))
    }
    if transaction.value != U256::ZERO {
        transaction_params.push(transaction::value::set(Some(format!("{}", transaction.value))))
    }
    if transaction.gas_price.is_some() {
        transaction_params
            .push(transaction::gas_price::set(transaction.gas_price.map(|gp| gp as i64)))
    }
    if transaction.transaction_type.is_some() {
        transaction_params.push(transaction::transaction_type::set(
            transaction.transaction_type.map(|gu| gu as i32),
        ))
    }
    if transaction.max_fee_per_gas.is_some() {
        transaction_params.push(transaction::max_fee_per_gas::set(
            transaction.max_fee_per_gas.map(|mfpg| mfpg as i64),
        ))
    }
    if transaction.max_priority_fee_per_gas.is_some() {
        transaction_params.push(transaction::max_priority_fee_per_gas::set(
            transaction.max_priority_fee_per_gas.map(|mpfpg| mpfpg as i64),
        ))
    }

    let tx_data = db
        .transaction()
        .upsert(
            transaction::hash::equals(format!("{:?}", transaction.hash)),
            transaction::create(
                DateTime::from_timestamp(timestamp as i64, 0).unwrap().into(),
                trace
                    .clone()
                    .map_or(json!({}), |t| serde_json::to_value(t).unwrap_or_else(|_| (json!({})))),
                format!("{:?}", transaction.hash),
                transaction.nonce as i64,
                transaction.from.to_checksum(None),
                chain::id::equals(chain_id),
                transaction_params.clone(),
            ),
            transaction_params.clone(),
        )
        .exec()
        .instrument(info_span!("upsert_transaction"))
        .await?;
    trace!(?tx_data);

    // Set the relationship between the chain, wallet and the transaction
    let tx = db
        .transaction()
        .update(
            transaction::hash::equals(format!("{:?}", transaction.hash)),
            vec![
                transaction::chain::connect(chain::id::equals(chain_id)),
                transaction::wallets::connect(vec![wallet::address::equals(
                    wallet_address.to_checksum(None),
                )]),
            ],
        )
        .exec()
        .await?;

    // Don't push from the params if it is `Determistic Option Zero` or `Determistic Option None`.
    // `crates/graphql/src/traits.rs`
    let mut receipt_params = vec![
        receipt::block_number::set(receipt.block_number.map(|bn| bn as i32)),
        receipt::transaction_hash::set(format!("{:?}", receipt.transaction_hash)),
        receipt::transaction_index::set(receipt.transaction_index.unwrap_or(0) as i32),
        receipt::from::set(receipt.from.to_checksum(None)),
        receipt::gas_used::set(Some(receipt.gas_used as i64)),
        // receipt::cumulative_gas_used::set(receipt.cumulative_gas_used.low_u64() as i64),
        // receipt::status::set(receipt.status()),
    ];

    if receipt.block_hash.is_some() {
        receipt_params
            .push(receipt::block_hash::set(receipt.block_hash.map(|bh| format!("{:?}", bh))))
    }
    // if receipt.cumulative_gas_used != 0.into() {
    //     receipt_params
    //         .push(receipt::cumulative_gas_used::set(receipt.cumulative_gas_used.low_u64() as
    // i64)) }
    if receipt.contract_address.is_some() {
        receipt_params.push(receipt::contract_address::set(
            receipt.contract_address.map(|ca| ca.to_checksum(None)),
        ))
    }
    // if receipt.logs_bloom == Bloom::default() {
    //     receipt_params.push(receipt::logs_bloom::set(Some(receipt.logs_bloom.0.into())))
    // }
    // if receipt.root.is_some() {
    //     receipt_params.push(receipt::root::set(receipt.root.map(|r| format!("{:?}", r))))
    // }
    if receipt.to.is_some() {
        receipt_params.push(receipt::to::set(receipt.to.map(|to| format!("{:?}", to))))
    }
    // if receipt.transaction_type.is_some() {
    //     receipt_params.push(receipt::transaction_type::set(
    //         receipt.transaction_type.map(|tt| tt.as_u32() as i32),
    //     ))
    // }
    // if receipt.effective_gas_price.is_some() {
    //     receipt_params.push(receipt::effective_gas_price::set(
    //         receipt.effective_gas_price.map(|egp| egp.low_u64() as i64),
    //     ))
    // }

    let _receipt_data = db
        .receipt()
        .upsert(
            receipt::transaction_hash::equals(format!("{:?}", receipt.transaction_hash)),
            receipt::create(
                format!("{:?}", receipt.transaction_hash),
                receipt.transaction_index.unwrap_or(0) as i32,
                receipt.from.to_checksum(None),
                receipt.gas_used as i64,
                receipt_params.clone(),
            ),
            receipt_params.clone(),
        )
        .exec()
        .instrument(info_span!("upsert_receipt"))
        .await?;

    let mut logs_upsert_items = Vec::new();

    for log in logs.iter() {
        let item = db
            .log()
            .upsert(
                log::UniqueWhereParam::TransactionHashLogIndexEquals(
                    format!("{:?}", transaction.hash),
                    log.log_index.unwrap() as i64,
                ),
                log::create(
                    log.address().to_checksum(None),
                    log.data().data.to_vec(),
                    vec![
                        log::block_hash::set(log.block_hash.map(|bh| format!("{:?}", bh))),
                        log::block_number::set(log.block_number.map(|bn| bn as i32)),
                        log::transaction_hash::set(
                            log.transaction_hash.map(|th| format!("{:?}", th)),
                        ),
                        log::transaction_index::set(log.transaction_index.map(|ti| ti as i32)),
                        log::log_index::set(log.log_index.map(|li| li as i64)),
                        // log::transaction_log_index::set(
                        //     log.transaction_log_index.map(|lti| lti as i64),
                        // ),
                        // log::log_type::set(log.clone().log_type),
                        // log::removed::set(log.removed),
                    ],
                ),
                vec![],
            )
            .exec()
            .await?;

        logs_upsert_items.push(item);
    }

    //  Iterate through the logs and get the log_topics for each log
    let mut log_topics: HashMap<_, _> = HashMap::new();

    for (log_creation, log) in logs_upsert_items.iter().zip(logs_clone.iter()) {
        for (i, topic) in log.topics().iter().enumerate() {
            info!(?topic, ?log_creation.id, i);
            // Insert the log topic w/ the index
            log_topics.insert(format!("{:?}-{}", topic, i), log_creation.id.clone());
        }
    }

    // // Iterate through and upsert the log topics
    for (log_topic_index, id) in log_topics.iter() {
        db.log_topic()
            .upsert(
                log_topic::id::equals(log_topic_index.to_string()),
                log_topic::create(
                    log_topic_index.to_string(),
                    vec![log_topic::logs::connect(vec![log::id::equals(id.to_string())])],
                ),
                vec![log_topic::logs::connect(vec![log::id::equals(id.to_string())])],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(tx))
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

pub async fn get_transaction_with_logs(
    db: Database,
    transaction_hash: B256,
) -> Result<DbTransactionLogs> {
    info!("Getting transaction");

    // Get the transaction with the receipt and logs and log topics
    let transaction = db
        .transaction()
        .find_unique(transaction::hash::equals(format!("{:?}", transaction_hash)))
        .with(
            transaction::receipt::fetch()
                .with(receipt::logs::fetch(vec![]).with(log::topics::fetch(vec![]))),
        )
        .exec()
        .await?;

    // If transaction is none, throw an error
    let transaction = transaction.ok_or_else(|| DbError::NotFound)?;

    // Convert the transaction into a DbTransactionLogs
    let transaction_with_logs: DbTransactionLogs = transaction.try_into()?;

    // Return the transaction with logs
    Ok(transaction_with_logs)
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DbTransactionLogs {
    pub transaction: transaction::Data,
    pub logs: Vec<Log>,
}

impl TryFrom<transaction::Data> for DbTransactionLogs {
    type Error = eyre::Report;

    fn try_from(transaction: transaction::Data) -> Result<Self, Self::Error> {
        let receipt = transaction.clone().receipt.unwrap().unwrap();

        let receipt_logs = receipt.logs.unwrap().into_iter().collect::<Vec<_>>();

        let db_logs =
            receipt_logs.into_iter().map(|l| l.try_into()).collect::<Result<Vec<DbLog>, _>>()?;

        let logs = db_logs.into_iter().map(|l| l.log).collect::<Vec<Log>>();

        Ok(Self { transaction, logs })
    }
}
