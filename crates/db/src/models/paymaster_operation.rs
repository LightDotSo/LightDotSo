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

use crate::types::Database;
use alloy::primitives::Address;
use autometrics::autometrics;
use eyre::Result;
use lightdotso_prisma::{
    chain, paymaster, paymaster_operation, user_operation, wallet, UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{chrono::DateTime, or, Direction};

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new paymaster operation
#[autometrics]
pub async fn create_paymaster_operation(
    db: Database,
    chain_id: i64,
    paymaster_address: Address,
    sender_address: Address,
    sender_nonce: i64,
    valid_until: i64,
    valid_after: i64,
) -> Result<(paymaster::Data, paymaster_operation::Data), eyre::Report> {
    info!("Creating new paymaster operation");

    let paymaster = db
        .paymaster()
        .upsert(
            paymaster::address_chain_id(paymaster_address.to_checksum(None), chain_id),
            paymaster::create(
                paymaster_address.to_checksum(None),
                chain::id::equals(chain_id),
                vec![],
            ),
            vec![],
        )
        .exec()
        .await?;
    info!(?paymaster);

    let paymaster_operation = db
        .paymaster_operation()
        .create(
            sender_nonce,
            DateTime::from_timestamp(valid_until, 0).unwrap().into(),
            DateTime::from_timestamp(valid_after, 0).unwrap().into(),
            paymaster::id::equals(paymaster.clone().id.clone()),
            wallet::address::equals(sender_address.to_checksum(None)),
            vec![],
        )
        .exec()
        .await?;
    info!(?paymaster_operation);

    Ok((paymaster, paymaster_operation))
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn get_most_recent_paymaster_operation_with_sender(
    db: Database,
    chain_id: i64,
    paymaster_address: Address,
    sender_address: Address,
) -> Result<Option<paymaster_operation::Data>> {
    info!("Getting paymaster sender nonce");

    // Find the paymaster
    let paymaster = db
        .paymaster()
        .find_unique(paymaster::address_chain_id(paymaster_address.to_checksum(None), chain_id))
        .exec()
        .await?;

    if let Some(paymaster) = paymaster {
        // Get the most recent paymaster operation
        let user_operation = db
            .user_operation()
            .find_first(vec![
                user_operation::chain_id::equals(chain_id),
                user_operation::sender::equals(sender_address.to_checksum(None)),
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
