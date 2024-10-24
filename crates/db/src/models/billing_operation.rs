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
use eyre::{eyre, Result};
use lightdotso_prisma::{
    billing, paymaster_operation, wallet, wallet_billing, BillingOperationStatus,
};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new billing operation
#[autometrics]
pub async fn create_billing_operation(
    db: Database,
    sender_address: Address,
    paymaster_operation_id: String,
    pending_usd: f64,
) -> Result<()> {
    info!("Creating new billing operation");

    let wallet_with_billing = db
        .wallet()
        .find_unique(wallet::address::equals(sender_address.to_checksum(None)))
        .with(wallet::wallet_billing::fetch().with(wallet_billing::billing::fetch()))
        .exec()
        .await?;
    info!(?wallet_with_billing);

    // Return error if billing is not found
    let billing = wallet_with_billing
        .unwrap()
        .wallet_billing
        .and_then(|wb| wb.map(|wb| wb.billing))
        .ok_or(eyre!("Wallet billing not found"))?
        .ok_or(eyre!("Billing not found"))?;
    info!(?billing);

    let billing_operation = db
        .billing_operation()
        .create(
            pending_usd,
            BillingOperationStatus::Pending,
            billing::id::equals(billing.id),
            paymaster_operation::id::equals(paymaster_operation_id),
            vec![],
        )
        .exec()
        .await?;
    info!(?billing_operation);

    Ok(())
}
