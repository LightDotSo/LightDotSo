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
use autometrics::autometrics;
use axum::extract::Json;
use ethers::{
    types::{Bytes, Log, H256, U256},
    utils::to_checksum,
};
use eyre::Result;
use lightdotso_contracts::{
    paymaster::decode_paymaster_and_data,
    types::{UserOperation, UserOperationReceipt, UserOperationWithTransactionAndReceiptLogs},
    utils::is_testnet,
};
use lightdotso_prisma::{
    chain, log, paymaster, paymaster_operation, transaction, user_operation, wallet,
    UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn update_user_operation_with_receipt(
    db: Database,
    user_operation_hash: H256,
    user_operation_receipt: UserOperationReceipt,
) -> AppJsonResult<()> {
    info!("Updating user operation status");

    // Update the user operation status
    db.user_operation()
        .update(
            user_operation::hash::equals(format!("{:?}", user_operation_hash)),
            vec![
                user_operation::status::set(if user_operation_receipt.success {
                    UserOperationStatus::Executed
                } else {
                    UserOperationStatus::Reverted
                }),
                user_operation::transaction_hash::set(Some(format!(
                    "{:?}",
                    user_operation_receipt.tx_receipt.transaction_hash
                ))),
            ],
        )
        .exec()
        .await?;

    Ok(Json::from(()))
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
                to_checksum(&uow.entry_point, None),
                format!("{:?}", uow.hash),
                uow.nonce.unwrap_or(0.into()).low_u64() as i64,
                uow.init_code.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                uow.call_data.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                uow.call_gas_limit.unwrap_or(0.into()).low_u64() as i64,
                uow.verification_gas_limit.unwrap_or(0.into()).low_u64() as i64,
                uow.pre_verification_gas.unwrap_or(0.into()).low_u64() as i64,
                uow.max_fee_per_gas.unwrap_or(0.into()).low_u64() as i64,
                uow.max_priority_fee_per_gas.unwrap_or(0.into()).low_u64() as i64,
                uow.paymaster_and_data.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                chain::id::equals(chain_id),
                wallet::address::equals(to_checksum(&uow.light_wallet, None)),
                vec![user_operation::signature::set(Some(
                    uow.signature.clone().unwrap_or_else(|| vec![].into()).to_vec(),
                ))],
            ),
            vec![
                user_operation::status::set(if uow.is_reverted {
                    UserOperationStatus::Reverted
                } else {
                    UserOperationStatus::Executed
                }),
                user_operation::transaction_hash::set(Some(format!("{:?}", uow.transaction.hash))),
            ],
        )
        .exec()
        .await?;

    // Upsert the paymaster if it exists
    if let Some(paymaster_and_data) = uow.paymaster_and_data {
        info!("Upserting paymaster operation");

        // Parse the paymaster and data, and upsert the paymaster if decoded successfully
        let _ =
            upsert_paymaster_and_data(db.clone(), chain_id, paymaster_and_data, uow.hash).await?;
    }

    Ok(Json::from(user_operation))
}

#[autometrics]
pub async fn upsert_paymaster_and_data(
    db: Database,
    chain_id: i64,
    paymaster_and_data: Bytes,
    user_operation_hash: H256,
) -> AppJsonResult<()> {
    info!("Upserting paymaster and data");

    // Parse the paymaster and data, and upsert the paymaster if decoded successfully
    if let Ok((paymaster_address, valid_until, valid_after, _sig)) =
        decode_paymaster_and_data(paymaster_and_data.to_vec())
    {
        // Upsert the paymaster if matches one of ours
        info!("Upserting paymaster {:?}", paymaster_address);

        let pm = db
            .paymaster()
            .upsert(
                paymaster::address_chain_id(to_checksum(&paymaster_address, None), chain_id),
                paymaster::create(
                    to_checksum(&paymaster_address, None),
                    chain::id::equals(chain_id),
                    vec![paymaster::user_operations::connect(vec![user_operation::hash::equals(
                        format!("{:?}", user_operation_hash),
                    )])],
                ),
                vec![paymaster::user_operations::connect(vec![user_operation::hash::equals(
                    format!("{:?}", user_operation_hash),
                )])],
            )
            .exec()
            .await?;

        // Update the paymaster operation
        let _ = db
            .paymaster_operation()
            .update(
                paymaster_operation::valid_until_valid_after_paymaster_id(
                    DateTime::<Utc>::from_utc(
                        NaiveDateTime::from_timestamp_opt(valid_until as i64, 0).unwrap(),
                        Utc,
                    )
                    .into(),
                    DateTime::<Utc>::from_utc(
                        NaiveDateTime::from_timestamp_opt(valid_after as i64, 0).unwrap(),
                        Utc,
                    )
                    .into(),
                    pm.clone().id.clone(),
                ),
                vec![paymaster_operation::user_operation::connect(user_operation::hash::equals(
                    format!("{:?}", user_operation_hash),
                ))],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(()))
}

#[autometrics]
pub async fn upsert_user_operation_logs(
    db: Database,
    chain_id: i64,
    transaction_hash: H256,
    user_operation_hash: H256,
    user_operation_logs: Vec<Log>,
) -> AppJsonResult<()> {
    info!("Creating user operation");

    // Get the logs for the user operation
    let logs = db
        .log()
        .find_many(vec![log::transaction_hash::equals(Some(format!("{:?}", transaction_hash)))])
        .exec()
        .await?;

    // Filter the logs by the user operation by the id in uow.logs
    let logs = logs
        .into_iter()
        .filter(|log| {
            user_operation_logs.iter().any(|l| {
                l.log_index == log.log_index.map(U256::from) &&
                    l.log_index.is_some() &&
                    log.log_index.is_some()
            })
        })
        .collect::<Vec<_>>();

    // Iterate over the logs and connect them to the user operation logs
    for log in logs.iter() {
        db.user_operation()
            .update(
                user_operation::hash::equals(format!("{:?}", user_operation_hash)),
                vec![
                    user_operation::logs::connect(vec![log::id::equals(log.id.clone())]),
                    user_operation::is_testnet::set(is_testnet(chain_id as u64)),
                ],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(()))
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

pub async fn get_user_operation_with_chain_id(
    db: Database,
    user_operation_hash: ethers::types::H256,
) -> Result<(UserOperation, u64)> {
    info!("Getting user operation");

    // Get the user operation
    let user_operation = db
        .user_operation()
        .find_unique(user_operation::hash::equals(format!("{:?}", user_operation_hash)))
        .exec()
        .await?;

    // If user operation is none, throw an error
    let user_operation_data = user_operation.ok_or_else(|| DbError::NotFound)?;

    // Convert the user operation into a UserOperation
    let user_operation = user_operation_data.clone().into();

    // Return the user operation
    Ok((user_operation, user_operation_data.chain_id as u64))
}

pub async fn get_user_operation_with_logs(
    db: Database,
    user_operation_hash: ethers::types::H256,
) -> Result<DbUserOperationLogs> {
    info!("Getting user operation");

    // Get the user operation with the receipt and logs and log topics
    let user_operation = db
        .user_operation()
        .find_unique(user_operation::hash::equals(format!("{:?}", user_operation_hash)))
        .with(user_operation::logs::fetch(vec![]).with(log::topics::fetch(vec![])))
        .with(user_operation::transaction::fetch())
        .exec()
        .await?;

    // If user operation is none, throw an error
    let user_operation = user_operation.ok_or_else(|| DbError::NotFound)?;

    // Convert the user operation into a DbUserOperationLogs
    let user_operation_with_logs: DbUserOperationLogs = user_operation.try_into()?;

    // Return the transaction with logs
    Ok(user_operation_with_logs)
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbUserOperationLogs {
    pub transaction: Option<transaction::Data>,
    pub user_operation: user_operation::Data,
    pub logs: Vec<ethers_main::types::Log>,
}

impl TryFrom<user_operation::Data> for DbUserOperationLogs {
    type Error = eyre::Report;

    fn try_from(user_operation: user_operation::Data) -> Result<Self, Self::Error> {
        let transaction = user_operation.clone().transaction.unwrap().map(|tx| *tx);

        let logs = user_operation.clone().logs.unwrap().into_iter().collect::<Vec<_>>();

        let db_logs = logs.into_iter().map(|l| l.try_into()).collect::<Result<Vec<DbLog>, _>>()?;

        let logs = db_logs.into_iter().map(|l| l.log).collect::<Vec<ethers_main::types::Log>>();

        Ok(Self { transaction, user_operation, logs })
    }
}
