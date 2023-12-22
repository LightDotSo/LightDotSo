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

use crate::types::Database;
use autometrics::autometrics;
use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_prisma::{
    paymaster, paymaster_operation, user_operation, wallet, UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{
    chrono::{DateTime, NaiveDateTime, Utc},
    or, Direction,
};

/// Create a new paymaster operation
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
                user_operation::paymaster_id::equals(Some(paymaster.id)),
                or![
                    user_operation::status::equals(UserOperationStatus::Executed),
                    user_operation::status::equals(UserOperationStatus::Reverted)
                ],
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
