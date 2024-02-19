// Copyright 2023-2024 Light, Inc.
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
use autometrics::autometrics;
use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_prisma::{wallet, wallet_billing};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new billing operation
#[autometrics]
pub async fn create_billing_operation(
    db: Database,
    sender_address: ethers::types::H160,
) -> Result<()> {
    info!("Creating new billing operation");

    let wallet_with_billing = db
        .wallet()
        .find_unique(wallet::address::equals(to_checksum(&sender_address, None)))
        .with(wallet::wallet_billing::fetch().with(wallet_billing::billing::fetch()))
        .exec()
        .await?;
    info!(?wallet_with_billing);

    // Return error if billing is not found
    let billing = wallet_with_billing
        .unwrap()
        .wallet_billing
        .and_then(|wb| wb.map(|wb| wb.billing))
        .ok_or(eyre::eyre!("Wallet Billing not found"))?
        .ok_or(eyre::eyre!("Billing not found"))?;
    info!(?billing);

    // let billing_operation = db
    //     .billing_operation()
    //     .create(
    //         sender_nonce,
    //         DateTime::<Utc>::from_utc(
    //             NaiveDateTime::from_timestamp_opt(valid_until, 0).unwrap(),
    //             Utc,
    //         )
    //         .into(),
    //         DateTime::<Utc>::from_utc(
    //             NaiveDateTime::from_timestamp_opt(valid_after, 0).unwrap(),
    //             Utc,
    //         )
    //         .into(),
    //         billing::id::equals(billing.clone().id.clone()),
    //         wallet::address::equals(to_checksum(&sender_address, None)),
    //         vec![],
    //     )
    //     .exec()
    //     .await?;
    // info!(?billing_operation);

    Ok(())
}
