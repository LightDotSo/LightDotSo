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

#![allow(clippy::unwrap_used)]

use crate::{
    error::DbError,
    types::{AppJsonResult, Database},
};
use autometrics::autometrics;
use axum::extract::Json;
use ethers::{types::Bloom, utils::to_checksum};
use lightdotso_contracts::constants::MAINNET_CHAIN_IDS;
use lightdotso_prisma::{log, log_topic, receipt, transaction, wallet};
use lightdotso_tracing::{
    tracing::{info, info_span, trace},
    tracing_futures::Instrument,
};
use prisma_client_rust::{
    chrono::{DateTime, FixedOffset, NaiveDateTime},
    serde_json::{self, json},
};
use std::{collections::HashMap, sync::Arc};

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
        transaction::is_testnet::set(!MAINNET_CHAIN_IDS.contains_key(&(chain_id as u64))),
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

    let mut logs_upsert_items = Vec::new();

    for log in logs.iter() {
        let item = db
            .log()
            .upsert(
                log::UniqueWhereParam::TransactionHashLogIndexEquals(
                    format!("{:?}", transaction.hash),
                    log.log_index.unwrap().as_u64() as i64,
                ),
                log::create(
                    to_checksum(&log.address, None),
                    log.data.to_vec(),
                    vec![
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
        for (i, topic) in log.topics.iter().enumerate() {
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

    Ok(Json::from(tx_data))
}
