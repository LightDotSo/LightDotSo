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

use autometrics::autometrics;
use axum::extract::Json;
use ethers::{types::U256, utils::to_checksum};
use lightdotso_contracts::{
    constants::{LIGHT_PAYMASTER_ADDRESSES, MAINNET_CHAIN_IDS},
    paymaster::decode_paymaster_and_data,
    types::UserOperationWithTransactionAndReceiptLogs,
};
use lightdotso_prisma::{
    log, paymaster, paymaster_operation, user_operation, wallet, UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::chrono::{DateTime, NaiveDateTime, Utc};

use crate::types::{AppJsonResult, Database};

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

        // Parse the paymaster and data
        let (paymaster_address, _valid_until, valid_after, _sig) =
            decode_paymaster_and_data(paymaster_and_data.to_vec())?;

        // Upsert the paymaster if matches one of ours
        if LIGHT_PAYMASTER_ADDRESSES.contains(&paymaster_address) {
            info!("Upserting paymaster {:?}", paymaster_address);

            let pm = db
                .paymaster()
                .upsert(
                    paymaster::address_chain_id(to_checksum(&paymaster_address, None), chain_id),
                    paymaster::create(
                        to_checksum(&paymaster_address, None),
                        chain_id,
                        vec![paymaster::user_operations::connect(vec![
                            user_operation::hash::equals(format!("{:?}", uow.hash)),
                        ])],
                    ),
                    vec![paymaster::user_operations::connect(vec![user_operation::hash::equals(
                        format!("{:?}", uow.hash),
                    )])],
                )
                .exec()
                .await?;

            // Update the paymaster operation
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
                    vec![paymaster_operation::user_operation::connect(
                        user_operation::hash::equals(format!("{:?}", uow.hash)),
                    )],
                )
                .exec()
                .await?;
        }
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
                l.log_index == log.log_index.map(U256::from)
                    && l.log_index.is_some()
                    && log.log_index.is_some()
            })
        })
        .collect::<Vec<_>>();

    // Iterate over the logs and connect them to the user operation logs
    for log in logs.iter() {
        db.user_operation()
            .update(
                user_operation::hash::equals(format!("{:?}", uow.hash)),
                vec![
                    user_operation::logs::connect(vec![log::id::equals(log.id.clone())]),
                    user_operation::is_testnet::set(
                        !MAINNET_CHAIN_IDS.contains_key(&(uow.chain_id as u64)),
                    ),
                ],
            )
            .exec()
            .await?;
    }

    Ok(Json::from(()))
}
